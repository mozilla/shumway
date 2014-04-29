/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Shumway.GFX.GL {
  import Color = Shumway.Color;
  var SCRATCH_CANVAS_SIZE = 1024;

  export var TILE_SIZE = 256;
  export var MIN_UNTILED_SIZE = 256;

  function getTileSize(bounds: Rectangle): number {
    if (bounds.w < TILE_SIZE || bounds.h < TILE_SIZE) {
      return Math.min(bounds.w, bounds.h);
    }
    return TILE_SIZE;
  }

  import Point = Geometry.Point;
  import Point3D = Geometry.Point3D;
  import Matrix = Geometry.Matrix;
  import Matrix3D = Geometry.Matrix3D;
  import Rectangle = Geometry.Rectangle;
  import RegionAllocator = Geometry.RegionAllocator;
  import RenderableTileCache = Geometry.RenderableTileCache;

  import Frame = Shumway.GFX.Frame;
  import Stage = Shumway.GFX.Stage;
  import Shape = Shumway.GFX.Shape;
  import SolidRectangle = Shumway.GFX.SolidRectangle;
  import Filter = Shumway.GFX.Filter;
  import BlurFilter = Shumway.GFX.BlurFilter;
  import ColorMatrix = Shumway.GFX.ColorMatrix;
  import VisitorFlags = Shumway.GFX.VisitorFlags;

  import TileCache = Geometry.TileCache;
  import Tile = Geometry.Tile;
  import OBB = Geometry.OBB;

  import radianToDegrees = Geometry.radianToDegrees;
  import degreesToRadian = Geometry.degreesToRadian;

  export class Vertex extends Geometry.Point3D {
    constructor (x: number, y: number, z: number) {
      super(x, y, z);
    }
    static createEmptyVertices<T extends Vertex>(type: new (x: number, y: number, z: number) => T, count: number): T [] {
      var result = [];
      for (var i = 0; i < count; i++) {
        result.push(new type(0, 0, 0));
      }
      return result;
    }
  }

  export class WebGLTextureRegion implements ILinkedListNode<WebGLTextureRegion> {
    texture: WebGLTexture;
    region: RegionAllocator.Region;
    uses: number = 0;
    next: WebGLTextureRegion;
    previous: WebGLTextureRegion;
    constructor(texture: WebGLTexture, region: RegionAllocator.Region) {
      this.texture = texture;
      this.region = region;
      this.texture.regions.push(this);
      this.next = this.previous = null;
    }
  }

  export class WebGLTextureAtlas {
    texture: WebGLTexture;

    private _context: WebGLContext;
    private _regionAllocator: RegionAllocator.IRegionAllocator;
    private _w: number;
    private _h: number;
    private _compact: boolean;

    get compact(): boolean {
      return this._compact;
    }

    get w(): number {
      return this._w;
    }

    get h(): number {
      return this._h;
    }

    constructor(context: WebGLContext, texture: WebGLTexture, w: number, h: number, compact: boolean) {
      this._context = context;
      this.texture = texture;
      this._w = w;
      this._h = h;
      this._compact = compact;
      this.reset();
    }

    add(image: any, w: number, h: number): RegionAllocator.Region {
      var gl = this._context.gl;
      var region = this._regionAllocator.allocate(w, h);
      if (!region) {
        return;
      }
      if (image) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        timeline && timeline.enter("texSubImage2D");
        gl.texSubImage2D(gl.TEXTURE_2D, 0, region.x, region.y, gl.RGBA, gl.UNSIGNED_BYTE, image);
        traceLevel >= TraceLevel.Verbose && writer.writeLn("texSubImage2D: " + region);
        timeline && timeline.leave("texSubImage2D");
        count("texSubImage2D");
      }
      return region;
    }

    remove(region: RegionAllocator.Region) {
      this._regionAllocator.free(region);
    }

    reset() {
      if (this._compact) {
        this._regionAllocator = new RegionAllocator.Compact(this._w, this._h);
      } else {
        this._regionAllocator = new RegionAllocator.Grid(this._w, this._h, TILE_SIZE);
      }
    }
  }

  export class WebGLStageRendererOptions extends StageRendererOptions {
    maxTextures: number = 8;
    maxTextureSize: number = 2048;
    perspectiveCamera: boolean;
    perspectiveCameraDistance: number;
    perspectiveCameraFOV: number;
    perspectiveCameraAngle: number;

    /**
     * Ignores viewport clipping, this is useful to check of viewport culling is working
     * corectly.
     */
    ignoreViewport: boolean;

    /**
     * Sometimes it's useful to temporarily disable texture uploads to see if rendering
     * is texture upload bound.
     */
    disableTextureUploads: boolean;
    frameSpacing: number = 0.01;
    ignoreColorMatrix: boolean;
    drawTiles: boolean;
    drawElements: boolean = true;
    drawTextures: boolean = true;
    drawTexture: number = -1;
  }

  export class WebGLStageRenderer extends StageRenderer {
    context: WebGLContext;
    private _options: WebGLStageRendererOptions;
    private _viewport: Rectangle;

    private _brush: WebGLCombinedBrush;
    private _brushGeometry: WebGLGeometry;

    private _stencilBrush: WebGLCombinedBrush;
    private _stencilBrushGeometry: WebGLGeometry;

    private _tmpVertices: Vertex [] = Vertex.createEmptyVertices(Vertex, 64);

    private _scratchCanvas: HTMLCanvasElement;
    private _scratchCanvasContext: CanvasRenderingContext2D;
    private _dynamicScratchCanvas: HTMLCanvasElement;
    private _dynamicScratchCanvasContext: CanvasRenderingContext2D;
    private _uploadCanvas: HTMLCanvasElement;
    private _uploadCanvasContext: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement, stage: Stage,
                options: WebGLStageRendererOptions = new WebGLStageRendererOptions()) {
      super(canvas, stage);

      this._options = options;
      var context = this.context = new WebGLContext(this._canvas, options);

      canvas.addEventListener('resize', this.resize.bind(this), false);
      this.resize();

      this._brushGeometry = new WebGLGeometry(context);
      this._brush = new WebGLCombinedBrush(context, this._brushGeometry);

      this._stencilBrushGeometry = new WebGLGeometry(context);
      this._stencilBrush = new WebGLCombinedBrush(context, this._stencilBrushGeometry);

      this._scratchCanvas = document.createElement("canvas");
      this._scratchCanvas.width = this._scratchCanvas.height = SCRATCH_CANVAS_SIZE;
      this._scratchCanvasContext = this._scratchCanvas.getContext("2d", {
        willReadFrequently: true
      });

      this._dynamicScratchCanvas = document.createElement("canvas");
      this._dynamicScratchCanvas.width = this._dynamicScratchCanvas.height = 0;
      this._dynamicScratchCanvasContext = this._dynamicScratchCanvas.getContext("2d", {
        willReadFrequently: true
      });

      this._uploadCanvas = document.createElement("canvas");
      this._uploadCanvas.width = this._uploadCanvas.height = 0;
      this._uploadCanvasContext = this._uploadCanvas.getContext("2d", {
        willReadFrequently: true
      });

//      document.getElementById("stageContainer").appendChild(this._uploadCanvas);
//      document.getElementById("stageContainer").appendChild(this._scratchCanvas);
    }

    private _cachedTiles = [];

    private resize() {
      this._viewport = new Rectangle(0, 0, this._canvas.width, this._canvas.height);
    }

    private _cacheImageCallback(oldTextureRegion: WebGLTextureRegion, src: CanvasRenderingContext2D, srcBounds: Rectangle): WebGLTextureRegion {
      /*
       * To avoid seeming caused by linear texture sampling we need to pad each atlased image with a 1 pixel border that duplicates
       * edge pixels, similar to CLAMP_TO_EDGE
       *
       * See the discussion here: http://gamedev.stackexchange.com/questions/61796/sprite-sheet-textures-picking-up-edges-of-adjacent-texture
       *
       * For the image:
       *
       *    +---+
       *    |123|
       *    |456|
       *    |789|
       *    +---+
       *
       * We instead create:
       *
       *  +-------+
       *  |? 123 ?|
       *  | +---+ |
       *  |1|123|3|
       *  |4|456|6|
       *  |7|789|9|
       *  | +---+ |
       *  |? 789 ?|
       *  +-------+
       *
       *  I don't know what to do about corners yet. Might not be a problem, I don't see any artifacts if they are left empty.
       */

      var w  = srcBounds.w;
      var h  = srcBounds.h;
      var sx = srcBounds.x;
      var sy = srcBounds.y;

      this._uploadCanvas.width  = w + 2;
      this._uploadCanvas.height = h + 2;

      // Draw Image
      this._uploadCanvasContext.drawImage(src.canvas, sx, sy,         w, h, 1, 1,     w, h);

      // Top & Bottom Margins
      this._uploadCanvasContext.drawImage(src.canvas, sx, sy,         w, 1, 1, 0,     w, 1);
      this._uploadCanvasContext.drawImage(src.canvas, sx, sy + h - 1, w, 1, 1, h + 1, w, 1);

      // Left & Right Margins
      this._uploadCanvasContext.drawImage(src.canvas, sx,         sy, 1, h, 0,     1, 1, h);
      this._uploadCanvasContext.drawImage(src.canvas, sx + w - 1, sy, 1, h, w + 1, 1, 1, h);

      if (!oldTextureRegion) {
        return this.context.cacheImage(this._uploadCanvas);
      } else {
        if (!this._options.disableTextureUploads) {
          this.context.updateTextureRegion(this._uploadCanvas, oldTextureRegion);
        }
        return oldTextureRegion;
      }
    }

    public render() {
      var self = this;
      var stage = this._stage;
      var options = this._options;
      var context = this.context;
      var gl = context.gl;

      if (options.disable) {
        return;
      }

      // TODO: Only set the camera once, not every frame.
      if (options.perspectiveCamera) {
        this.context.modelViewProjectionMatrix = this.context.createPerspectiveMatrix (
          options.perspectiveCameraDistance,
          options.perspectiveCameraFOV,
          options.perspectiveCameraAngle
        );
      } else {
        this.context.modelViewProjectionMatrix = this.context.create2DProjectionMatrix();
      }

      var brush = this._brush;

      var viewport = this._viewport;
      if (options.ignoreViewport) {
        viewport = Rectangle.createSquare(1024 * 1024);
      }

      var inverseTransform = Matrix.createIdentity();

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      var depth = 0;

      brush.reset();

      var parent = null;
      var tileTransform = Matrix.createIdentity();
      var colorTransform = ColorMatrix.createIdentity();
      var cacheImageCallback = this._cacheImageCallback.bind(this);

      stage.visit(function (frame: Frame, transform?: Matrix): VisitorFlags {
        if (frame._parent !== parent) {
          parent = frame._parent;
          depth += options.frameSpacing;
        }

        var alpha = frame.getConcatenatedAlpha();
        if (!options.ignoreColorMatrix) {
          colorTransform = frame.getConcatenatedColorMatrix();
        }
        if (frame instanceof Shape) {
          var shape = <Shape>frame;
          var bounds = shape.source.getBounds();
          if (!bounds.isEmpty()) {
            var source = shape.source;
            var tileCache: RenderableTileCache = source.properties["tileCache"];
            if (!tileCache) {
              tileCache = source.properties["tileCache"] = new RenderableTileCache(source, TILE_SIZE, MIN_UNTILED_SIZE);
            }
            transform.translate(bounds.x, bounds.y);
            transform.inverse(inverseTransform);
            var tiles = tileCache.fetchTiles(viewport, inverseTransform, self._scratchCanvasContext, cacheImageCallback);
            for (var i = 0; i < tiles.length; i++) {
              var tile = tiles[i];
              tileTransform.setIdentity();
              tileTransform.translate(tile.bounds.x, tile.bounds.y);
              tileTransform.scale(1 / tile.scale, 1 / tile.scale);
              tileTransform.concat(transform);
              var src = <WebGLTextureRegion>(tile.cachedTextureRegion);
              if (src && src.texture) {
                context.textureRegionCache.put(src);
              }
              if (!brush.drawImage(src, new Rectangle(0, 0, tile.bounds.w, tile.bounds.h), new Color(1, 1, 1, alpha), colorTransform, tileTransform, depth, frame.blendMode)) {
                unexpected();
              }
              if (options.drawTiles) {
                var srcBounds = tile.bounds.clone();
                if (!tile.color) {
                  tile.color = Color.randomColor(0.4);
                }
                brush.fillRectangle(new Rectangle(0, 0, srcBounds.w, srcBounds.h), tile.color, tileTransform, depth);
              }
            }
          }
        }
        return VisitorFlags.Continue;
      }, stage.matrix);

      brush.flush(options.drawElements);

      if (options.drawTextures) {
        var textures = context.getTextures();
        var transform = Matrix.createIdentity();
        if (options.drawTexture >= 0 && options.drawTexture < textures.length) {
          var texture = textures[options.drawTexture | 0];
          brush.drawImage(new WebGLTextureRegion(texture, <RegionAllocator.Region>new Rectangle(0, 0, texture.w, texture.h)), viewport, Color.White, null, transform, 0.2);
        } else {
          var textureWindowSize = viewport.w / 5;
          if (textureWindowSize > viewport.h / textures.length) {
            textureWindowSize = viewport.h / textures.length;
          }
          brush.fillRectangle(new Rectangle(viewport.w - textureWindowSize, 0, textureWindowSize, viewport.h), new Color(0, 0, 0, 0.5), transform, 0.1);
          for (var i = 0; i < textures.length; i++) {
            var texture = textures[i];
            var textureWindow = new Rectangle(viewport.w - textureWindowSize, i * textureWindowSize, textureWindowSize, textureWindowSize);
            brush.drawImage(new WebGLTextureRegion(texture, <RegionAllocator.Region>new Rectangle(0, 0, texture.w, texture.h)), textureWindow, Color.White, null, transform, 0.2);
          }
        }
        brush.flush(options.drawElements);
      }
    }
  }


}