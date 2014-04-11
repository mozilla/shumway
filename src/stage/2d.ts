/// <reference path='all.ts'/>

interface CanvasRenderingContext2D {
  stackDepth: number;
}

module Shumway.Layers {

  declare var FILTERS;

  import Rectangle = Shumway.Geometry.Rectangle;
  import Point = Shumway.Geometry.Point;
  import Matrix = Shumway.Geometry.Matrix;
  import DirtyRegion = Shumway.Geometry.DirtyRegion;
  import Filter = Shumway.Layers.Filter;
  import BlendMode = Shumway.Layers.BlendMode;
  import TileCache = Shumway.Geometry.TileCache;
  import Tile = Shumway.Geometry.Tile;
  import OBB = Shumway.Geometry.OBB;

  export enum FillRule {
    NONZERO,
    EVENODD
  }

  export enum RenderTarget {
    Default        = 0,
    Mask           = 1,
    Maskee         = 2,
    BlendMode      = 4,
    ColorTransform = 8,
    Filters        = 16
  }

  var originalSave = CanvasRenderingContext2D.prototype.save;
  var originalRestore = CanvasRenderingContext2D.prototype.restore;


  /**
   * Computes an opaquness grid by rendering a shape at a lower resolution and testing the alpha channel for each pixel.
   */
  class OpaqueRegionFactory {
    w: number;
    h: number;
    sx: number;
    sy: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor(w: number, h: number, sx: number, sy: number) {
      this.canvas = document.createElement("canvas");
      // document.getElementById("stageContainer").appendChild(this.canvas);
      this.w = this.canvas.width = w | 0;
      this.h = this.canvas.height = h | 0;
      this.sx = sx;
      this.sy = sy;
      this.context = this.canvas.getContext("2d", {
        willReadFrequently: true
      });
    }

    public createOpaqueRegion(source: IRenderable) {
      if (source.getBounds().isEmpty()) {
        return new OpaqueRegion(Rectangle.createEmpty(), Rectangle.createEmpty(), null);
      }
      this.context.save();
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      this.context.scale(1 / this.sx, 1 / this.sy);
      var sourceBounds = new Rectangle(0, 0, source.getBounds().w, source.getBounds().h);
      var scaledBounds = sourceBounds.clone().scale(1 / this.sx, 1 / this.sy);
      this.context.clearRect(sourceBounds.x, sourceBounds.y, sourceBounds.w, sourceBounds.h);
      source.render(this.context);
      this.context.restore();
      var imageData: ImageData = this.context.getImageData(scaledBounds.x, scaledBounds.y, scaledBounds.w, scaledBounds.h);
      var allChannels = imageData.data;
      var alphaChannel = new Uint8Array(imageData.width * imageData.height);
      var allOpaque = true;
      for (var i = 0; i < alphaChannel.length; i ++) {
        alphaChannel[i] = allChannels[3 + (i << 2)];
        if (alphaChannel[i] < 255) {
          allOpaque = false;
        }
      }
      return new OpaqueRegion(sourceBounds, new Rectangle(0, 0, imageData.width, imageData.height), allOpaque ? null : alphaChannel);
    }
  }

  /**
   * Describes an opaque region which is effectively an array of alpha values.
   */
  class OpaqueRegion {
    bounds: Rectangle;
    sourceBounds: Rectangle;
    private _alphaChannel: Uint8Array; // Null means it's all opaque.

    constructor(sourceBounds: Rectangle, bounds: Rectangle, alphaChannel: Uint8Array) {
      this.bounds = bounds;
      this.sourceBounds = sourceBounds;
      this._alphaChannel = alphaChannel;
    }

    isOpaque(rectangle: Rectangle) {
      if (!this._alphaChannel) {
        return true;
      }
      // Query rectangle is larger than the region, so it can't all be opaque.
      if (!this.sourceBounds.contains(rectangle)) {
        return false;
      }

      var scaledRectangle = rectangle.clone();
      scaledRectangle.scale(this.bounds.w / this.sourceBounds.w, this.bounds.h / this.sourceBounds.h);
      scaledRectangle.snap();

      var buffer = this._alphaChannel;
      var stride = this.bounds.w;
      var offsetX = scaledRectangle.x;
      var offsetY = scaledRectangle.y;

      for (var y = 0; y < scaledRectangle.h; y++) {
        for (var x = 0; x < scaledRectangle.w; x++) {
          var v = buffer[(offsetY + y) * stride + offsetX + x];
          if (v < 255) {
            return false;
          }
        }
      }

      return true;
    }
  }

  CanvasRenderingContext2D.prototype.save = function () {
    if (this.stackDepth === undefined) {
      this.stackDepth = 0;
    }
    this.stackDepth ++;
    originalSave.call(this);
  };

  CanvasRenderingContext2D.prototype.restore = function () {
    this.stackDepth --;
    originalRestore.call(this);
  };

  function findIntersectingIndex(rectangle: Rectangle, others: Rectangle []): number {
    for (var i = 0; i < others.length; i++) {
      if (others[i] && others[i].intersects(rectangle)) {
        return i;
      }
    }
    return -1;
  }

  export class Canvas2DStageRenderer {

    private _viewport: Rectangle;
    private _fillRule: string;

    context: CanvasRenderingContext2D;
    count = 0;

    constructor(context: CanvasRenderingContext2D, fillRule: FillRule = FillRule.NONZERO) {
      this.context = context;
      this._viewport = new Rectangle(0, 0, context.canvas.width, context.canvas.height);
      this._fillRule = fillRule === FillRule.EVENODD ? 'evenodd' : 'nonzero';
      context.fillRule = context.mozFillRule = this._fillRule;
    }

    private createScratchContext(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
      var canvas = document.createElement("canvas");
      canvas.width = context.canvas.width;
      canvas.height = context.canvas.height;
      var canvasContext = canvas.getContext("2d", { willReadFrequently: true });
      canvasContext.fillRule = canvasContext.mozFillRule = this._fillRule;
      return canvasContext;
    }

    /**
     * Walks the display list front to back marking the frames that should be rendered given the list of culling rectangles.
     */
    cullFrame(root: Frame, transform: Matrix, cullRectanglesAABB: Rectangle []) {
      var inverseTransform: Matrix = Matrix.createIdentity();
      root.visit(function visitFrame(frame: Frame, transform?: Matrix, flags?: FrameFlags): VisitorFlags {
        var frameBoundsAABB = frame.getBounds();
        transform.transformRectangleAABB(frameBoundsAABB);
        var index = findIntersectingIndex(frameBoundsAABB, cullRectanglesAABB);
        if (index < 0) {
          frame.setFlags(FrameFlags.Culled, true);
        } else if (frame instanceof Shape) {
          /* Not ready yet
          var shape = <Shape>frame;
          transform.inverse(inverseTransform);
          var cullRectangleLocalAABB = cullRectanglesAABB[index];
          inverseTransform.transformRectangleAABB(cullRectangleLocalAABB);
          var opaqueRegion: OpaqueRegion = shape.source.properties["opaqueRegion"];
          if (opaqueRegion && opaqueRegion.isOpaque(cullRectangleLocalAABB)) {
            cullRectanglesAABB[index] = null;
          }
          */
        }
        return VisitorFlags.Continue;
      }, transform, FrameFlags.Empty, VisitorFlags.VisibleOnly | VisitorFlags.FrontToBack);
    }

    public render(stage: Stage, options: any) {
      var context = this.context;
      context.save();

      if (stage.trackDirtyRegions) {
        stage.gatherMarkedDirtyRegions(stage.transform);
        var lastDirtyRectangles: Rectangle[] = [];
        stage.dirtyRegion.gatherRegions(lastDirtyRectangles);
        if (options.clipDirtyRegions) {
          if (!lastDirtyRectangles.length) {
            // Nothing is dirty, so skip rendering.
            context.restore();
            return;
          }
          if (options.clipCanvas) {
            context.beginPath();
            /**
             * If we have overlapping clippling regions we don't want to use even-odd fill rules.
             */
            var savedFillRule = context.mozFillRule;
            context.fillRule = context.mozFillRule = 'nonzero';
            for (var i = 0; i < lastDirtyRectangles.length; i++) {
              var rectangle = lastDirtyRectangles[i];
              rectangle.expand(2, 2);
              context.rect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
            }
            context.clip();
            context.fillRule = context.mozFillRule = savedFillRule;
          }
        }

      }

      var dirtyRectangles = lastDirtyRectangles.slice(0);


      context.clearRect(0, 0, stage.w, stage.h);
      context.globalAlpha = 1;

      if (options.cull) {
        this.cullFrame(stage, stage.transform, dirtyRectangles.slice(0));
      }

      this.renderFrame(context, stage, stage.transform, null, dirtyRectangles, 0, options);

      if (stage.trackDirtyRegions) {
        stage.dirtyRegion.clear();
      }

      if (options && options.drawLayers) {
        function drawRectangle(rectangle: Rectangle) {
          context.rect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
        }
        context.strokeStyle = "#FF4981";
      }

      context.restore();
    }

    static clearContext(context: CanvasRenderingContext2D, rectangle: Rectangle) {
      var canvas = context.canvas;
      context.clearRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
    }

    renderFrame(context: CanvasRenderingContext2D, root: Frame, transform: Matrix, clipRectangle: Rectangle, cullRectanglesAABB: Rectangle [], target: RenderTarget, options: any) {
      var self = this;

      if (clipRectangle) {
        context.save();
        context.beginPath();
        context.rect(clipRectangle.x, clipRectangle.y, clipRectangle.w, clipRectangle.h);
        context.clip();
      }

      root.visit(function visitFrame(frame: Frame, transform?: Matrix, flags?: FrameFlags): VisitorFlags {

        context.save();
        context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
        context.globalAlpha = frame.getConcatenatedAlpha();

        if ((flags & FrameFlags.IsMask) && !(target & RenderTarget.Mask)) {
          context.restore();
          return VisitorFlags.Skip;
        }

        var hasFilters: boolean = (frame.filters.length > 0 && !(target & RenderTarget.Filters));
        var hasColorTransform: boolean = (frame.colorTransform && !(target & RenderTarget.ColorTransform));
        var hasBlendMode: boolean = (frame.blendMode > 0 && !(target & RenderTarget.BlendMode));

        if (hasFilters || hasColorTransform || hasBlendMode) {
          // TODO
          // - cache bitmap on frame
          // - apply filter bounds
          // - apply filters
          // - fix alpha blending
          var scratchContext = self.createScratchContext(context);
          var frameBoundsAABB = frame.getBounds();
          transform.transformRectangleAABB(frameBoundsAABB);
          frameBoundsAABB.intersect(self._viewport);

          var needsImageData: boolean = false;
          if (hasFilters) {
            target |= RenderTarget.Filters;
            needsImageData = true;
          }
          if (hasColorTransform) {
            target |= RenderTarget.ColorTransform;
            needsImageData = true;
          }
          if (hasBlendMode) {
            target |= RenderTarget.BlendMode;
          }

          self.renderFrame(scratchContext, frame, transform, frameBoundsAABB, null, target, options);

          var image;
          var imageData;
          if (needsImageData) {
            image = scratchContext.getImageData(frameBoundsAABB.x, frameBoundsAABB.y, frameBoundsAABB.w, frameBoundsAABB.h);
            imageData = image.data;
          }

          if (hasFilters) {
            //for (var i = 0, n = filters.length; i < n; i++) {
            //  filters[i].applyFilter(imageData);
            //}
          }

          if (hasColorTransform) {
            var ct = frame.colorTransform.getColorTransform();
            FILTERS.colortransform(imageData, image.width, image.height, ct[0], ct[1], ct[2], ct[4], ct[5], ct[6]);
          }

          if (needsImageData) {
            scratchContext.putImageData(image, frameBoundsAABB.x, frameBoundsAABB.y);
          }

          context.save();
          context.setTransform(1, 0, 0, 1, 0, 0);

          if (hasBlendMode) {
            context.globalCompositeOperation = self.getCompositeOperation(frame.blendMode);
          }

          context.drawImage(scratchContext.canvas, frameBoundsAABB.x, frameBoundsAABB.y, frameBoundsAABB.w, frameBoundsAABB.h, frameBoundsAABB.x, frameBoundsAABB.y, frameBoundsAABB.w, frameBoundsAABB.h);
          context.restore();
          context.restore();

          return VisitorFlags.Skip;
        }

        if (!options.disableMasking && frame.mask && !frame.hasFlags(FrameFlags.IgnoreMask) && !(target & RenderTarget.Mask)) {
          frame.setFlags(FrameFlags.IgnoreMask, true);

          var maskCanvasContext = self.createScratchContext(context); // TODO: FIX THIS!
          var maskeeCanvasContext = self.createScratchContext(context); // TODO: FIX THIS!

          var maskTransform = frame.mask.getConcatenatedTransform();
          var maskBoundsAABB = frame.mask.getBounds();
          maskTransform.transformRectangleAABB(maskBoundsAABB);
          maskBoundsAABB.intersect(self._viewport);

          var frameBoundsAABB = frame.getBounds();
          transform.transformRectangleAABB(frameBoundsAABB);
          maskBoundsAABB.intersect(frameBoundsAABB);
          maskBoundsAABB.snap();

          //Canvas2DStageRenderer.clearContext(maskCanvasContext, maskBoundsAABB);
          self.renderFrame(maskCanvasContext, frame.mask, maskTransform, maskBoundsAABB, null, target | RenderTarget.Mask, options);

          //Canvas2DStageRenderer.clearContext(maskeeCanvasContext, maskBoundsAABB);
          maskeeCanvasContext.globalCompositeOperation = 'source-over';
          self.renderFrame(maskeeCanvasContext, frame, transform, maskBoundsAABB, null, target | RenderTarget.Maskee, options);

          if (options.compositeMask) {
            maskeeCanvasContext.globalCompositeOperation = 'destination-in';
          }
          maskeeCanvasContext.drawImage(maskCanvasContext.canvas, maskBoundsAABB.x, maskBoundsAABB.y, maskBoundsAABB.w, maskBoundsAABB.h, maskBoundsAABB.x, maskBoundsAABB.y, maskBoundsAABB.w, maskBoundsAABB.h);
          context.save();
          context.setTransform(1, 0, 0, 1, 0, 0);
          context.drawImage(maskeeCanvasContext.canvas, maskBoundsAABB.x, maskBoundsAABB.y, maskBoundsAABB.w, maskBoundsAABB.h, maskBoundsAABB.x, maskBoundsAABB.y, maskBoundsAABB.w, maskBoundsAABB.h);
          if (options.debug) {
            context.strokeStyle = "red";
            context.strokeRect(maskBoundsAABB.x, maskBoundsAABB.y, maskBoundsAABB.w, maskBoundsAABB.h);
          }
          context.restore();
          context.restore();
          return VisitorFlags.Skip;
        }

        var frameBoundsAABB = frame.getBounds();
        transform.transformRectangleAABB(frameBoundsAABB);
        if (frame.hasFlags(FrameFlags.Culled)) {
          frame.setFlags(FrameFlags.Culled, false);
        } else {
          if (frame instanceof Shape) {
            frame._previouslyRenderedAABB = frameBoundsAABB;
            var shape = <Shape>frame;
            var bounds = shape.getBounds();
            if (!bounds.isEmpty()) {
              shape.source.render(context);
            }
            if (options.paintFlashing) {
              context.fillStyle = randomStyle();
              context.globalAlpha = 0.5;
              context.fillRect(0, 0, frame.w, frame.h);
            }
          }
        }

        context.restore();

        frame.setFlags(FrameFlags.IgnoreMask, false);

        return VisitorFlags.Continue;
      }, transform, FrameFlags.Empty);

      if (clipRectangle) {
        context.restore();
      }
    }

    private getCompositeOperation(blendMode: BlendMode): string {
      // TODO:

      // These Flash blend modes have no canvas equivalent:
      // - blendModeClass.SUBTRACT
      // - blendModeClass.INVERT
      // - blendModeClass.SHADER
      // - blendModeClass.ADD

      // These blend modes are actually Porter-Duff compositing operators.
      // The backdrop is the nearest parent with blendMode set to LAYER.
      // When there is no LAYER parent, they are ignored (treated as NORMAL).
      // - blendModeClass.ALPHA (destination-in)
      // - blendModeClass.ERASE (destination-out)
      // - blendModeClass.LAYER [defines backdrop]

      var compositeOp: string = "source-over";

      switch (blendMode) {
        case BlendMode.MULTIPLY:   compositeOp = "multiply";   break;
        case BlendMode.SCREEN:     compositeOp = "screen";     break;
        case BlendMode.LIGHTEN:    compositeOp = "lighten";    break;
        case BlendMode.DARKEN:     compositeOp = "darken";     break;
        case BlendMode.DIFFERENCE: compositeOp = "difference"; break;
        case BlendMode.OVERLAY:    compositeOp = "overlay";    break;
        case BlendMode.HARDLIGHT:  compositeOp = "hard-light"; break;
      }

      return compositeOp;
    }

  }
}
