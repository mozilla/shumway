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
  var SCRATCH_CANVAS_SIZE = 1024 * 2;

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
  import RenderableTileCache = Geometry.RenderableTileCache;

  import Frame = Shumway.GFX.Frame;
  import Stage = Shumway.GFX.Stage;
  import Shape = Shumway.GFX.Shape;
  import Filter = Shumway.GFX.Filter;
  import BlurFilter = Shumway.GFX.BlurFilter;
  import ColorMatrix = Shumway.GFX.ColorMatrix;
  import VisitorFlags = Shumway.GFX.VisitorFlags;

  import TileCache = Geometry.TileCache;
  import Tile = Geometry.Tile;
  import OBB = Geometry.OBB;

  import unexpected = Shumway.Debug.unexpected;

  import radianToDegrees = Geometry.radianToDegrees;
  import degreesToRadian = Geometry.degreesToRadian;

  export class WebGLStageRendererOptions extends StageRendererOptions {
    maxTextures: number = 8;
    maxTextureSize: number = 2048 * 2;
    perspectiveCamera: boolean;
    perspectiveCameraDistance: number;
    perspectiveCameraFOV: number;
    perspectiveCameraAngle: number;

    animateZoom: boolean = true;

    /**
     * Sometimes it's useful to temporarily disable texture uploads to see if rendering
     * is texture upload bound.
     */
    disableTextureUploads: boolean = false;
    frameSpacing: number = 0.0001;
    ignoreColorMatrix: boolean = false;
    drawTiles: boolean;
    drawTextures: boolean = false;
    drawTexture: number = -1;

    premultipliedAlpha: boolean = false;
    unpackPremultiplyAlpha: boolean = true;
    showTemporaryCanvases: boolean = false;

    sourceBlendFactor: WebGLBlendFactor = WebGLBlendFactor.ONE;
    destinationBlendFactor: WebGLBlendFactor = WebGLBlendFactor.ONE_MINUS_SRC_ALPHA;
  }

  export class WebGLStageRenderer extends StageRenderer {
    _options: WebGLStageRendererOptions;
    _context: WebGLContext;

    private _brush: WebGLCombinedBrush;
    private _filterBrush: WebGLFilterBrush;
    private _stencilBrush: WebGLCombinedBrush;

    private _tmpVertices: Vertex [] = Vertex.createEmptyVertices(Vertex, 64);

    private _scratchCanvas: HTMLCanvasElement;
    private _scratchCanvasContext: CanvasRenderingContext2D;
    private _dynamicScratchCanvas: HTMLCanvasElement;
    private _dynamicScratchCanvasContext: CanvasRenderingContext2D;
    private _uploadCanvas: HTMLCanvasElement;
    private _uploadCanvasContext: CanvasRenderingContext2D;
    private _clipStack: Frame [];

    constructor(canvas: HTMLCanvasElement,
                stage: Stage,
                options: WebGLStageRendererOptions = new WebGLStageRendererOptions()) {
      super(canvas, stage, options);
      var context = this._context = new WebGLContext(this._canvas, options);

      this.resize();

      this._brush = new WebGLCombinedBrush(context, new WebGLGeometry(context));
      this._stencilBrush = new WebGLCombinedBrush(context, new WebGLGeometry(context));

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

      if (options.showTemporaryCanvases) {
        document.getElementById("temporaryCanvasPanelContainer").appendChild(this._uploadCanvas);
        document.getElementById("temporaryCanvasPanelContainer").appendChild(this._scratchCanvas);
      }

      this._clipStack = [];
    }

    private _cachedTiles = [];

    public resize() {
      this._viewport = new Rectangle(0, 0, this._canvas.width, this._canvas.height);
      this._context._resize();
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

      if (!oldTextureRegion || !oldTextureRegion.texture) {
        return this._context.cacheImage(this._uploadCanvas);
      } else {
        if (!this._options.disableTextureUploads) {
          this._context.updateTextureRegion(this._uploadCanvas, oldTextureRegion);
        }
        return oldTextureRegion;
      }
    }

    private _renderFrameIntoTextureRegion(frame: Frame, matrix: Matrix): WebGLTextureRegion {
      var context = this._context;
      var bounds = frame.getBounds().clone();
      matrix.transformRectangleAABB(bounds);
      bounds.snap();
      var textureRegion = context.allocateTextureRegion(Math.ceil(bounds.w), Math.ceil(bounds.h));
      if (!textureRegion) {
        debugger;
        textureRegion = context.allocateTextureRegion(bounds.w, bounds.h);
      }
      // context.clearTextureRegion(textureRegion, Color.randomColor(0.5));
      context.clearTextureRegion(textureRegion, Color.None);
      var brush = new WebGLCombinedBrush(context, new WebGLGeometry(context), textureRegion.texture);
      var region = textureRegion.region;
      matrix = matrix.clone();
      matrix.translate(region.x - bounds.x, region.y - bounds.y);
//
//      var transform = Matrix.createIdentity();
//      var v = Math.abs(Math.sin(Date.now() / 1000) * (1024 * 4));
//      transform.translate(v, v);
      // transform.translate(Math.sin(Date.now() / 10000) * 100, 0);
      var r = Rectangle.createSquare(1024 * 8);
      this._renderFrame(frame, matrix, brush, r);
      brush.flush();
      return textureRegion;

//      context.clearTextureRegion(self._layerTextureRegion);
//      var bounds = frame.getBounds();
//      var frameBoundsAABB = bounds.clone();
//      transform.transformRectangleAABB(frameBoundsAABB);
//      context.setTarget(self._layerTextureRegion.texture);
//      var layerBrush = new WebGLCombinedBrush(context, new WebGLGeometry(context), self._layerTextureRegion.texture);
//      self._renderFrame(frame, transform, layerBrush, 0);
//      layerBrush.flush();
//      // var m = Matrix.createIdentity().translate(frameBoundsAABB.x, frameBoundsAABB.y);
//      var m = Matrix.createIdentity();
//      var src = new WebGLTextureRegion(self._layerTextureRegion.texture, <RegionAllocator.Region>frameBoundsAABB);
//      if (!brush.drawImage(src, frameBoundsAABB, new Color(1, 1, 1, alpha), colorTransform, m, depth, frame.blendMode)) {
//        unexpected();
//      }
//
    }

    private _renderFrameLayer(frame: Frame, matrix: Matrix, brush: WebGLCombinedBrush) {
      var textureRegion = this._renderFrameIntoTextureRegion(frame, matrix);

      var bounds = frame.getBounds().clone();
      matrix.transformRectangleAABB(bounds);
      bounds.snap();

      var m = Matrix.createIdentity();
      var alpha = frame.getConcatenatedAlpha();
      var colorMatrix = frame.getConcatenatedColorMatrix();
      if (!brush.drawImage(textureRegion, bounds, new Color(1, 1, 1, alpha), colorMatrix, m, 0, frame.blendMode)) {
        unexpected();
      }
      this._context.freeTextureRegion(textureRegion);
    }

    private _enterClip(clip: Frame, matrix: Matrix, brush: WebGLCombinedBrush, viewport: Rectangle) {
      brush.flush();
      var gl = this._context.gl;
      if (this._clipStack.length === 0) {
        gl.enable(gl.STENCIL_TEST);
        gl.clear(gl.STENCIL_BUFFER_BIT);
        gl.stencilFunc(gl.ALWAYS, 1, 1);
      }
      this._clipStack.push(clip);
      gl.colorMask(false, false, false, false);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
      this._renderFrame(clip, matrix, brush, viewport, 0);
      brush.flush();
      gl.colorMask(true, true, true, true);
      gl.stencilFunc(gl.NOTEQUAL, 0, this._clipStack.length);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    }

    private _leaveClip(clip: Frame, matrix: Matrix, brush: WebGLCombinedBrush, viewport: Rectangle) {
      brush.flush();
      var gl = this._context.gl;
      var clip = this._clipStack.pop();
      if (clip) {
        gl.colorMask(false, false, false, false);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
        this._renderFrame(clip, matrix, brush, viewport, 0);
        brush.flush();
        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.NOTEQUAL, 0, this._clipStack.length);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
      }
      if (this._clipStack.length === 0) {
        gl.disable(gl.STENCIL_TEST);
      }
    }

    private _renderFrame(root: Frame, matrix: Matrix, brush: WebGLCombinedBrush, viewport: Rectangle, depth: number = 0) {
      var self = this;
      var options = this._options;
      var context = this._context;
      var gl = context.gl;
      var cacheImageCallback = this._cacheImageCallback.bind(this);
      var tileMatrix = Matrix.createIdentity();
      var colorMatrix = ColorMatrix.createIdentity();
      var inverseMatrix = Matrix.createIdentity();
      root.visit(function (frame: Frame, matrix?: Matrix, flags?: FrameFlags): VisitorFlags {
        depth += options.frameSpacing;

        var bounds = frame.getBounds();

        if (flags & FrameFlags.EnterClip) {
          self._enterClip(frame, matrix, brush, viewport);
          return;
        } else if (flags & FrameFlags.LeaveClip) {
          self._leaveClip(frame, matrix, brush, viewport);
          return;
        }

        // Return early if the bounds are not within the viewport.
        if (!viewport.intersectsTransformedAABB(bounds, matrix)) {
          return VisitorFlags.Skip;
        }

        var alpha = frame.getConcatenatedAlpha(root);
        if (!options.ignoreColorMatrix) {
          colorMatrix = frame.getConcatenatedColorMatrix();
        }

        if (frame instanceof FrameContainer) {
          if (frame instanceof ClipRectangle || options.paintBounds) {
            if (!frame.color) {
              frame.color = Color.randomColor(0.3);
            }
            brush.fillRectangle(bounds, frame.color, matrix, depth);
          }
          if (frame !== root && frame.blendMode !== BlendMode.Normal) {
            self._renderFrameLayer(frame, matrix, brush);
            // self._renderFrameIntoTextureRegion(frame, transform);
            return VisitorFlags.Skip;
          }
        } else if (frame instanceof Shape) {
          if (frame.blendMode !== BlendMode.Normal) {
            if (!WebGLContext.glSupportedBlendMode(frame.blendMode)) {
              // gl.TEXTURE_2D
              // gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 4, 4, 16, 16);
              // Now we need to render the frame into a texture.
            }
            return VisitorFlags.Skip;
          }
          var shape = <Shape>frame;
          var bounds = shape.source.getBounds();
          if (!bounds.isEmpty()) {
            var source = shape.source;
            var tileCache: RenderableTileCache = source.properties["tileCache"];
            if (!tileCache) {
              tileCache = source.properties["tileCache"] = new RenderableTileCache(source, TILE_SIZE, MIN_UNTILED_SIZE);
            }
            var t = Matrix.createIdentity().translate(bounds.x, bounds.y);
            t.concat(matrix);
            t.inverse(inverseMatrix);
            var tiles = tileCache.fetchTiles(viewport, inverseMatrix, self._scratchCanvasContext, cacheImageCallback);
            for (var i = 0; i < tiles.length; i++) {
              var tile = tiles[i];
              tileMatrix.setIdentity();
              tileMatrix.translate(tile.bounds.x, tile.bounds.y);
              tileMatrix.scale(1 / tile.scale, 1 / tile.scale);
              tileMatrix.translate(bounds.x, bounds.y);
              tileMatrix.concat(matrix);
              var src = <WebGLTextureRegion>(tile.cachedTextureRegion);
              if (src && src.texture) {
                context._textureRegionCache.use(src);
              }
              var color = new Color(1, 1, 1, alpha);
              if (options.paintFlashing) {
                color = Color.randomColor(1);
              }
              if (!brush.drawImage(src, new Rectangle(0, 0, tile.bounds.w, tile.bounds.h), color, colorMatrix, tileMatrix, depth, frame.blendMode)) {
                unexpected();
              }
              if (options.drawTiles) {
                var srcBounds = tile.bounds.clone();
                if (!tile.color) {
                  tile.color = Color.randomColor(0.4);
                }
                brush.fillRectangle(new Rectangle(0, 0, srcBounds.w, srcBounds.h), tile.color, tileMatrix, depth);
              }
            }
          }
        }
        return VisitorFlags.Continue;
      }, matrix, FrameFlags.Empty, VisitorFlags.Clips);
    }

    private _renderTextures(brush: WebGLCombinedBrush) {
      var options = this._options;
      var context = this._context;
      var viewport = this._viewport;
      if (options.drawTextures) {
        var textures = context.getTextures();
        var matrix = Matrix.createIdentity();
        if (options.drawTexture >= 0 && options.drawTexture < textures.length) {
          var texture = textures[options.drawTexture | 0];
          var src = new Rectangle(0, 0, texture.w, texture.h);
          var dst = src.clone();
          while(dst.w > viewport.w) {
            dst.scale(0.5, 0.5);
          }
          brush.drawImage(new WebGLTextureRegion(texture, src), dst, Color.White, null, matrix, 0.2);
        } else {
          var textureWindowSize = viewport.w / 5;
          if (textureWindowSize > viewport.h / textures.length) {
            textureWindowSize = viewport.h / textures.length;
          }
          brush.fillRectangle(new Rectangle(viewport.w - textureWindowSize, 0, textureWindowSize, viewport.h), new Color(0, 0, 0, 0.5), matrix, 0.1);
          for (var i = 0; i < textures.length; i++) {
            var texture = textures[i];
            var textureWindow = new Rectangle(viewport.w - textureWindowSize, i * textureWindowSize, textureWindowSize, textureWindowSize);
            brush.drawImage(new WebGLTextureRegion(texture, <RegionAllocator.Region>new Rectangle(0, 0, texture.w, texture.h)), textureWindow, Color.White, null, matrix, 0.2);
          }
        }
        brush.flush();
      }
    }

    public render() {
      var self = this;
      var stage = this._stage;
      var options = this._options;
      var context = this._context;
      var gl = context.gl;

      // TODO: Only set the camera once, not every frame.
      if (options.perspectiveCamera) {
        this._context.modelViewProjectionMatrix = this._context.createPerspectiveMatrix (
          options.perspectiveCameraDistance + (options.animateZoom ? Math.sin(Date.now() / 3000) * 0.8 : 0),
          options.perspectiveCameraFOV,
          options.perspectiveCameraAngle
        );
      } else {
        this._context.modelViewProjectionMatrix = this._context.create2DProjectionMatrix();
      }

      var brush = this._brush;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      brush.reset();

      var viewport = this._viewport;

      enterTimeline("_renderFrame");
      this._renderFrame(stage, stage.matrix, brush, viewport, 0);
      leaveTimeline();

      brush.flush();

      if (options.paintViewport) {
        brush.fillRectangle(viewport, new Color(0.5, 0, 0, 0.25), Matrix.createIdentity(), 0);
        brush.flush();
      }

      this._renderTextures(brush);
    }
  }


}