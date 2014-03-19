/// <reference path='all.ts'/>

interface CanvasRenderingContext2D {
  stackDepth: number;
}

module Shumway.Layers {

  import Rectangle = Shumway.Geometry.Rectangle;
  import Point = Shumway.Geometry.Point;
  import Matrix = Shumway.Geometry.Matrix;
  import DirtyRegion = Shumway.Geometry.DirtyRegion;
  import Filter = Shumway.Layers.Filter;
  import TileCache = Shumway.Geometry.TileCache;
  import Tile = Shumway.Geometry.Tile;
  import OBB = Shumway.Geometry.OBB;

  var originalSave = CanvasRenderingContext2D.prototype.save;
  var originalRestore = CanvasRenderingContext2D.prototype.restore;

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

  export class Canvas2DStageRenderer {
    private _maskCanvas: HTMLCanvasElement;
    private _scratchContexts: CanvasRenderingContext2D [] = [];

    private static MAX_MASK_DEPTH = 1;
    private _viewport: Rectangle;

    context: CanvasRenderingContext2D;
    count = 0;
    constructor(context: CanvasRenderingContext2D) {
      this.context = context;
      for (var i = 0; i < 2; i++) {
        var canvas = document.createElement("canvas");
        canvas.width = context.canvas.width;
        canvas.height = context.canvas.height;
        var canvasContext = canvas.getContext("2d", {
          willReadFrequently: true
        });
        this._scratchContexts.push(canvasContext);
      }
      this._viewport = new Rectangle(0, 0, context.canvas.width, context.canvas.height);
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
          context.beginPath();
          for (var i = 0; i < lastDirtyRectangles.length; i++) {
            var rectangle = lastDirtyRectangles[i];
            rectangle.expand(2, 2);
            context.rect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
          }
          context.clip();
        }
        stage.dirtyRegion.clear();
      }

      context.clearRect(0, 0, stage.w, stage.h);
      context.globalAlpha = 1;

      this.renderFrame(context, stage, stage.transform, null, stage.trackDirtyRegions, 0, options);

      if (false && lastDirtyRectangles) {
        context.strokeStyle = "red";
        for (var i = 0; i < lastDirtyRectangles.length; i++) {
          var rectangle = lastDirtyRectangles[i];
          context.strokeRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
        }
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

    renderFrame(context: CanvasRenderingContext2D, root: Frame, transform: Matrix, clipRect: Rectangle, trackDirtyRegions: boolean, maskDepth: number, options: any) {
      var self = this;
      var maskCanvasContext = self._scratchContexts[0];
      var maskeeCanvasContext = self._scratchContexts[1];

      if (clipRect) {
        context.save();
        context.beginPath();
        context.rect(clipRect.x, clipRect.y, clipRect.w, clipRect.h);
        context.clip();
      }

      root.visit(function visitFrame(frame: Frame, transform?: Matrix, flags?: FrameFlags): VisitorFlags {
        context.save();
        context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
        context.globalAlpha = frame.getConcatenatedAlpha();

        if (maskDepth === 0 && (flags & FrameFlags.IsMask)) {
          context.restore();
          return VisitorFlags.Skip;
        }

        if (!options.disableMasking && maskDepth < Canvas2DStageRenderer.MAX_MASK_DEPTH && frame.mask) {
          var maskTransform = frame.mask.getConcatenatedTransform();
          var maskBounds = frame.mask.getBounds();
          maskTransform.transformRectangleAABB(maskBounds);
          maskBounds.intersect(self._viewport);

          var frameBounds = frame.getBounds();
          transform.transformRectangleAABB(frameBounds);
          maskBounds.intersect(frameBounds);
          maskBounds.snap();

          Canvas2DStageRenderer.clearContext(maskCanvasContext, maskBounds);
          self.renderFrame(maskCanvasContext, frame.mask, maskTransform, maskBounds, false, maskDepth + 1, options);

          Canvas2DStageRenderer.clearContext(maskeeCanvasContext, maskBounds);
          maskeeCanvasContext.globalCompositeOperation = 'source-over';
          self.renderFrame(maskeeCanvasContext, frame, transform, maskBounds, false, maskDepth + 1, options);

          if (options.compositeMask) {
            maskeeCanvasContext.globalCompositeOperation = 'destination-in';
          }
          maskeeCanvasContext.drawImage(maskCanvasContext.canvas, maskBounds.x, maskBounds.y, maskBounds.w, maskBounds.h, maskBounds.x, maskBounds.y, maskBounds.w, maskBounds.h);
          context.save();
          context.setTransform(1, 0, 0, 1, 0, 0);
          context.drawImage(maskeeCanvasContext.canvas, maskBounds.x, maskBounds.y, maskBounds.w, maskBounds.h, maskBounds.x, maskBounds.y, maskBounds.w, maskBounds.h);
          if (options.debug) {
            context.strokeStyle = "red";
            context.strokeRect(maskBounds.x, maskBounds.y, maskBounds.w, maskBounds.h);
          }
          context.restore();
          context.restore();
          return VisitorFlags.Skip;
        } else if (frame instanceof Shape) {
          var rectangle = new Rectangle(0, 0, frame.w, frame.h);
          transform.transformRectangleAABB(rectangle);
          if (trackDirtyRegions) {
            frame._previouslyRenderedAABB = rectangle;
          }
          var shape = <Shape>frame;
          shape.source.render(context);

          if (options.paintFlashing) {
            context.fillStyle = randomStyle();
            context.globalAlpha = 0.5;
            context.fillRect(0, 0, frame.w, frame.h);
          }
        }
        context.restore();
        return VisitorFlags.Continue;
      }, transform);

      if (clipRect) {
        context.restore();
      }
    }
  }
}