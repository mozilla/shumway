module Shumway.GFX.Canvas2D {

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
  import MipMap = Shumway.GFX.Geometry.MipMap;

  import ISurfaceRegionAllocator = SurfaceRegionAllocator.ISurfaceRegionAllocator;

  declare var registerScratchCanvas;

  export enum FillRule {
    NonZero,
    EvenOdd
  }

  /**
   * Match up FLash blend modes with Canvas blend operations:
   *
   * See: http://kaourantin.net/2005/09/some-word-on-blend-modes-in-flash.html
   */
  function getCompositeOperation(blendMode: BlendMode): string {
    // TODO:

    // These Flash blend modes have no canvas equivalent:
    // - BlendMode.Subtract
    // - BlendMode.Invert
    // - BlendMode.Shader
    // - BlendMode.Add is similar to BlendMode.Screen

    // These blend modes are actually Porter-Duff compositing operators.
    // The backdrop is the nearest parent with blendMode set to layer.
    // When there is no LAYER parent, they are ignored (treated as NORMAL).
    // - BlendMode.Alpha (destination-in)
    // - BlendMode.Erase (destination-out)
    // - BlendMode.Layer [defines backdrop]

    var compositeOp: string = "source-over";
    switch (blendMode) {
      case BlendMode.Normal:
      case BlendMode.Layer:
        return compositeOp;
      case BlendMode.Multiply:   compositeOp = "multiply";   break;
      case BlendMode.Add:
      case BlendMode.Screen:     compositeOp = "screen";     break;
      case BlendMode.Lighten:    compositeOp = "lighten";    break;
      case BlendMode.Darken:     compositeOp = "darken";     break;
      case BlendMode.Difference: compositeOp = "difference"; break;
      case BlendMode.Overlay:    compositeOp = "overlay";    break;
      case BlendMode.HardLight:  compositeOp = "hard-light"; break;
      default:
        Shumway.Debug.somewhatImplemented("Blend Mode: " + BlendMode[blendMode]);
    }
    return compositeOp;
  }

  export class Canvas2DStageRendererOptions extends StageRendererOptions {
    /**
     * Whether to force snapping matrices to device pixels.
     */
    snapToDevicePixels: boolean = true;

    /**
     * Whether to force image smoothing when drawing images.
     */
    imageSmoothing: boolean = true;

    /**
     * Whether to enable blending.
     */
    blending: boolean = true;

    /**
     * Whether to enable filters.
     */
    filters: boolean = true;

    /**
     * Whether to cache shapes as images.
     */
    cacheShapes: boolean = false;

    /**
     * Shapes above this size are not cached.
     */
    cacheShapesMaxSize: number = 256;

    /**
     * Number of times a shape is rendered before it's elligible for caching.
     */
    cacheShapesThreshold: number = 16;

    /**
     * Enables alpha layer for the canvas context.
     */
    alpha: boolean = false;
  }

  /**
   * Rendering state threaded through rendering methods.
   */
  export class State {
    constructor (
      public options: Canvas2DStageRendererOptions,
      public clipRegion: boolean = false,
      public ignoreMask: Frame = null
      ) {
      // ...
    }
  }

  var MAX_VIEWPORT = Rectangle.createMaxI16();

  export class Canvas2DStageRenderer extends StageRenderer {
    protected _options: Canvas2DStageRendererOptions;
    private _fillRule: string;
    context: CanvasRenderingContext2D;

    private _target: Canvas2DSurfaceRegion;

    private static _initializedCaches: boolean = false;

    /**
     * Allocates temporary regions for performing image operations.
     */
    private static _surfaceCache: ISurfaceRegionAllocator;

    /**
     * Allocates shape cache regions.
     */
    private static _shapeCache: ISurfaceRegionAllocator;


    constructor (
      canvas: HTMLCanvasElement,
      stage: Stage,
      options: Canvas2DStageRendererOptions = new Canvas2DStageRendererOptions()) {
      super(canvas, stage, options);
      var defaultFillRule = FillRule.NonZero;
      this._fillRule = defaultFillRule === FillRule.EvenOdd ? 'evenodd' : 'nonzero';
      this._viewport = new Rectangle(0, 0, canvas.width, canvas.height);
      this._target = new Canvas2DSurfaceRegion(new Canvas2DSurface(canvas),
                                               new RegionAllocator.Region(0, 0, canvas.width, canvas.height));
      this._devicePixelRatio = window.devicePixelRatio || 1;
      Canvas2DStageRenderer._prepareSurfaceAllocators();
    }

    public resize() {
      var canvas = this._canvas;
      var context = this._target.surface.context;
      this._viewport = new Rectangle(0, 0, canvas.width, canvas.height);
      this._target.region.set(this._viewport);
      this._devicePixelRatio = window.devicePixelRatio || 1;
    }

    private static _prepareSurfaceAllocators() {
      if (Canvas2DStageRenderer._initializedCaches) {
        return;
      }

      Canvas2DStageRenderer._surfaceCache = new SurfaceRegionAllocator.SimpleAllocator (
        function (w: number, h: number) {
          var canvas = document.createElement("canvas");
          if (typeof registerScratchCanvas !== "undefined") {
            registerScratchCanvas(canvas);
          }
          // Surface caches are at least this size.
          var W = Math.max(1024, w);
          var H = Math.max(1024, h);
          canvas.width = W;
          canvas.height = H;
          var allocator = null;
          if (w >= 1024 || h >= 1024) {
            // The requested size is pretty large, so create a single grid allocator
            // with there requested size. This will only hold one image.
            allocator = new RegionAllocator.GridAllocator(W, H, W, H);
          } else {
            allocator = new RegionAllocator.BucketAllocator(W, H);
          }
          return new Canvas2DSurface (
            canvas, allocator
          );
        }
      );

      Canvas2DStageRenderer._shapeCache = new SurfaceRegionAllocator.SimpleAllocator (
        function (w: number, h: number) {
          var canvas = document.createElement("canvas");
          if (typeof registerScratchCanvas !== "undefined") {
            registerScratchCanvas(canvas);
          }
          var W = 1024, H = 1024;
          canvas.width = W;
          canvas.height = H;
          // Shape caches can be compact since regions are never freed explicitly.
          var allocator = allocator = new RegionAllocator.CompactAllocator(W, H);
          return new Canvas2DSurface (
            canvas, allocator
          );
        }
      );

      Canvas2DStageRenderer._initializedCaches = true;
    }

    public render() {
      var stage = this._stage;
      var target = this._target;
      var options = this._options;
      var viewport = this._viewport;

      target.resetTransform();
      target.context.save();

      target.context.globalAlpha = 1;
      target.clear(viewport);

      this.renderFrame(stage, viewport, stage.matrix);
      target.context.restore();

      if (options && options.paintViewport) {
        target.context.beginPath();
        target.context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
        target.context.strokeStyle = "#FF4981";
        target.context.stroke();
      }
    }

    public renderFrame(frame: Frame, clip: Rectangle, matrix: Matrix) {
      var target = this._target;
      target.context.save();
      if (!this._options.paintViewport) {
        target.context.beginPath();
        target.context.rect(clip.x, clip.y, clip.w, clip.h);
        target.context.clip();
      }
      this._renderFrame(target.context, frame, matrix, clip, new State(this._options));
      target.context.restore();
    }

    /**
     * Renders the frame into a temporary surface region in device coordinates clipped by the viewport.
     */
    private _renderFrameToSurfaceRegion(frame: Frame, matrix: Matrix, viewport: Rectangle, state: State): Canvas2DSurfaceRegion {
      var bounds = frame.getBounds();
      var boundsAABB = bounds.clone();
      matrix.transformRectangleAABB(boundsAABB);
      boundsAABB.snap();

      var clippedBoundsAABB = boundsAABB.clone();
      clippedBoundsAABB.intersect(viewport);
      clippedBoundsAABB.snap();

      var surfaceRegion = <Canvas2DSurfaceRegion>(Canvas2DStageRenderer._surfaceCache.allocate(clippedBoundsAABB.w, clippedBoundsAABB.h));
      var region = surfaceRegion.region;

      // Region bounds may be smaller than the allocated surface region.
      var surfaceRegionBounds = new Rectangle(region.x, region.y, clippedBoundsAABB.w, clippedBoundsAABB.h);

      var context = surfaceRegion.surface.context;
      context.setTransform(1, 0, 0, 1, 0, 0);
      // Prepare region bounds for painting.
      context.clearRect(surfaceRegionBounds.x, surfaceRegionBounds.y, surfaceRegionBounds.w, surfaceRegionBounds.h);
      matrix = matrix.clone();

      matrix.translate (
        surfaceRegionBounds.x - clippedBoundsAABB.x,
        surfaceRegionBounds.y - clippedBoundsAABB.y
      );

      // Clip region bounds so we don't paint outside.
      context.save();
      context.beginPath();
      context.rect(surfaceRegionBounds.x, surfaceRegionBounds.y, surfaceRegionBounds.w, surfaceRegionBounds.h);
      context.clip();
      this._renderFrame(context, frame, matrix, surfaceRegionBounds, state);
      context.restore();
      return surfaceRegion;
//      return new FrameRenderTarget (
//        surfaceRegion,
//        surfaceRegionBounds,
//        clippedBoundsAABB
//      );
    }

    private _renderShape(context: CanvasRenderingContext2D, shape: Shape, matrix: Matrix, clip: Rectangle, state: State) {
      var self = this;
      var bounds = shape.getBounds();
      if (!bounds.isEmpty() &&
          state.options.paintRenderable) {
        var source = shape.source;
        var renderCount = source.properties["renderCount"] || 0;
        var cacheShapesMaxSize = state.options.cacheShapesMaxSize;
        var matrixScale = Math.max(matrix.getAbsoluteScaleX(), matrix.getAbsoluteScaleY());
        if (!state.clipRegion &&
            !source.hasFlags(RenderableFlags.Dynamic) &&
            state.options.cacheShapes &&
            renderCount > state.options.cacheShapesThreshold &&
            bounds.w * matrixScale <= cacheShapesMaxSize &&
            bounds.h * matrixScale <= cacheShapesMaxSize) {
          var mipMap: MipMap = source.properties["mipMap"];
          if (!mipMap) {
            mipMap = source.properties["mipMap"] = new MipMap(source, Canvas2DStageRenderer._shapeCache, cacheShapesMaxSize);
          }
          var mipMapLevel = mipMap.getLevel(matrix);
          var mipMapLevelSurfaceRegion = <Canvas2DSurfaceRegion>(mipMapLevel.surfaceRegion);
          var region = mipMapLevelSurfaceRegion.region;
          if (mipMapLevel) {
            context.drawImage (
              mipMapLevelSurfaceRegion.surface.canvas,
              region.x, region.y,
              region.w, region.h,
              bounds.x, bounds.y,
              bounds.w, bounds.h
            );
          }
          if (state.options.paintFlashing) {
            context.fillStyle = ColorStyle.Green;
            context.globalAlpha = 0.5;
            context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
          }
        } else {
          source.properties["renderCount"] = ++ renderCount;
          source.render(context, null, state.clipRegion);
          if (state.options.paintFlashing) {
            context.fillStyle = ColorStyle.randomStyle();
            context.globalAlpha = 0.1;
            context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
          }
        }
      }
    }

    /*
    private _renderFrameWithMask (
      context: CanvasRenderingContext2D,
      frame: Frame,
      matrix: Matrix,
      viewport: Rectangle,
      state: Canvas2DStageRendererState) {
      var maskMatrix = frame.mask.getConcatenatedMatrix();
      // If the mask doesn't have a parent, and therefore can't be a descentant of the stage object,
      // we still have to factor in the stage's matrix, which includes pixel density scaling.
      if (!frame.mask.parent) {
        maskMatrix = maskMatrix.concatClone(this._stage.getConcatenatedMatrix());
      }
      // this._renderFrame(context, frame.mask, maskMatrix, viewport, new Canvas2DStageRendererState(state.options, true));
      // this._renderFrame(context, frame, matrix, viewport, new Canvas2DStageRendererState(state.options, false, frame));

      var frameBoundsAABB = frame.getBounds().clone();
      matrix.transformRectangleAABB(frameBoundsAABB);

      var maskBoundsAABB = frame.mask.getBounds().clone();
      maskMatrix.transformRectangleAABB(maskBoundsAABB);

      var resultAABB = frameBoundsAABB;
      resultAABB.intersect(maskBoundsAABB);
      resultAABB.intersect(viewport);
      resultAABB.snap();

      var f = this._renderFrameToSurfaceRegion(frame, matrix, resultAABB, new Canvas2DStageRendererState(state.options, false, frame));
      var m = this._renderFrameToSurfaceRegion(frame.mask, maskMatrix, resultAABB, new Canvas2DStageRendererState(state.options, false, null));

      var b = f.surfaceRegionBounds.clone();
      var t = <Canvas2DSurfaceRegion>(Canvas2DStageRenderer._surfaceCache.allocate(resultAABB.w, resultAABB.h));
      var tContext = t.surface.context;

//      tContext.fillStyle = "red";
//      tContext.fillRect(t.region.x, t.region.y, resultAABB.w, resultAABB.h);
      tContext.clearRect(t.region.x, t.region.y, resultAABB.w, resultAABB.h);

      tContext.globalCompositeOperation = "source-over";
      tContext.setTransform(1, 0, 0, 1, 0, 0);

      f.render(tContext, t.region.x, t.region.y);
      tContext.globalCompositeOperation = "destination-in";
      m.render(tContext, t.region.x, t.region.y);
      m.free();
      f.free();

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.drawImage (
        t.surface.canvas,
        t.region.x,
        t.region.y,
        resultAABB.w,
        resultAABB.h,
        resultAABB.x,
        resultAABB.y,
        resultAABB.w,
        resultAABB.h
      );

      t.surface.free(t);
    }
    */

    private _renderFrame (
      context: CanvasRenderingContext2D,
      root: Frame,
      matrix: Matrix,
      clip: Rectangle,
      state: State,
      skipRoot: boolean = false) {

      var self = this;
      root.visit(function visitFrame(frame: Frame, matrix?: Matrix, flags?: FrameFlags): VisitorFlags {
        if (skipRoot && root === frame) {
          return VisitorFlags.Continue;
        }

        if (!frame.hasFlags(FrameFlags.Visible)) {
          return VisitorFlags.Skip;
        }

        var bounds = frame.getBounds();

        if (state.ignoreMask !== frame && frame.mask && !state.clipRegion) {
          context.save();
          // self._renderFrameWithMask(context, frame, matrix, viewport, state);
          context.restore();
          return VisitorFlags.Skip;
        }

        if (flags & FrameFlags.EnterClip) {
          context.save();
          context.enterBuildingClippingRegion();
          self._renderFrame(context, frame, matrix, MAX_VIEWPORT, new State(state.options, true));
          context.leaveBuildingClippingRegion();
          return;
        } else if (flags & FrameFlags.LeaveClip) {
          context.restore();
          return;
        }

        // Return early if the bounds are not within the viewport.
        if (!clip.intersectsTransformedAABB(bounds, matrix)) {
          return VisitorFlags.Skip;
        }

        if (frame.pixelSnapping === PixelSnapping.Always || state.options.snapToDevicePixels) {
          matrix.snap();
        }

        context.imageSmoothingEnabled =
          frame.smoothing === Smoothing.Always || state.options.imageSmoothing;

        context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);

        Filters._applyColorMatrix(context, frame.getConcatenatedColorMatrix(), state);

        if (flags & FrameFlags.IsMask && !state.clipRegion) {
          return VisitorFlags.Skip;
        }

        var boundsAABB = frame.getBounds().clone();
        matrix.transformRectangleAABB(boundsAABB);
        boundsAABB.snap();

        var shouldApplyFilters = Filters._svgFiltersAreSupported && state.options.filters;

        // Do we need to draw to a temporary surface?
        if (frame !== root && (state.options.blending || shouldApplyFilters)) {
          context.globalCompositeOperation = getCompositeOperation(frame.blendMode);
          if (frame.blendMode !== BlendMode.Normal || frame.filters.length) {
            if (shouldApplyFilters) {
              Filters._applyFilters(self._devicePixelRatio, context, frame.filters);
            }
            var target = self._renderFrameToSurfaceRegion(frame, matrix, clip, new State(self._options));
            /*
            var surfaceRegion = target.surfaceRegion;
            var surfaceRegionBounds = target.surfaceRegionBounds;
            var clippedBounds = target.clippedBounds;
            var region = surfaceRegion.region;
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.drawImage (
              surfaceRegion.surface.canvas,
              surfaceRegionBounds.x,
              surfaceRegionBounds.y,
              surfaceRegionBounds.w,
              surfaceRegionBounds.h,
              clippedBounds.x,
              clippedBounds.y,
              surfaceRegionBounds.w,
              surfaceRegionBounds.h
            );

            Canvas2DStageRenderer._removeFilters(context);
            surfaceRegion.surface.free(surfaceRegion);
            */
            return VisitorFlags.Skip;
          }
        }

        if (frame instanceof Shape) {
          frame.previouslyRenderedAABB = boundsAABB;
          self._renderShape(context, <Shape>frame, matrix, clip, state);
        } else if (frame instanceof ClipRectangle) {
          var clipRectangle = <ClipRectangle>frame;
          context.save();
          context.beginPath();
          context.rect(bounds.x, bounds.y, bounds.w, bounds.h);
          context.clip();
          boundsAABB.intersect(clip);

          if (!frame.hasFlags(FrameFlags.Transparent)) {
            // Fill Background
            context.fillStyle = clipRectangle.color.toCSSStyle();
            context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
          }

          self._renderFrame(context, frame, matrix, boundsAABB, state, true);
          context.restore();
          return VisitorFlags.Skip;
        } else if (state.options.paintBounds && frame instanceof FrameContainer) {
          var bounds = frame.getBounds().clone();
          context.strokeStyle = ColorStyle.LightOrange;
          context.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
        }
        return VisitorFlags.Continue;
      }, matrix, FrameFlags.Empty, VisitorFlags.Clips);
    }
  }
}
