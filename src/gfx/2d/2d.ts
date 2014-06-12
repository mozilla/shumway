/// <reference path='../references.ts'/>



module Shumway.GFX {

  declare var FILTERS;

  import assert = Shumway.Debug.assert;
  import Rectangle = Shumway.GFX.Geometry.Rectangle;
  import Point = Shumway.GFX.Geometry.Point;
  import Matrix = Shumway.GFX.Geometry.Matrix;
  import DirtyRegion = Shumway.GFX.Geometry.DirtyRegion;
  import Filter = Shumway.GFX.Filter;
  import BlendMode = Shumway.GFX.BlendMode;
  import TileCache = Shumway.GFX.Geometry.TileCache;
  import Tile = Shumway.GFX.Geometry.Tile;
  import OBB = Shumway.GFX.Geometry.OBB;
  import GridAllocator = Shumway.GFX.Geometry.RegionAllocator.GridAllocator;
  import GridCell = Shumway.GFX.Geometry.RegionAllocator.GridCell;
  import Region = Shumway.GFX.Geometry.RegionAllocator.Region;
  import IRegionAllocator = Shumway.GFX.Geometry.RegionAllocator.IRegionAllocator;

  export enum FillRule {
    NONZERO,
    EVENODD
  }

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

  function findIntersectingIndex(rectangle: Rectangle, others: Rectangle []): number {
    for (var i = 0; i < others.length; i++) {
      if (others[i] && others[i].intersects(rectangle)) {
        return i;
      }
    }
    return -1;
  }

  export class Canvas2DStageRendererOptions extends StageRendererOptions {
    disable: boolean;
    clipDirtyRegions: boolean;
    clipCanvas: boolean;
    cull: boolean;
    drawLayers: boolean;

    snapToDevicePixels: boolean;
    imageSmoothing: boolean;
  }

  export class Canvas2DStageRendererState {
    constructor(public options: Canvas2DStageRendererOptions,
                public clipRegion: boolean = false,
                public ignoreMask: Frame = null) {
      // ...
    }
  }

  export class Canvas2DStageRenderer extends StageRenderer {
    _options: Canvas2DStageRendererOptions;
    private _viewport: Rectangle;
    private _fillRule: string;

    context: CanvasRenderingContext2D;
    count = 0;

    constructor(canvas: HTMLCanvasElement,
                stage: Stage,
                options: Canvas2DStageRendererOptions = new Canvas2DStageRendererOptions()) {
      super(canvas, stage, options);
      var fillRule: FillRule = FillRule.NONZERO
      var context = this.context = canvas.getContext("2d");
      this._viewport = new Rectangle(0, 0, context.canvas.width, context.canvas.height);
      this._fillRule = fillRule === FillRule.EVENODD ? 'evenodd' : 'nonzero';
      context.fillRule = context.mozFillRule = this._fillRule;
    }

    public render() {
      if (!this._prepareForRendering()) {
        return;
      }
      var stage = this._stage;
      var context = this.context;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);

      context.save();
      var options = this._options;

      var lastDirtyRectangles: Rectangle[] = [];
      if (stage.trackDirtyRegions) {
        stage.gatherMarkedDirtyRegions(stage.matrix);
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
             * If we have overlapping clipping regions we don't want to use even-odd fill rules.
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

      context.globalAlpha = 1;

      this.renderFrame(context, stage, stage.matrix, new Canvas2DStageRendererState(options));

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

    renderFrame(context: CanvasRenderingContext2D, root: Frame, transform: Matrix, state: Canvas2DStageRendererState) {
      var self = this;

      root.visit(function visitFrame(frame: Frame, transform?: Matrix, flags?: FrameFlags): VisitorFlags {
        if (frame.getBounds().isEmpty()) {
          return;
        }

        if (state.ignoreMask !== frame && frame.mask && !state.clipRegion) {
          context.save();
          self.renderFrame(context, frame.mask, frame.mask.getConcatenatedMatrix(), new Canvas2DStageRendererState(state.options, true));
          self.renderFrame(context, frame, transform, new Canvas2DStageRendererState(state.options, false, frame));
          context.restore();
          return VisitorFlags.Skip;
        }

        if (flags & FrameFlags.EnterClip) {
          context.save();
          self.renderFrame(context, frame, transform, new Canvas2DStageRendererState(state.options, true));
          return;
        } else if (flags & FrameFlags.LeaveClip) {
          context.restore();
          return;
        }

        if (frame.shouldSnapToDevicePixels() && state.options.snapToDevicePixels) {
          transform.snap();
        }
        context.imageSmoothingEnabled = context.mozImageSmoothingEnabled = state.options.imageSmoothing;

        context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
        context.globalAlpha = frame.getConcatenatedAlpha();

        if (flags & FrameFlags.IsMask && !state.clipRegion) {
          return VisitorFlags.Skip;
        }

        var inverseTransform: Matrix = Matrix.createIdentity();
        frame.getConcatenatedMatrix().inverse(inverseTransform);
        var cullBounds = self._viewport.clone();
        inverseTransform.transformRectangleAABB(cullBounds);

        var frameBoundsAABB = frame.getBounds().clone();
        transform.transformRectangleAABB(frameBoundsAABB);
        if (frame instanceof Shape) {
          frame._previouslyRenderedAABB = frameBoundsAABB;
          var shape = <Shape>frame;
          var bounds = shape.getBounds().clone();
          if (!bounds.isEmpty()) {
            shape.source.render(context, cullBounds, state.clipRegion);
          }
          if (state.options.paintFlashing) {
            context.fillStyle = ColorStyle.randomStyle();
            context.globalAlpha = 0.5;
            context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
          }
        } else if (state.options.paintBounds && frame instanceof FrameContainer) {
          var bounds = frame.getBounds().clone();
          context.strokeStyle = ColorStyle.LightOrange;
          context.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
        } else if (frame instanceof ClipRectangle) {
          context.fillStyle = frame.color.toCSSStyle();
          var bounds = frame.getBounds();
          context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
        }

        return VisitorFlags.Continue;
      }, transform, FrameFlags.Empty, VisitorFlags.Clips);
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
        case BlendMode.Multiply:   compositeOp = "multiply";   break;
        case BlendMode.Screen:     compositeOp = "screen";     break;
        case BlendMode.Lighten:    compositeOp = "lighten";    break;
        case BlendMode.Darken:     compositeOp = "darken";     break;
        case BlendMode.Difference: compositeOp = "difference"; break;
        case BlendMode.Overlay:    compositeOp = "overlay";    break;
        case BlendMode.HardLight:  compositeOp = "hard-light"; break;
      }

      return compositeOp;
    }

  }
}
