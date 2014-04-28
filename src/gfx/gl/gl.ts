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
    ignoreViewport: boolean;
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
        if (!options.disableTextureUploads) {
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
        if (frame instanceof SolidRectangle) {
          brush.fillRectangle(frame.getBounds(), Color.parseColor((<SolidRectangle>frame).fillStyle), transform, depth);
        } else if (frame instanceof Shape) {
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

  export class WebGLBrush {
    context: WebGLContext;
    geometry: WebGLGeometry;
    constructor(context: WebGLContext, geometry: WebGLGeometry) {
      this.context = context;
      this.geometry = geometry;
    }
  }

  export enum WebGLCombinedBrushKind {
    FillColor,
    FillTexture,
    FillTextureWithColorMatrix
  }

  export class WebGLCombinedBrushVertex extends Vertex {
    static attributeList: WebGLAttributeList;
    static initializeAttributeList(context) {
      var gl = context.gl;
      if (WebGLCombinedBrushVertex.attributeList) {
        return;
      }
      WebGLCombinedBrushVertex.attributeList = new WebGLAttributeList([
        new WebGLAttribute("aPosition", 3, gl.FLOAT),
        new WebGLAttribute("aCoordinate", 2, gl.FLOAT),
        new WebGLAttribute("aColor", 4, gl.UNSIGNED_BYTE, true),
        new WebGLAttribute("aKind", 1, gl.FLOAT),
        new WebGLAttribute("aSampler", 1, gl.FLOAT)
      ]);
      WebGLCombinedBrushVertex.attributeList.initialize(context);
    }
    kind: WebGLCombinedBrushKind = WebGLCombinedBrushKind.FillColor;
    color: Color = new Color(0, 0, 0, 0);
    sampler: number = 0;
    coordinate: Point = new Point(0, 0);
    constructor (x: number, y: number, z: number) {
      super(x, y, z);
    }
    public writeTo(geometry: WebGLGeometry) {
      var array = geometry.array;
      array.ensureAdditionalCapacity(68);
      array.writeVertex3DUnsafe(this.x, this.y, this.z);
      array.writeVertexUnsafe(this.coordinate.x, this.coordinate.y);
      array.writeColorUnsafe(this.color.r * 255, this.color.g * 255, this.color.b * 255, this.color.a * 255);
      array.writeFloatUnsafe(this.kind);
      array.writeFloatUnsafe(this.sampler);
    }
  }


  export class WebGLCombinedBrush extends WebGLBrush {
    private static _tmpVertices: WebGLCombinedBrushVertex [] = Vertex.createEmptyVertices(WebGLCombinedBrushVertex, 4);
    private _program: WebGLProgram;
    private _textures: WebGLTexture [];
    private _colorTransform: ColorMatrix;
    private _blendMode: BlendMode = BlendMode.Default;
    private static _depth: number = 1;
    constructor(context: WebGLContext, geometry: WebGLGeometry) {
      super(context, geometry);
      this._program = context.createProgramFromFiles("combined.vert", "combined.frag");
      this._textures = [];
      WebGLCombinedBrushVertex.initializeAttributeList(this.context);
    }

    public reset() {
      this._textures = [];
      this.geometry.reset();
    }

    public drawImage(src: WebGLTextureRegion,
                     dstRectangle: Rectangle,
                     color: Color,
                     colorTransform: ColorMatrix,
                     transform: Matrix,
                     depth: number = 0,
                     blendMode: BlendMode = BlendMode.Normal): boolean {

      if (!src || !src.texture) {
        return true;
      }
      dstRectangle = dstRectangle.clone();
      if (this._colorTransform) {
        if (!colorTransform || !this._colorTransform.equals(colorTransform)) {
          this.flush();
        }
      }
      this._colorTransform = colorTransform;
      if (this._blendMode !== blendMode) {
        this.flush();
        this._blendMode = blendMode;
      }
      var sampler = this._textures.indexOf(src.texture);
      if (sampler < 0) {
        if (this._textures.length === 8) {
          this.flush();
        }
        this._textures.push(src.texture);
        // if (this._textures.length > 8) {
        //   return false;
        //   notImplemented("Cannot handle more than 8 texture samplers.");
        // }
        sampler = this._textures.length - 1;
      }
      var tmpVertices = WebGLCombinedBrush._tmpVertices;
      var srcRectangle = src.region.clone();

      // TODO: This takes into the consideration the 1 pixel border added around tiles in the atlas. It should
      // probably be moved elsewhere.
      srcRectangle.offset(1, 1).resize(-2, -2);
      srcRectangle.scale(1 / src.texture.w, 1 / src.texture.h);
      transform.transformRectangle(dstRectangle, <Point[]><any>tmpVertices);
      for (var i = 0; i < 4; i++) {
        tmpVertices[i].z = depth;
      }
      tmpVertices[0].coordinate.x = srcRectangle.x;
      tmpVertices[0].coordinate.y = srcRectangle.y;
      tmpVertices[1].coordinate.x = srcRectangle.x + srcRectangle.w;
      tmpVertices[1].coordinate.y = srcRectangle.y;
      tmpVertices[2].coordinate.x = srcRectangle.x + srcRectangle.w;
      tmpVertices[2].coordinate.y = srcRectangle.y + srcRectangle.h;
      tmpVertices[3].coordinate.x = srcRectangle.x;
      tmpVertices[3].coordinate.y = srcRectangle.y + srcRectangle.h;

//      for (var i = 0; i < 4; i++) {
//        tmpVertices[i].x = tmpVertices[i].x | 0;
//        tmpVertices[i].y = tmpVertices[i].y | 0;
//      }

      for (var i = 0; i < 4; i++) {
        var vertex = WebGLCombinedBrush._tmpVertices[i];
        vertex.kind = colorTransform ?
          WebGLCombinedBrushKind.FillTextureWithColorMatrix :
        WebGLCombinedBrushKind.FillTexture;
        vertex.color.set(color);
        vertex.sampler = sampler;
        vertex.writeTo(this.geometry);
      }
      this.geometry.addQuad();
      return true;
    }

    public fillRectangle(rectangle: Rectangle, color: Color, transform: Matrix, depth: number = 0) {
      transform.transformRectangle(rectangle, <Point[]><any>WebGLCombinedBrush._tmpVertices);
      for (var i = 0; i < 4; i++) {
        var vertex = WebGLCombinedBrush._tmpVertices[i];
        vertex.kind = WebGLCombinedBrushKind.FillColor;
        vertex.color.set(color);
        vertex.z = depth;
        vertex.writeTo(this.geometry);
      }
      this.geometry.addQuad();
    }

    public flush(drawElements: boolean = true) {
      var g = this.geometry;
      var p = this._program;
      var gl = this.context.gl;

      g.uploadBuffers();
      gl.useProgram(p);
      gl.uniformMatrix4fv(p.uniforms.uTransformMatrix3D.location, false, this.context.modelViewProjectionMatrix.asWebGLMatrix());
      if (this._colorTransform) {
        gl.uniformMatrix4fv(p.uniforms.uColorMatrix.location, false, this._colorTransform.asWebGLMatrix());
        gl.uniform4fv(p.uniforms.uColorVector.location, this._colorTransform.asWebGLVector());
      }
      // Bind textures.
      for (var i = 0; i < this._textures.length; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, this._textures[i]);
      }
      gl.uniform1iv(p.uniforms["uSampler[0]"].location, [0, 1, 2, 3, 4, 5, 6, 7]);
      // Bind vertex buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, g.buffer);
      var size = WebGLCombinedBrushVertex.attributeList.size;
      var attributeList = WebGLCombinedBrushVertex.attributeList;
      var attributes: WebGLAttribute [] = attributeList.attributes;
      for (var i = 0; i < attributes.length; i++) {
        var attribute = attributes[i];
        var position = p.attributes[attribute.name].location;
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, attribute.size, attribute.type, attribute.normalized, size, attribute.offset);
      }

      this.context.blendMode = this._blendMode;

      // Bind elements buffer.
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.elementBuffer);
      if (drawElements) {
        gl.drawElements(gl.TRIANGLES, g.triangleCount * 3, gl.UNSIGNED_SHORT, 0);
      }
      this.reset();
    }
  }
}