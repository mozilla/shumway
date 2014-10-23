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

  var writer = new IndentingWriter();

  export enum FillRule {
    NonZero,
    EvenOdd
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

  export enum RenderFlags {
    None                = 0x0000,
    IgnoreNextLayer     = 0x0001,
    RenderMask          = 0x0002,
    IgnoreMask          = 0x0004,
    PaintStencil        = 0x0008,
    PaintRenderable     = 0x0010,

    CacheShapes         = 0x0100,
    PaintFlashing       = 0x0200,
    PaintBounds         = 0x0400,
    ImageSmoothing      = 0x0800,
    PixelSnapping       = 0x1000
  }

  /**
   * Rendering state threaded through rendering methods.
   */
  export class XState {
    constructor (
      public options: Canvas2DStageRendererOptions,
      public clipRegion: boolean = false,
      public ignoreMask: Frame = null
      ) {
      // ...
    }
  }

  var MAX_VIEWPORT = Rectangle.createMaxI16();

  export class RenderState extends State {
    private static _dirtyStack: RenderState [] = [];

    clip: Rectangle = Rectangle.createEmpty();
    target: Canvas2DSurfaceRegion = null;
    matrix: Matrix = Matrix.createIdentity();
    colorMatrix: ColorMatrix = ColorMatrix.createIdentity();
    flags: RenderFlags = RenderFlags.None;
    cacheShapesMaxSize: number = 256;
    cacheShapesThreshold: number = 16;

    private _dirty: boolean;


    options: Canvas2DStageRendererOptions;
    clipRegion: boolean; // Remove me.

    constructor(target: Canvas2DSurfaceRegion, clip: Rectangle) {
      super();
      this._dirty = false;
      this.clip.set(clip);
      this.target = target;
    }

    set (state: RenderState) {
      this.clip.set(state.clip);
      this.target = state.target;
      this.matrix.set(state.matrix);
      this.colorMatrix.set(state.colorMatrix);
      this.flags = state.flags;
      this.cacheShapesMaxSize = state.cacheShapesMaxSize;
      this.cacheShapesThreshold = state.cacheShapesThreshold;
    }

    public clone(): RenderState {
      var state: RenderState = RenderState.allocate();
      if (!state) {
        state = new RenderState(this.target, this.clip);
      }
      state.set(this);
      return state;
    }

    static allocate(): RenderState {
      var dirtyStack = RenderState._dirtyStack;
      var state = null;
      if (dirtyStack.length) {
        state = dirtyStack.pop();
        state._dirty = false;
      }
      return state;
    }

    free() {
      release || assert (!this._dirty)
      RenderState._dirtyStack.push(this);
      this._dirty = true;
    }

    transform(transform: Transform): RenderState {
      var state = this.clone();
      state.matrix.preMultiply(transform.getMatrix());
      if (transform.hasColorMatrix()) {
        state.colorMatrix.multiply(transform.getColorMatrix());
      }
      return state;
    }
  }

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

    private _visited: number = 0;

    constructor (
      canvas: HTMLCanvasElement,
      stage: Stage,
      options: Canvas2DStageRendererOptions = new Canvas2DStageRendererOptions()) {
      super(canvas, stage, options);
      var defaultFillRule = FillRule.NonZero;
      this._fillRule = defaultFillRule === FillRule.EvenOdd ? 'evenodd' : 'nonzero';
      this._viewport = new Rectangle(0, 0, canvas.width, canvas.height);
      this._target = new Canvas2DSurfaceRegion(new Canvas2DSurface(canvas),
                                               new RegionAllocator.Region(0, 0, canvas.width, canvas.height),
                                               canvas.width, canvas.height);
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

      var minSurfaceSize = 1024;
      Canvas2DStageRenderer._surfaceCache = new SurfaceRegionAllocator.SimpleAllocator (
        function (w: number, h: number) {
          var canvas = document.createElement("canvas");
          if (typeof registerScratchCanvas !== "undefined") {
            registerScratchCanvas(canvas);
          }
          // Surface caches are at least this size.
          var W = Math.max(minSurfaceSize, w);
          var H = Math.max(minSurfaceSize, h);
          canvas.width = W;
          canvas.height = H;
          var allocator = null;
          if (w >= 1024 / 2 || h >= 1024 / 2) {
            // The requested size is very large, so create a single grid allocator
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
          var W = minSurfaceSize, H = minSurfaceSize;
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

      // stage.visit(new TracingNodeVisitor(new IndentingWriter()), null);

      target.resetTransform();
      target.context.save();
      target.context.globalAlpha = 1;
      target.clear(viewport);

      if (!options.paintViewport) {
        target.context.beginPath();
        target.context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
        target.context.clip();
      }
      this._renderStageToTarget(target, stage, viewport);
      target.context.restore();

      if (options && options.paintViewport) {
        target.context.beginPath();
        target.context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
        target.context.strokeStyle = "#FF4981";
        target.context.stroke();
      }
    }

    public renderNode(node: Node, clip: Rectangle, matrix: Matrix) {
      var state = new RenderState(this._target, clip);
      state.matrix.set(matrix);
      node.visit(this, state);
    }

    visitGroup(node: Group, state: RenderState) {
      var bounds = node.getBounds();

      if (state.flags & RenderFlags.PaintBounds) {
        var matrix = state.matrix;
        var context = state.target.context;
        context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        context.strokeStyle = ColorStyle.LightOrange;
        context.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
      }

      if (node.hasFlags(NodeFlags.IsMask) && !(state.flags & RenderFlags.IgnoreMask)) {
        return;
      }

      if (!(state.flags & RenderFlags.IgnoreNextLayer) &&
          (node.getLayer().blendMode !== BlendMode.Normal || node.getLayer().mask)) {
        state = state.clone();
        state.flags |= RenderFlags.IgnoreNextLayer;
        this.renderLayer(node, state);
        state.free();
      } else {
        if (state.clip.intersectsTransformedAABB(bounds, state.matrix)) {
          var children = node.getChildren();
          for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var childState = state.transform(child.getTransform());
            children[i].visit(this, childState);
            childState.free();
          }
        }
      }
    }

    visitScissor(node: Scissor, state: RenderState) {
      var context = state.target.context;
      var bounds = node.getBounds(true);
      state.matrix.transformRectangleAABB(bounds);
      // context.rect(bounds.x, bounds.y, bounds.w, bounds.h);
      // context.clip();
      // Fill background
      if (!node.hasFlags(NodeFlags.Transparent)) {
        context.fillStyle = node.color.toCSSStyle();
        context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
      }
      state = state.clone();
      state.clip.set(bounds);
      this.visitGroup(node, state);
      state.free();
      bounds.free();
    }


    visitShape(node: Shape, state: RenderState) {
      if (!(state.flags & RenderFlags.PaintRenderable)) {
        return;
      }
      if (state.clip.intersectsTransformedAABB(node.getBounds(), state.matrix)) {
        var matrix = state.matrix;
        if (state.flags & RenderFlags.PixelSnapping) {
          matrix = matrix.clone();
          matrix.snap();
        }
        state.target.context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        Filters._applyColorMatrix(state.target.context, state.colorMatrix);
        this._renderShape(node, state)
        if (state.flags & RenderFlags.PixelSnapping) {
          matrix.free();
        }
      }
    }

    renderLayer(node: Node, state: RenderState) {
      var layer = node.getLayer();
      var mask = layer.mask;
      if (!mask) {
        var clip = Rectangle.allocate();
        var target = this._renderNodeToTemporarySurface(node, state, clip);
        if (target) {
          var matrix = state.matrix;
          state.target.blendMode = layer.blendMode;
          // state.target.context.globalAlpha = 1;
          state.target.draw(target, clip.x, clip.y, clip.w, clip.h);
          target.free();
        }
        clip.free();
      } else {
        var maskMatrix = mask.getTransform().getConcatenatedMatrix(true);
        // If the mask doesn't have a parent, and therefore can't be a descentant of the stage object,
        // we still have to factor in the stage's matrix, which includes pixel density scaling.
        if (!mask.parent) {
          maskMatrix = maskMatrix.concatClone(this._stage.getTransform().getConcatenatedMatrix());
        }

        var aAABB = node.getBounds().clone();
        state.matrix.transformRectangleAABB(aAABB);
        aAABB.snap();

        var bAABB = mask.getBounds().clone();
        maskMatrix.transformRectangleAABB(bAABB);
        bAABB.snap();

        var clip = state.clip.clone();
        clip.intersect(aAABB);
        clip.intersect(bAABB);
        clip.snap();

        // The masked area is empty, so nothing to do here.
        if (clip.isEmpty()) {
          return;
        }

        var aState = state.clone();
        aState.clip.set(clip);
        var a = this._renderNodeToTemporarySurface(node, aState, Rectangle.createEmpty());
        aState.free();

        var bState = state.clone();
        bState.clip.set(clip);
        bState.matrix = maskMatrix;
        bState.flags |= RenderFlags.IgnoreMask;
        if (!node.hasFlags(NodeFlags.CacheAsBitmap) || !mask.hasFlags(NodeFlags.CacheAsBitmap)) {
          bState.flags |= RenderFlags.PaintStencil;
        }
        var b = this._renderNodeToTemporarySurface(mask, bState, Rectangle.createEmpty());
        bState.free();

        a.blendMode = BlendMode.Alpha;
        a.draw(b, 0, 0, clip.w, clip.h);
        a.blendMode = BlendMode.Normal; // TODO: Stack of blend modes? to avoid this kind of mess?

        var matrix = state.matrix;
        state.target.blendMode = layer.blendMode;
        state.target.draw(a, clip.x, clip.y, clip.w, clip.h);

        b.free();
        a.free();
      }
    }

    private _renderStageToTarget (
      target: Canvas2DSurfaceRegion,
      node: Node,
      clip: Rectangle
    ) {
      this._visited = 0;
      var state = new RenderState(target, clip);
      
      if (this._options.paintRenderable) {
        state.flags |= RenderFlags.PaintRenderable;
      }
      if (this._options.paintBounds) {
        state.flags |= RenderFlags.PaintBounds;
      }
      if (this._options.paintFlashing) {
        state.flags |= RenderFlags.PaintFlashing;
      }
      if (this._options.cacheShapes) {
        state.flags |= RenderFlags.CacheShapes;
      }
      if (this._options.imageSmoothing) {
        state.flags |= RenderFlags.ImageSmoothing;
      }
      if (this._options.snapToDevicePixels) {
        state.flags |= RenderFlags.PixelSnapping;
      }

      node.visit(this, state);
      dumpLine("Visited: " + this._visited);
    }

    private _renderNodeToTemporarySurface(node: Node, state: RenderState, clip: Rectangle): Canvas2DSurfaceRegion {
      var matrix = state.matrix;
      var bounds = node.getBounds();
      var boundsAABB = bounds.clone();
      matrix.transformRectangleAABB(boundsAABB);
      boundsAABB.snap();

      clip.set(boundsAABB);
      clip.intersect(state.clip);
      clip.snap();

      if (clip.isEmpty()) {
        return null;
      }

      var target = this._allocateSurface(clip.w, clip.h);
      var region = target.region;

      // Region bounds may be smaller than the allocated surface region.
      var surfaceRegionBounds = new Rectangle(region.x, region.y, clip.w, clip.h);

      target.context.setTransform(1, 0, 0, 1, 0, 0);
      target.clear();
      matrix = matrix.clone();

      matrix.translate (
        surfaceRegionBounds.x - clip.x,
        surfaceRegionBounds.y - clip.y
      );

      // Clip region bounds so we don't paint outside.
      target.context.save();

      // We can't do this becuse we could be clipping some other temporary region in the same context.
//      target.context.beginPath();
//      target.context.rect(surfaceRegionBounds.x, surfaceRegionBounds.y, surfaceRegionBounds.w, surfaceRegionBounds.h);
//      target.context.clip();

      state = state.clone();
      state.target = target;
      state.matrix = matrix;
      state.clip = surfaceRegionBounds;
      node.visit(this, state);
      state.free();
      target.context.restore();
      return target;
    }

    private _renderShape(shape: Shape, state: RenderState) {
      var context = state.target.context;
      var matrix = state.matrix;
      var clip = state.clip;

      var self = this;
      var bounds = shape.getBounds();
      if (!bounds.isEmpty()) {
        var source = shape.source;
        var renderCount = source.properties["renderCount"] || 0;
        var cacheShapesMaxSize = state.cacheShapesMaxSize;
        var matrixScale = Math.max(matrix.getAbsoluteScaleX(), matrix.getAbsoluteScaleY());
        if (state.colorMatrix.isIdentity() &&
            !state.clipRegion &&
            !source.hasFlags(RenderableFlags.Dynamic) &&
            (state.flags & RenderFlags.CacheShapes) &&
            renderCount > state.cacheShapesThreshold &&
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
            context.imageSmoothingEnabled =
            context.mozImageSmoothingEnabled = !!(state.flags & RenderFlags.ImageSmoothing);
            context.drawImage (
              mipMapLevelSurfaceRegion.surface.canvas,
              region.x, region.y,
              region.w, region.h,
              bounds.x, bounds.y,
              bounds.w, bounds.h
            );
          }
          if (state.flags & RenderFlags.PaintFlashing) {
            context.fillStyle = ColorStyle.Green;
            context.globalAlpha = 0.5;
            context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
          }
        } else {
          source.properties["renderCount"] = ++ renderCount;
          source.render(context, null, state.clipRegion, !!(state.flags & RenderFlags.PaintStencil));
          if (state.flags & RenderFlags.PaintFlashing) {
            context.fillStyle = ColorStyle.randomStyle();
            context.globalAlpha = 0.1;
            context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
          }
        }
      }
    }


    private _allocateSurface(w: number, h: number): Canvas2DSurfaceRegion {
      var surface = <Canvas2DSurfaceRegion>(Canvas2DStageRenderer._surfaceCache.allocate(w, h))
      surface.fill("#FF4981");
//      var color = "rgba(" + (Math.random() * 255 | 0) + ", " + (Math.random() * 255 | 0) + ", " + (Math.random() * 255 | 0) + ", 1)"
//      surface.fill(color);
      return surface;
    }

    /*
    private _renderNode (
      target: Canvas2DSurfaceRegion,
      root: Node,
      matrix: Matrix,
      clip: Rectangle,
      state: State,
      renderFlags: RenderFlags = RenderFlags.None) {

      var clipResult = Rectangle.createEmpty();

      var self = this;
      root.visit(function visitFrame(node: Node, matrix?: Matrix, flags?: NodeFlags): VisitorFlags {

        // This is useful in a recursive call when we want to avoid rendering the frame we recursed on.
        if (renderFlags & RenderFlags.IgnoreFirstFrame && root === node) {
          return VisitorFlags.Continue;
        }

        // Invisible, so nothing to do here.
        if (!node.hasFlags(NodeFlags.Visible)) {
          return VisitorFlags.Skip;
        }

        target.blendMode = BlendMode.Normal;

        var bounds = node.getBounds();

//        if (state.ignoreMask !== frame && frame.mask && !state.clipRegion) {
//          target.context.save();
//          // self._renderNodeWithMask(context, frame, matrix, viewport, state);
//          target.context.restore();
//          return VisitorFlags.Skip;
//        }

         if (node.mask && !(renderFlags & RenderFlags.IgnoreMask)) {
            target.context.save();
            self._renderNodeWithMask(target, node, matrix, clip, state, renderFlags);
            target.context.restore();
            return VisitorFlags.Skip;
        }

        if (flags & NodeFlags.EnterClip) {
          target.context.save();
          target.context.enterBuildingClippingRegion();
          self._renderNode(target, node, matrix, MAX_VIEWPORT, new State(state.options, true));
          target.context.leaveBuildingClippingRegion();
          return;
        } else if (flags & NodeFlags.LeaveClip) {
          target.context.restore();
          return;
        }

        // Return early if the bounds are not within the viewport.
        if (!clip.intersectsTransformedAABB(bounds, matrix)) {
          return VisitorFlags.Skip;
        }

        if (node.pixelSnapping === PixelSnapping.Always || state.options.snapToDevicePixels) {
          matrix.snap();
        }

        target.context.imageSmoothingEnabled = node.smoothing === Smoothing.Always || state.options.imageSmoothing;

        target.context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);

        // Filters._applyColorMatrix(target.context, frame.getConcatenatedColorMatrix(), state);

        if (flags & NodeFlags.IsMask && !(renderFlags & RenderFlags.RenderMask)) {
          return VisitorFlags.Skip;
        }

        var boundsAABB = node.getBounds().clone();
        matrix.transformRectangleAABB(boundsAABB);
        boundsAABB.snap();

        var shouldApplyFilters = Filters._svgFiltersAreSupported && state.options.filters;

        // Do we need to draw to a temporary surface?
        if (node !== root && (state.options.blending || shouldApplyFilters)) {
          if (node.blendMode !== BlendMode.Normal || node.filters.length) {
            if (shouldApplyFilters) {
              // Filters._applyFilters(self._devicePixelRatio, target.context, frame.filters);
            }
            var a = self._renderNodeToSurfaceRegion(node, matrix, clip, clipResult, new State(self._options));
            target.blendMode = node.blendMode;
            target.draw(a, clipResult.x, clipResult.y, clipResult.w, clipResult.h);
            a.free();

            return VisitorFlags.Skip;
          }
        }

        if (node instanceof Shape) {
          self._renderShape(target.context, <Shape>node, matrix, clip, state);
        } else if (node instanceof ClipRectangle) {
          target.context.save();
          target.context.beginPath();
          target.context.rect(bounds.x, bounds.y, bounds.w, bounds.h);
          target.context.clip();
          boundsAABB.intersect(clip);
          // Fill background
          if (!node.hasFlags(NodeFlags.Transparent)) {
            var clipRectangle = <ClipRectangle>node;
            target.context.fillStyle = clipRectangle.color.toCSSStyle();
            target.context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
          }
          self._renderNode(target, node, matrix, boundsAABB, state, renderFlags | RenderFlags.IgnoreFirstFrame);
          target.context.restore();
          return VisitorFlags.Skip;
        }
        // Paint bounding boxes for debugging purposes.
        else if (state.options.paintBounds && node instanceof FrameContainer) {
          var bounds = node.getBounds().clone();
          target.context.strokeStyle = ColorStyle.LightOrange;
          target.context.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
        }
        return VisitorFlags.Continue;
      }, matrix, NodeFlags.Empty, VisitorFlags.Clips);
    }
    */
  }
}
