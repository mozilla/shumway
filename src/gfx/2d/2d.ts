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
  var originalClip = CanvasRenderingContext2D.prototype.clip;
  var originalFill = CanvasRenderingContext2D.prototype.fill;
  var originalStroke = CanvasRenderingContext2D.prototype.stroke;
  var originalRestore = CanvasRenderingContext2D.prototype.restore;
  var originalBeginPath = CanvasRenderingContext2D.prototype.beginPath;

  function debugSave() {
    if (this.stackDepth === undefined) {
      this.stackDepth = 0;
    }
    if (this.clipStack === undefined) {
      this.clipStack = [0];
    } else {
      this.clipStack.push(0);
    }
    this.stackDepth ++;
    originalSave.call(this);
  }

  function debugRestore() {
    this.stackDepth --;
    this.clipStack.pop();
    originalRestore.call(this);
  }

  function debugFill() {
    assert(!this.buildingClippingRegionDepth);
    originalFill.apply(this, arguments);
  }

  function debugStroke() {
    assert(debugClipping.value || !this.buildingClippingRegionDepth);
    originalStroke.apply(this, arguments);
  }

  function debugBeginPath() {
    originalBeginPath.call(this);
  }

  function debugClip() {
    if (this.clipStack === undefined) {
      this.clipStack = [0];
    }
    this.clipStack[this.clipStack.length - 1] ++;
    if (debugClipping.value) {
      this.strokeStyle = ColorStyle.Pink;
      this.stroke.apply(this, arguments);
    } else {
      originalClip.apply(this, arguments);
    }
  }

  export function notifyReleaseChanged() {
    if (release) {
      CanvasRenderingContext2D.prototype.save = originalSave;
      CanvasRenderingContext2D.prototype.clip = originalClip;
      CanvasRenderingContext2D.prototype.fill = originalFill;
      CanvasRenderingContext2D.prototype.stroke = originalStroke;
      CanvasRenderingContext2D.prototype.restore = originalRestore;
      CanvasRenderingContext2D.prototype.beginPath = originalBeginPath;
    } else {
      CanvasRenderingContext2D.prototype.save = debugSave;
      CanvasRenderingContext2D.prototype.clip = debugClip;
      CanvasRenderingContext2D.prototype.fill = debugFill;
      CanvasRenderingContext2D.prototype.stroke = debugStroke;
      CanvasRenderingContext2D.prototype.restore = debugRestore;
      CanvasRenderingContext2D.prototype.beginPath = debugBeginPath;
    }
  }

  CanvasRenderingContext2D.prototype.enterBuildingClippingRegion = function () {
    if (!this.buildingClippingRegionDepth) {
      this.buildingClippingRegionDepth = 0;
    }
    this.buildingClippingRegionDepth ++;
  };

  CanvasRenderingContext2D.prototype.leaveBuildingClippingRegion = function () {
    this.buildingClippingRegionDepth --;
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
      var stage = this._stage;
      var context = this.context;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);

      context.save();
      var options = this._options;

      var lastDirtyRectangles: Rectangle[] = [];
      if (false && stage.trackDirtyRegions) {
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

      var viewport = this._viewport;
      this.renderClippedFrame(stage, viewport, stage.matrix);

      if (stage.trackDirtyRegions) {
        stage.dirtyRegion.clear();
      }

      context.restore();

      if (options && options.paintViewport) {
        context.beginPath();
        context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
        context.strokeStyle = "#FF4981";
        context.stroke();
      }
    }

    static clearContext(context: CanvasRenderingContext2D, rectangle: Rectangle) {
      var canvas = context.canvas;
      context.clearRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
    }

    renderClippedFrame(source: Frame, viewport: Rectangle, matrix: Matrix) {
      var context = this.context;
      context.save();
      if (!this._options.paintViewport) {
        context.beginPath();
        context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
        context.clip();
      }
      context.save();
      this._renderFrame(context, source, matrix, viewport, new Canvas2DStageRendererState(this._options));
      context.restore();
      context.restore();
    }

    private _renderFrame(context: CanvasRenderingContext2D, root: Frame, transform: Matrix, viewport: Rectangle, state: Canvas2DStageRendererState) {
      var self = this;

      root.visit(function visitFrame(frame: Frame, transform?: Matrix, flags?: FrameFlags): VisitorFlags {
        var bounds = frame.getBounds();

        if (state.ignoreMask !== frame && frame.mask && !state.clipRegion) {
          context.save();
          self._renderFrame(context, frame.mask, frame.mask.getConcatenatedMatrix(), viewport, new Canvas2DStageRendererState(state.options, true));
          self._renderFrame(context, frame, transform, viewport, new Canvas2DStageRendererState(state.options, false, frame));
          context.restore();
          return VisitorFlags.Skip;
        }

        if (flags & FrameFlags.EnterClip) {
          context.save();
          context.enterBuildingClippingRegion();
          self._renderFrame(context, frame, transform, viewport, new Canvas2DStageRendererState(state.options, true));
          context.leaveBuildingClippingRegion();
          return;
        } else if (flags & FrameFlags.LeaveClip) {
          context.restore();
          return;
        }

        // Return early if the bounds are not within the viewport.
        if (!viewport.intersectsTransformedAABB(bounds, transform)) {
          return VisitorFlags.Skip;
        }

        if (frame.pixelSnapping === PixelSnapping.Always || state.options.snapToDevicePixels) {
          transform.snap();
        }

        context.imageSmoothingEnabled =
          frame.smoothing === Smoothing.Always || state.options.imageSmoothing;

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
          if (!bounds.isEmpty() && state.options.paintRenderable) {
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
