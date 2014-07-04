/// <reference path='../references.ts'/>



module Shumway.GFX.Canvas2D {

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

  export enum FillRule {
    NONZERO,
    EVENODD
  }

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
    constructor (
      public options: Canvas2DStageRendererOptions,
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

    private _surfaceRegionAllocator: SurfaceRegionAllocator.ISurfaceRegionAllocator;
    private _scratchCanvas: HTMLCanvasElement;
    private _scratchCanvasContext: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement,
                stage: Stage,
                options: Canvas2DStageRendererOptions = new Canvas2DStageRendererOptions()) {
      super(canvas, stage, options);
      var fillRule: FillRule = FillRule.NONZERO
      var context = this.context = canvas.getContext("2d");
      this._viewport = new Rectangle(0, 0, context.canvas.width, context.canvas.height);
      this._fillRule = fillRule === FillRule.EVENODD ? 'evenodd' : 'nonzero';
      context.fillRule = context.mozFillRule = this._fillRule;

      this._surfaceRegionAllocator = new SurfaceRegionAllocator.SimpleAllocator (
        function () {
          var canvas = document.createElement("canvas");
          // document.getElementById("temporaryCanvasPanelContainer").appendChild(canvas);
          canvas.width = canvas.height = 1024;
          return new Canvas2DSurface(canvas);
        }
      );
    }

    public render() {
      var stage = this._stage;
      var context = this.context;

      context.setTransform(1, 0, 0, 1, 0, 0);

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
      this.renderFrame(stage, viewport, stage.matrix);

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

    public renderFrame(root: Frame,
                       viewport: Rectangle,
                       matrix: Matrix) {
      var context = this.context;
      context.save();
      if (!this._options.paintViewport) {
        context.beginPath();
        context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
        context.clip();
      }
      context.clearRect(viewport.x, viewport.y, viewport.w, viewport.h);
      this._renderFrame(context, root, matrix, viewport, new Canvas2DStageRendererState(this._options));
      context.restore();
    }

    private _renderToTextureRegion(frame: Frame, transform: Matrix): Canvas2DSurfaceRegion {
      var bounds = frame.getBounds();
      var frameBoundsAABB = bounds.clone();
      transform.transformRectangleAABB(frameBoundsAABB);
      var surfaceRegion = <Canvas2DSurfaceRegion>(this._surfaceRegionAllocator.allocate(frameBoundsAABB.w, frameBoundsAABB.h));
      var region = surfaceRegion.region;
      var context = surfaceRegion.surface.context;
      context.clearRect(region.x, region.y, region.w, region.h);
      transform = transform.clone();
      transform.translate(region.x - frameBoundsAABB.x, region.y - frameBoundsAABB.y);
      this._renderFrame(context, frame, transform, region, new Canvas2DStageRendererState(this._options));
      return surfaceRegion;
    }

    private _renderFrame(context: CanvasRenderingContext2D,
                         root: Frame,
                         transform: Matrix,
                         viewport: Rectangle,
                         state: Canvas2DStageRendererState,
                         skipFirst: boolean = false) {
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

        context.globalCompositeOperation = self._getCompositeOperation(frame.blendMode);
        if (frame.blendMode !== BlendMode.Normal) {
//          var textureRegion = self._renderToTextureRegion(frame, transform);
//          context.drawImage(textureRegion.texture.canvas, 0, 0);
//          textureRegion.region.allocator.free(textureRegion.region);
//          return VisitorFlags.Skip;
        }

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
        } else if (frame instanceof ClipRectangle) {
          context.save();
          context.beginPath();
          context.rect(bounds.x, bounds.y, bounds.w, bounds.h);
          context.clip();
          self._renderFrame(context, frame, transform, frameBoundsAABB, state, true);
          context.restore();
          return VisitorFlags.Skip;
        } else if (state.options.paintBounds && frame instanceof FrameContainer) {
          var bounds = frame.getBounds().clone();
          context.strokeStyle = ColorStyle.LightOrange;
          context.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
        }
        return VisitorFlags.Continue;
      }, transform, FrameFlags.Empty, VisitorFlags.Clips | (skipFirst ? VisitorFlags.SkipFirst : 0));
    }

    private _getCompositeOperation(blendMode: BlendMode): string {
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
