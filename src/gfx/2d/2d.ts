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
  import clamp = Shumway.NumberUtilities.clamp;
  import pow2 = Shumway.NumberUtilities.pow2;
  import epsilonEquals = Shumway.NumberUtilities.epsilonEquals;

  import ISurfaceRegionAllocator = SurfaceRegionAllocator.ISurfaceRegionAllocator;

  declare var registerScratchCanvas;

  var writer = new IndentingWriter(false, dumpLine);

  var MIN_CACHE_LEVELS = 5;
  var MAX_CACHE_LEVELS = 3;

  export class MipMapLevel {
    constructor (
      public surfaceRegion: ISurfaceRegion,
      public scale: number
      ) {
      // ...
    }
  }

  export class MipMap {
    private _source: Node;
    private _size: number;
    private _levels: MipMapLevel [];
    private _surfaceRegionAllocator: SurfaceRegionAllocator.ISurfaceRegionAllocator;
    constructor (
      source: Node,
      surfaceRegionAllocator: SurfaceRegionAllocator.ISurfaceRegionAllocator,
      size: number
      ) {
      this._source = source;
      this._levels = [];
      this._surfaceRegionAllocator = surfaceRegionAllocator;
      this._size = size;
    }
    public render(renderer: Canvas2DStageRenderer) {

    }
    public getLevel(matrix: Matrix): MipMapLevel {
      var matrixScale = Math.max(matrix.getAbsoluteScaleX(), matrix.getAbsoluteScaleY());
      var level = 0;
      if (matrixScale !== 1) {
        level = clamp(Math.round(Math.log(matrixScale) / Math.LN2), -MIN_CACHE_LEVELS, MAX_CACHE_LEVELS);
      }
      if (!(this._source.hasFlags(NodeFlags.Scalable))) {
        level = clamp(level, -MIN_CACHE_LEVELS, 0);
      }
      var scale = pow2(level);
      var levelIndex = MIN_CACHE_LEVELS + level;
      var mipLevel = this._levels[levelIndex];

      if (!mipLevel) {
        var bounds = this._source.getBounds();
        var scaledBounds = bounds.clone();
        scaledBounds.scale(scale, scale);
        scaledBounds.snap();
        var surfaceRegion = this._surfaceRegionAllocator.allocate(scaledBounds.w, scaledBounds.h);
        var region = surfaceRegion.region;
        mipLevel = this._levels[levelIndex] = new MipMapLevel(surfaceRegion, scale);
        // TODO: Should cast to <Canvas2D.Canvas2DSurface> but this is not available in gfx-base. We should probably
        // move this code outside of geometry.
        var surface = <any>(mipLevel.surfaceRegion.surface);
        var context = surface.context;
        context.save();
        context.beginPath();
        context.rect(region.x, region.y, region.w, region.h);
        context.clip();
        context.setTransform(scale, 0, 0, scale, region.x - scaledBounds.x, region.y - scaledBounds.y);
        // this._source.render(context, 0);
        context.restore();
      }
      return mipLevel;
    }
  }

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
     * Whether to enable debugging of layers.
     */
    debugLayers: boolean = false;

    /**
     * Whether to enable masking.
     */
    masking: boolean = true;

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
    PaintClip           = 0x0010,
    PaintRenderable     = 0x0020,

    CacheShapes         = 0x0100,
    PaintFlashing       = 0x0200,
    PaintBounds         = 0x0400,
    ImageSmoothing      = 0x0800,
    PixelSnapping       = 0x1000
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

    public hasFlags(flags: RenderFlags): boolean {
      return (this.flags & flags) === flags;
    }

    public removeFlags(flags: RenderFlags) {
      this.flags &= ~flags;
    }

    public toggleFlags(flags: RenderFlags, on: boolean) {
      if (on) {
        this.flags |= flags;
      } else {
        this.flags &= ~flags;
      }
    }
  }

  export class FrameInfo {
    private _count: number = 0;
    private _enterTime: number;

    shapes = 0;
    groups = 0;
    culledNodes = 0;

    enter(state: RenderState) {
      if (!writer) {
        return;
      }
      writer.enter("> Frame: " + (this._count ++));
      this._enterTime = performance.now();

      this.shapes = 0;
      this.groups = 0;
      this.culledNodes = 0;
    }

    leave() {
      if (!writer) {
        return;
      }
      writer.writeLn("Shapes: " + this.shapes + ", Groups: " + this.groups + ", Culled Nodes: " + this.culledNodes);
      writer.writeLn("Elapsed: " + (performance.now() - this._enterTime).toFixed(2));
      writer.writeLn("Rectangle: " + Rectangle.allocationCount + ", Matrix: " + Matrix.allocationCount);
      writer.leave("<");
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

    private _frameInfo = new FrameInfo();

    private _fontSize: number = 0;

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
      this._fontSize = 10 * this._devicePixelRatio;
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

      if (this._options.debugLayers) {
        target.context.globalAlpha = 0.5;
      }

      target.clear(viewport);

      target.context.beginPath();
      target.context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
      target.context.clip();

      this._renderStageToTarget(target, stage, viewport);

      target.resetTransform();

      if (options.paintViewport) {
        target.context.beginPath();
        target.context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
        target.context.strokeStyle = "#FF4981";
        target.context.globalColorMatrix = null;
        target.context.lineWidth = 1;
        target.context.stroke();
      }

      target.context.restore();
    }

    public renderNode(node: Node, clip: Rectangle, matrix: Matrix) {
      var state = new RenderState(this._target, clip);
      state.flags = RenderFlags.PaintRenderable | RenderFlags.CacheShapes;
      state.matrix.set(matrix);
      node.visit(this, state);
    }

    visitGroup(node: Group, state: RenderState) {

      this._frameInfo.groups ++;

      var bounds = node.getBounds();

      if (node.hasFlags(NodeFlags.IsMask) && !(state.flags & RenderFlags.IgnoreMask)) {
        return;
      }

      if (!node.hasFlags(NodeFlags.Visible)) {
        return;
      }

      if (!(state.flags & RenderFlags.IgnoreNextLayer) &&
          (node.getLayer().blendMode !== BlendMode.Normal || node.getLayer().mask) &&
          this._options.blending) {
        state = state.clone();
        state.flags |= RenderFlags.IgnoreNextLayer;
        this._renderLayer(node, state);
        state.free();
      } else {
        if (state.clip.intersectsTransformedAABB(bounds, state.matrix)) {
          var clips = null;
          var children = node.getChildren();
          for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var childState = state.transform(child.getTransform());
            childState.toggleFlags(RenderFlags.ImageSmoothing, child.hasFlags(NodeFlags.ImageSmoothing));
            if (child.clip >= 0) {
              clips = clips || new Uint8Array(children.length);
              clips[child.clip + i] ++;
              var clipState = childState.clone();
              state.target.context.save();
              clipState.flags |= RenderFlags.PaintClip;
              child.visit(this, clipState);
              clipState.free();
            } else {
              child.visit(this, childState);
            }
            if (clips && clips[i] > 0) {
              while (clips[i]--) {
                state.target.context.restore();
              }
            }
            childState.free();
          }
        } else {
          this._frameInfo.culledNodes ++;
        }
      }

      this._renderDebugInfo(node, state);
    }

    _renderDebugInfo(node: Node, state: RenderState) {
      if (!(state.flags & RenderFlags.PaintBounds)) {
        return;
      }

      var context = state.target.context;
      var bounds = node.getBounds(true);
      var style = node.properties["style"];
      if (!style) {
        style = node.properties["style"] = ColorStyle.randomStyle();
      }

      context.fillStyle = style;
      context.strokeStyle = style;

      state.matrix.transformRectangleAABB(bounds);


      context.setTransform(1, 0, 0, 1, 0, 0);
      if (bounds.w > 32 && bounds.h > 32) {
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = this._fontSize + "px Arial";
        var debugText = "" + node.id; // + "\n" +
          // node.getBounds().w.toFixed(2) + "x" +
          // node.getBounds().h.toFixed(2);
        context.fillText(debugText, bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
      }
      bounds.free();

      var matrix = state.matrix;
      bounds = node.getBounds();
      context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
      context.lineWidth = 1 / matrix.getScale();
      context.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
    }

    visitStage(node: Stage, state: RenderState) {
      var context = state.target.context;
      var bounds = node.getBounds(true);
      state.matrix.transformRectangleAABB(bounds);
      bounds.intersect(state.clip);
      state.target.resetTransform();

//      context.save();
//      context.beginPath();
//      context.rect(bounds.x, bounds.y, bounds.w, bounds.h);
//      context.clip();

      // Fill background
      if (!node.hasFlags(NodeFlags.Transparent) && node.color) {
        if (state.flags & RenderFlags.PaintRenderable) {
          context.fillStyle = node.color.toCSSStyle();
          context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
        }
      }
      state = state.clone();
      state.clip.set(bounds);
      this.visitGroup(node, state);
      state.free();
      bounds.free();
//      context.restore();
    }

    visitShape(node: Shape, state: RenderState) {
      if (!state.clip.intersectsTransformedAABB(node.getBounds(), state.matrix)) {
        return;
      }
      var matrix = state.matrix;
      if (state.flags & RenderFlags.PixelSnapping) {
        matrix = matrix.clone();
        matrix.snap();
      }
      var context = state.target.context;
      if (!this._options.debugLayers) {
        Filters._applyColorMatrix(context, state.colorMatrix);
      }
      // Only paint if it is visible.
      if (context.globalAlpha > 0) {
        this._renderShape(node, state)
      }
      if (state.flags & RenderFlags.PixelSnapping) {
        matrix.free();
      }
    }

    _renderLayer(node: Node, state: RenderState) {
      var layer = node.getLayer();
      var mask = layer.mask;
      if (!mask) {
        var clip = Rectangle.allocate();
        var target = this._renderToTemporarySurface(node, state, clip);
        if (target) {
          var matrix = state.matrix;
          state.target.draw(target, clip.x, clip.y, clip.w, clip.h, layer.blendMode);
          target.free();
        }
        clip.free();
      } else {
        var paintStencil = !node.hasFlags(NodeFlags.CacheAsBitmap) || !mask.hasFlags(NodeFlags.CacheAsBitmap);
        this._renderWithMask(node, mask, layer.blendMode, paintStencil, state);
      }
    }

    _renderWithMask(node: Node, mask: Node, blendMode: BlendMode, stencil: boolean, state: RenderState) {
      var maskMatrix = mask.getTransform().getConcatenatedMatrix(true);
      // If the mask doesn't have a parent, and therefore can't be a descentant of the stage object,
      // we still have to factor in the stage's matrix, which includes pixel density scaling.
      if (!mask.parent) {
        maskMatrix = maskMatrix.concatClone(this._stage.getTransform().getConcatenatedMatrix());
      }

      var aAABB = node.getBounds().clone();
      state.matrix.transformRectangleAABB(aAABB);
      aAABB.snap();
      if (aAABB.isEmpty()) {
        return;
      }

      var bAABB = mask.getBounds().clone();
      maskMatrix.transformRectangleAABB(bAABB);
      bAABB.snap();
      if (bAABB.isEmpty()) {
        return;
      }

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
      var a = this._renderToTemporarySurface(node, aState, Rectangle.createEmpty());
      aState.free();

      var bState = state.clone();
      bState.clip.set(clip);
      bState.matrix = maskMatrix;
      bState.flags |= RenderFlags.IgnoreMask;
      if (stencil) {
        bState.flags |= RenderFlags.PaintStencil;
      }
      var b = this._renderToTemporarySurface(mask, bState, Rectangle.createEmpty());
      bState.free();

      a.draw(b, 0, 0, clip.w, clip.h, BlendMode.Alpha);

      var matrix = state.matrix;
      state.target.draw(a, clip.x, clip.y, clip.w, clip.h, blendMode);

      b.free();
      a.free();
    }

    private _renderStageToTarget (
      target: Canvas2DSurfaceRegion,
      node: Node,
      clip: Rectangle
    ) {
      Rectangle.allocationCount = Matrix.allocationCount = 0;
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

      this._frameInfo.enter(state);

      node.visit(this, state);

      this._frameInfo.leave();
    }

    private _renderToTemporarySurface(node: Node, state: RenderState, clip: Rectangle): Canvas2DSurfaceRegion {
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
      // target.context.beginPath();
      // target.context.rect(surfaceRegionBounds.x, surfaceRegionBounds.y, surfaceRegionBounds.w, surfaceRegionBounds.h);
      // target.context.clip();

      state = state.clone();
      state.target = target;
      state.matrix = matrix;
      state.clip.set(surfaceRegionBounds);
      node.visit(this, state);
      state.free();
      target.context.restore();
      return target;
    }

    private _renderShape(shape: Shape, state: RenderState) {
      var bounds = shape.getBounds();
      var matrix = state.matrix;
      var context = state.target.context;
      var paintClip = !!(state.flags & RenderFlags.PaintClip);
      var paintStencil = !!(state.flags & RenderFlags.PaintStencil);
      var paintFlashing = !!(state.flags & RenderFlags.PaintFlashing);

      if (bounds.isEmpty()) {
        return;
      }

      this._renderDebugInfo(shape, state);
      this._renderDebugInfo(shape.source, state);

      if (!(state.flags & RenderFlags.PaintRenderable)) {
        return;
      }

      context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);

      var source = shape.source;
      var paintStart = 0;
      if (paintFlashing) {
        paintStart = performance.now();
      }

      this._frameInfo.shapes ++;

      context.imageSmoothingEnabled = context.mozImageSmoothingEnabled = state.hasFlags(RenderFlags.ImageSmoothing);

      var renderCount = source.properties["renderCount"] || 0;
      var cacheShapesMaxSize = state.cacheShapesMaxSize;
      var matrixScale = Math.max(matrix.getAbsoluteScaleX(), matrix.getAbsoluteScaleY());

      if (false && !paintStencil &&
          !paintClip &&
          state.colorMatrix.isIdentity() &&
          !source.hasFlags(NodeFlags.Dynamic) &&
          (state.flags & RenderFlags.CacheShapes) &&
          renderCount > state.cacheShapesThreshold &&
          bounds.w * matrixScale <= cacheShapesMaxSize &&
          bounds.h * matrixScale <= cacheShapesMaxSize)
      {
//        var mipMap: MipMap = source.properties["mipMap"];
//        if (!mipMap) {
//          mipMap = source.properties["mipMap"] = new MipMap(source, Canvas2DStageRenderer._shapeCache, cacheShapesMaxSize);
//        }
//        var mipMapLevel = mipMap.getLevel(matrix);
//        var mipMapLevelSurfaceRegion = <Canvas2DSurfaceRegion>(mipMapLevel.surfaceRegion);
//        var region = mipMapLevelSurfaceRegion.region;
//        if (mipMapLevel) {
//          context.drawImage (
//            mipMapLevelSurfaceRegion.surface.canvas,
//            region.x, region.y,
//            region.w, region.h,
//            bounds.x, bounds.y,
//            bounds.w, bounds.h
//          );
//        }
//        if (paintFlashing) {
//          context.fillStyle = ColorStyle.gradientColor(0.1 / elapsed);
//          context.globalAlpha = 0.2 * Math.random();
//          context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
//        }
      } else {
        source.properties["renderCount"] = ++ renderCount;
        source.render(context, shape.ratio, null, paintClip, paintStencil);
        if (paintFlashing) {
          var elapsed = performance.now() - paintStart;
          context.fillStyle = ColorStyle.gradientColor(0.1 / elapsed);
          context.globalAlpha = 0.3 + 0.1 * Math.random();
          context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
        }
      }
    }

    private _allocateSurface(w: number, h: number): Canvas2DSurfaceRegion {
      var surface = <Canvas2DSurfaceRegion>(Canvas2DStageRenderer._surfaceCache.allocate(w, h))
      surface.fill("#FF4981");
      // var color = "rgba(" + (Math.random() * 255 | 0) + ", " + (Math.random() * 255 | 0) + ", " + (Math.random() * 255 | 0) + ", 1)"
      // surface.fill(color);
      return surface;
    }
  }
}
