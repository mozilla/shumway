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

  var writer = null; // new IndentingWriter(false, dumpLine);

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
    private _node: Node;
    private _size: number;
    private _levels: MipMapLevel [];
    private _renderer: Canvas2DRenderer;
    private _surfaceRegionAllocator: SurfaceRegionAllocator.ISurfaceRegionAllocator;
    constructor (
      renderer: Canvas2DRenderer,
      node: Node,
      surfaceRegionAllocator: SurfaceRegionAllocator.ISurfaceRegionAllocator,
      size: number
      ) {
      this._node = node;
      this._levels = [];
      this._surfaceRegionAllocator = surfaceRegionAllocator;
      this._size = size;
      this._renderer = renderer;
    }
    public getLevel(matrix: Matrix): MipMapLevel {
      var matrixScale = Math.max(matrix.getAbsoluteScaleX(), matrix.getAbsoluteScaleY());
      var level = 0;
      if (matrixScale !== 1) {
        level = clamp(Math.round(Math.log(matrixScale) / Math.LN2), -MIN_CACHE_LEVELS, MAX_CACHE_LEVELS);
      }
      if (!(this._node.hasFlags(NodeFlags.Scalable))) {
        level = clamp(level, -MIN_CACHE_LEVELS, 0);
      }
      var scale = pow2(level);
      var levelIndex = MIN_CACHE_LEVELS + level;
      var mipLevel = this._levels[levelIndex];

      if (!mipLevel) {
        var bounds = this._node.getBounds();
        var scaledBounds = bounds.clone();
        scaledBounds.scale(scale, scale);
        scaledBounds.snap();
        var surfaceRegion: Canvas2DSurfaceRegion = <any>this._surfaceRegionAllocator.allocate(scaledBounds.w, scaledBounds.h, null);
        // surfaceRegion.fill(ColorStyle.randomStyle());
        var region = surfaceRegion.region;
        mipLevel = this._levels[levelIndex] = new MipMapLevel(surfaceRegion, scale);
        var surface = <Canvas2D.Canvas2DSurface>(mipLevel.surfaceRegion.surface);
        var context = surface.context;

//        context.save();
//        context.beginPath();
//        context.rect(region.x, region.y, region.w, region.h);
//        context.clip();
//        context.setTransform(scale, 0, 0, scale, region.x - scaledBounds.x, region.y - scaledBounds.y);

        var state = new RenderState(surfaceRegion);
        state.clip.set(region);
        state.matrix.setElements(scale, 0, 0, scale, region.x - scaledBounds.x, region.y - scaledBounds.y);
        state.flags |= RenderFlags.IgnoreNextRenderWithCache;
        this._renderer.renderNodeWithState(this._node, state);
        state.free();

        // context.restore();
      }
      return mipLevel;
    }
  }

  export enum FillRule {
    NonZero,
    EvenOdd
  }

  export class Canvas2DRendererOptions extends RendererOptions {
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
    None                        = 0x0000,
    IgnoreNextLayer             = 0x0001,
    RenderMask                  = 0x0002,
    IgnoreMask                  = 0x0004,
    PaintStencil                = 0x0008,
    PaintClip                   = 0x0010,
    IgnoreRenderable            = 0x0020,
    IgnoreNextRenderWithCache   = 0x0040,

    CacheShapes                 = 0x0100,
    PaintFlashing               = 0x0200,
    PaintBounds                 = 0x0400,
    PaintDirtyRegion            = 0x0800,
    ImageSmoothing              = 0x1000,
    PixelSnapping               = 0x2000
  }

  var MAX_VIEWPORT = Rectangle.createMaxI16();

  /**
   * Render state.
   */
  export class RenderState extends State {

    static allocationCount = 0;

    private static _dirtyStack: RenderState [] = [];

    clip: Rectangle = Rectangle.createEmpty();
    clipList: Rectangle [] = [];
    clipPath: Path2D = null;
    flags: RenderFlags = RenderFlags.None;
    target: Canvas2DSurfaceRegion = null;
    matrix: Matrix = Matrix.createIdentity();
    colorMatrix: ColorMatrix = ColorMatrix.createIdentity();

    options: Canvas2DRendererOptions;

    constructor(target: Canvas2DSurfaceRegion) {
      super();
      RenderState.allocationCount ++;
      this.target = target;
    }

    set (state: RenderState) {
      this.clip.set(state.clip);
      this.clipPath = state.clipPath;
      this.target = state.target;
      this.matrix.set(state.matrix);
      this.colorMatrix.set(state.colorMatrix);
      this.flags = state.flags;
      ArrayUtilities.copyFrom(this.clipList, state.clipList);
    }

    public clone(): RenderState {
      var state: RenderState = RenderState.allocate();
      if (!state) {
        state = new RenderState(this.target);
      }
      state.set(this);
      return state;
    }

    static allocate(): RenderState {
      var dirtyStack = RenderState._dirtyStack;
      var state = null;
      if (dirtyStack.length) {
        state = dirtyStack.pop();
      }
      return state;
    }

    free() {
      this.clipPath = null;
      RenderState._dirtyStack.push(this);
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

    beginClipPath(transform: Matrix) {
      this.target.context.save();
      this.clipPath = new Path2D();
    }

    applyClipPath() {
      var context = this.target.context;
      // Coords in clipPath are defined in global space, so have to reset the current transform, ...
      context.setTransform(1, 0, 0, 1, 0, 0);
      // ... apply the clip ...
      context.clip(this.clipPath);
      // ... and finally restore the current transform.
      var matrix = this.matrix;
      context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
    }

    closeClipPath() {
      this.target.context.restore();
    }
  }

  /**
   * Stats for each rendered frame.
   */
  export class FrameInfo {
    private _count: number = 0;
    private _enterTime: number;

    shapes = 0;
    groups = 0;
    culledNodes = 0;

    enter(state: RenderState) {
      Shumway.GFX.enterTimeline("Frame", {frame: this._count});
      this._count ++;
      if (!writer) {
        return;
      }
      writer.enter("> Frame: " + this._count);
      this._enterTime = performance.now();

      this.shapes = 0;
      this.groups = 0;
      this.culledNodes = 0;
    }

    leave() {
      Shumway.GFX.leaveTimeline("Frame");
      if (!writer) {
        return;
      }
      writer.writeLn("Shapes: " + this.shapes + ", Groups: " + this.groups + ", Culled Nodes: " + this.culledNodes);
      writer.writeLn("Elapsed: " + (performance.now() - this._enterTime).toFixed(2));
      writer.writeLn("Rectangle: " + Rectangle.allocationCount + ", Matrix: " + Matrix.allocationCount + ", State: " + RenderState.allocationCount);
      writer.leave("<");
    }
  }

  export class Canvas2DRenderer extends Renderer {
    protected _options: Canvas2DRendererOptions;
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

    /**
     * Stack of rendering layers. Stage video lives at the bottom of this stack.
     */
    private _layers: HTMLDivElement [] = [];

    constructor (
      container: HTMLDivElement | HTMLCanvasElement,
      stage: Stage,
      options: Canvas2DRendererOptions = new Canvas2DRendererOptions())
    {
      super(container, stage, options);
      if (container instanceof HTMLCanvasElement) {
        var canvas = container;
        this._viewport = new Rectangle(0, 0, canvas.width, canvas.height);
        this._target = this._createTarget(canvas);
      } else {
        this._addLayer("Background Layer");
        var canvasLayer = this._addLayer("Canvas Layer");
        var canvas = document.createElement("canvas");
        canvasLayer.appendChild(canvas);
        this._viewport = new Rectangle(0, 0, container.scrollWidth, container.scrollHeight);
        var self = this;
        stage.addEventListener(NodeEventType.OnStageBoundsChanged, function () {
          self._onStageBoundsChanged(canvas);
        });
        this._onStageBoundsChanged(canvas);
      }

      Canvas2DRenderer._prepareSurfaceAllocators();
    }

    private _addLayer(name: string): HTMLDivElement {
      var div = document.createElement("div");
      div.style.position = "absolute";
      div.style.overflow = "hidden";
      div.style.width = "100%";
      div.style.height = "100%";
      div.style.zIndex = this._layers.length + '';
      this._container.appendChild(div);
      this._layers.push(div);
      return div;
    }

    private get _backgroundVideoLayer(): HTMLDivElement {
      return this._layers[0];
    }

    private _createTarget(canvas: HTMLCanvasElement) {
      return new Canvas2DSurfaceRegion (
        new Canvas2DSurface(canvas),
        new RegionAllocator.Region(0, 0, canvas.width, canvas.height),
        canvas.width, canvas.height
      );
    }

    /**
     * If the stage bounds have changed, we have to resize all of our layers, canvases and more ...
     */
    private _onStageBoundsChanged(canvas: HTMLCanvasElement) {
      var stageBounds = this._stage.getBounds(true);
      stageBounds.snap();

      var ratio = this._devicePixelRatio = window.devicePixelRatio || 1;
      var w = (stageBounds.w / ratio) + 'px';
      var h = (stageBounds.h / ratio) + 'px';
      for (var i = 0; i < this._layers.length; i++) {
        var layer = this._layers[i];
        layer.style.width = w;
        layer.style.height = h;
      }
      canvas.width = stageBounds.w;
      canvas.height = stageBounds.h;
      canvas.style.position = "absolute";
      canvas.style.width = w;
      canvas.style.height = h;
      this._target = this._createTarget(canvas);
      this._fontSize = 10 * this._devicePixelRatio;
    }

    private static _prepareSurfaceAllocators() {
      if (Canvas2DRenderer._initializedCaches) {
        return;
      }

      var minSurfaceSize = 1024;
      Canvas2DRenderer._surfaceCache = new SurfaceRegionAllocator.SimpleAllocator (
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

      Canvas2DRenderer._shapeCache = new SurfaceRegionAllocator.SimpleAllocator (
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

      Canvas2DRenderer._initializedCaches = true;
    }

    /**
     * Main render function.
     */
    public render() {
      var stage = this._stage;
      var target = this._target;
      var options = this._options;
      var viewport = this._viewport;

      // stage.visit(new TracingNodeVisitor(new IndentingWriter()), null);

      target.reset();
      target.context.save();

      target.context.beginPath();
      target.context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
      target.context.clip();

      this._renderStageToTarget(target, stage, viewport);

      target.reset();

      if (options.paintViewport) {
        target.context.beginPath();
        target.context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
        target.context.strokeStyle = "#FF4981";
        target.context.lineWidth = 2;
        target.context.stroke();
      }

      target.context.restore();
    }

    public renderNode(node: Node, clip: Rectangle, matrix: Matrix) {
      var state = new RenderState(this._target);
      state.clip.set(clip);
      state.flags = RenderFlags.CacheShapes;
      state.matrix.set(matrix);
      node.visit(this, state);
      state.free();
    }

    public renderNodeWithState(node: Node, state: RenderState) {
      node.visit(this, state);
    }

    private _renderWithCache(node: Node, state: RenderState): boolean {
      var matrix = state.matrix;
      var bounds = node.getBounds();
      if (bounds.isEmpty()) {
        return false;
      }

      var cacheShapesMaxSize = this._options.cacheShapesMaxSize;
      var matrixScale = Math.max(matrix.getAbsoluteScaleX(), matrix.getAbsoluteScaleY());

      var renderCount = 100;
      var paintClip = !!(state.flags & RenderFlags.PaintClip);
      var paintStencil = !!(state.flags & RenderFlags.PaintStencil);
      var paintFlashing = !!(state.flags & RenderFlags.PaintFlashing);

      if (!state.hasFlags(RenderFlags.CacheShapes)) {
        return;
      }

      if (paintStencil || paintClip || !state.colorMatrix.isIdentity() ||
          node.hasFlags(NodeFlags.Dynamic)) {
        return false;
      }

      if (renderCount < this._options.cacheShapesThreshold ||
          bounds.w * matrixScale > cacheShapesMaxSize ||
          bounds.h * matrixScale > cacheShapesMaxSize) {
        return false;
      }

      var mipMap: MipMap = node.properties["mipMap"];
      if (!mipMap) {
        mipMap = node.properties["mipMap"] = new MipMap(this, node, Canvas2DRenderer._shapeCache, cacheShapesMaxSize);
      }
      var mipMapLevel = mipMap.getLevel(matrix);
      var mipMapLevelSurfaceRegion = <Canvas2DSurfaceRegion>(mipMapLevel.surfaceRegion);
      var region = mipMapLevelSurfaceRegion.region;
      if (mipMapLevel) {
        var context = state.target.context;
        context.imageSmoothingEnabled = context.mozImageSmoothingEnabled = true;
        context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        context.drawImage (
          mipMapLevelSurfaceRegion.surface.canvas,
          region.x, region.y,
          region.w, region.h,
          bounds.x, bounds.y,
          bounds.w, bounds.h
        );
        return true;
      }
      return false;
    }

    private _intersectsClipList(node: Node, state: RenderState): boolean {
      var boundsAABB = node.getBounds(true);
      var intersects = false;
      state.matrix.transformRectangleAABB(boundsAABB);
      if (state.clip.intersects(boundsAABB)) {
        intersects = true;
      }
      var list = state.clipList;
      if (intersects && list.length) {
        intersects = false;
        for (var i = 0; i < list.length; i++) {
          if (boundsAABB.intersects(list[i])) {
            intersects = true;
            break;
          }
        }
      }
      boundsAABB.free();
      return intersects;
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

      var ignoreNextLayer = state.flags & RenderFlags.IgnoreNextLayer;
      if (!ignoreNextLayer && (
          ((node.getLayer().blendMode !== BlendMode.Normal || node.getLayer().mask) &&
          this._options.blending) ||
          (node.getLayer().filters && this._options.filters))) {
        state = state.clone();
        state.flags |= RenderFlags.IgnoreNextLayer;
        this._renderLayer(node, state);
        state.free();
      } else {
        if (ignoreNextLayer) {
          state.removeFlags(RenderFlags.IgnoreNextLayer);
        }
        if (this._intersectsClipList(node, state)) {
          var clips = null;
          var children = node.getChildren();
          for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var transform = child.getTransform();
            var childState = state.transform(transform);
            childState.toggleFlags(RenderFlags.ImageSmoothing, child.hasFlags(NodeFlags.ImageSmoothing));
            if (child.clip > 0) {
              clips = clips || new Uint8Array(children.length); // MEMORY: Don't allocate here.
              clips[child.clip + i] ++;
              var clipState = childState.clone();
              /*
               * We can't cull the clip because clips outside of the viewport still need to act
               * as clipping masks. For now we just expand the cull bounds, but a better approach
               * would be to cull the clipped nodes and skip creating the clipping region
               * alltogether. For this we would need to keep track of the bounds of the current
               * clipping region.
               */
              // clipState.clip.set(MAX_VIEWPORT);
              clipState.flags |= RenderFlags.PaintClip;
              clipState.beginClipPath(transform.getMatrix());
              child.visit(this, clipState);
              clipState.applyClipPath();
              clipState.free();
            } else {
              child.visit(this, childState);
            }
            if (clips && clips[i] > 0) {
              while (clips[i]--) {
                state.closeClipPath();
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

    private static _debugPoints = Point.createEmptyPoints(4);

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

      context.strokeStyle = style;

      state.matrix.transformRectangleAABB(bounds);

      context.setTransform(1, 0, 0, 1, 0, 0);
      var drawDetails = false;
      if (drawDetails && bounds.w > 32 && bounds.h > 32) {
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = this._fontSize + "px Arial";
        var debugText = "" + node.id;
        context.fillText(debugText, bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
      }
      bounds.free();

      var matrix = state.matrix;
      bounds = node.getBounds();
      var p = Canvas2DRenderer._debugPoints;
      state.matrix.transformRectangle(bounds, p);

      // Doing it this way is a lot faster than strokeRect.
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(p[0].x, p[0].y);
      context.lineTo(p[1].x, p[1].y);
      context.lineTo(p[2].x, p[2].y);
      context.lineTo(p[3].x, p[3].y);
      context.lineTo(p[0].x, p[0].y);
      context.stroke();
    }

    visitStage(node: Stage, state: RenderState) {
      var context = state.target.context;
      var bounds = node.getBounds(true);
      state.matrix.transformRectangleAABB(bounds);
      bounds.intersect(state.clip);
      state.target.reset();

      state = state.clone();
      if (false && node.dirtyRegion) {
        state.clipList.length = 0;
        node.dirtyRegion.gatherOptimizedRegions(state.clipList);
        context.save();
        if (state.clipList.length) {
          context.beginPath();
          for (var i = 0; i < state.clipList.length; i++) {
            var clip = state.clipList[i];
            context.rect(clip.x, clip.y, clip.w, clip.h);
          }
          context.clip();
        } else {
          context.restore();
          state.free();
          return;
        }
      }

      if (this._options.clear) {
        state.target.clear(state.clip);
      }

      // Fill background
      if (!node.hasFlags(NodeFlags.Transparent) && node.color) {
        if (!(state.flags & RenderFlags.IgnoreRenderable)) {
          this._container.style.backgroundColor = node.color.toCSSStyle();
        }
      }

      this.visitGroup(node, state);

      if (node.dirtyRegion) {
        context.restore();
        state.target.reset();
        context.globalAlpha = 0.4;
        if (state.hasFlags(RenderFlags.PaintDirtyRegion)) {
          node.dirtyRegion.render(state.target.context);
        }
        node.dirtyRegion.clear();
      }

      state.free();
    }

    visitShape(node: Shape, state: RenderState) {
      if (!this._intersectsClipList(node, state)) {
        return;
      }
      var matrix = state.matrix;
      if (state.flags & RenderFlags.PixelSnapping) {
        matrix = matrix.clone();
        matrix.snap();
      }
      var context = state.target.context;
      Filters._applyColorMatrix(context, state.colorMatrix);
      // Only paint if it is visible.
      if (node.source instanceof RenderableVideo) {
        this.visitRenderableVideo(<RenderableVideo>node.source, state);
      } else if (context.globalAlpha > 0) {
        this.visitRenderable(node.source, state, node.ratio);
      }
      if (state.flags & RenderFlags.PixelSnapping) {
        matrix.free();
      }
      Filters._removeFilter(context);
    }

    /**
     * We don't actually draw the video like normal renderables, although we could.
     * Instead, we add the video element underneeth the canvas at layer zero and set
     * the appropriate css transform to move it into place.
     */
    visitRenderableVideo(node: RenderableVideo, state: RenderState) {
      if (!node.video || !node.video.videoWidth) {
        return; // video is not ready
      }

      var ratio = this._devicePixelRatio;
      var matrix = state.matrix.clone();
      matrix.scale(1 / ratio, 1 / ratio);

      var bounds = node.getBounds();
      var videoMatrix = Shumway.GFX.Geometry.Matrix.createIdentity();
      videoMatrix.scale(bounds.w / node.video.videoWidth, bounds.h / node.video.videoHeight);
      matrix.preMultiply(videoMatrix);
      videoMatrix.free();

      var cssTransform = matrix.toCSSTransform();
      node.video.style.transformOrigin = "0 0";
      node.video.style.transform = cssTransform;
      var videoLayer = this._backgroundVideoLayer;
      if (videoLayer !== node.video.parentElement) {
        videoLayer.appendChild(node.video);
        node.addEventListener(NodeEventType.RemovedFromStage, function removeVideo(node: RenderableVideo) {
          release || assert(videoLayer === node.video.parentElement);
          videoLayer.removeChild(node.video);
          node.removeEventListener(NodeEventType.RemovedFromStage, removeVideo);
        });
      }
      matrix.free();
    }

    visitRenderable(node: Renderable, state: RenderState, ratio?: number) {
      var bounds = node.getBounds();

      if (state.flags & RenderFlags.IgnoreRenderable) {
        return;
      }
      if (bounds.isEmpty()) {
        return;
      }

      if (state.hasFlags(RenderFlags.IgnoreNextRenderWithCache)) {
        state.removeFlags(RenderFlags.IgnoreNextRenderWithCache);
      } else {
        if (this._renderWithCache(node, state)) {
          return;
        }
      }

      var matrix = state.matrix;
      var context = state.target.context;
      var paintClip = !!(state.flags & RenderFlags.PaintClip);
      var paintStencil = !!(state.flags & RenderFlags.PaintStencil);
      var paintFlashing = !release && !!(state.flags & RenderFlags.PaintFlashing);

      context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);

      var paintStart = 0;
      if (paintFlashing) {
        paintStart = performance.now();
      }

      this._frameInfo.shapes ++;

      context.imageSmoothingEnabled = context.mozImageSmoothingEnabled = state.hasFlags(RenderFlags.ImageSmoothing);

      var renderCount = node.properties["renderCount"] || 0;
      var cacheShapesMaxSize = this._options.cacheShapesMaxSize;

      node.properties["renderCount"] = ++ renderCount;
      node.render(context, ratio, null, paintClip ? state.clipPath : null, paintStencil);
      if (paintFlashing) {
        var elapsed = performance.now() - paintStart;
        context.fillStyle = ColorStyle.gradientColor(0.1 / elapsed);
        context.globalAlpha = 0.3 + 0.1 * Math.random();
        context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
      }
    }

    _renderLayer(node: Node, state: RenderState) {
      var layer = node.getLayer();
      var mask = layer.mask;
      if (!mask) {
        var clip = Rectangle.allocate();
        var target = this._renderToTemporarySurface(node, node.getLayerBounds(!!this._options.filters),
                                                    state, clip, state.target.surface);
        if (target) {
          state.target.draw(target, clip.x, clip.y, clip.w, clip.h, state.colorMatrix,
                            this._options.blending ? layer.blendMode : BlendMode.Normal,
                            this._options.filters ? layer.filters : null, this._devicePixelRatio);
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
      // If the mask doesn't have a parent then it's matrix doesn't include the pixel density
      // scaling and we have to factor it in separately.
      if (!mask.parent) {
        maskMatrix = maskMatrix.scale(this._devicePixelRatio, this._devicePixelRatio);
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
      var a = this._renderToTemporarySurface(node, node.getBounds(), aState, Rectangle.createEmpty(), null);
      aState.free();

      var bState = state.clone();
      bState.clip.set(clip);
      bState.matrix = maskMatrix;
      bState.flags |= RenderFlags.IgnoreMask;
      if (stencil) {
        bState.flags |= RenderFlags.PaintStencil;
      }
      var b = this._renderToTemporarySurface(mask, mask.getBounds(), bState, Rectangle.createEmpty(), a.surface);
      bState.free();

      a.draw(b, 0, 0, clip.w, clip.h, bState.colorMatrix, BlendMode.Alpha, null,
             this._devicePixelRatio);

      var matrix = state.matrix;
      state.target.draw(a, clip.x, clip.y, clip.w, clip.h, aState.colorMatrix, blendMode, null,
                        this._devicePixelRatio);

      b.free();
      a.free();
    }

    private _renderStageToTarget (
      target: Canvas2DSurfaceRegion,
      node: Node,
      clip: Rectangle
    ) {

      Rectangle.allocationCount = Matrix.allocationCount = RenderState.allocationCount = 0;

      var state = new RenderState(target);
      state.clip.set(clip);

      if (!this._options.paintRenderable) {
        state.flags |= RenderFlags.IgnoreRenderable;
      }
      if (this._options.paintBounds) {
        state.flags |= RenderFlags.PaintBounds;
      }
      if (this._options.paintDirtyRegion) {
        state.flags |= RenderFlags.PaintDirtyRegion;
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

    private _renderToTemporarySurface(node: Node, bounds: Rectangle, state: RenderState, clip: Rectangle,
                                      excludeSurface: ISurface): Canvas2DSurfaceRegion {
      var matrix = state.matrix;
      var boundsAABB = bounds.clone();
      matrix.transformRectangleAABB(boundsAABB);
      boundsAABB.snap();

      clip.set(boundsAABB);
      clip.intersect(state.clip);
      clip.snap();

      if (clip.isEmpty()) {
        return null;
      }

      var target = this._allocateSurface(clip.w, clip.h, excludeSurface);
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

      // We can't do this because we could be clipping some other temporary region in the same
      // context.
      // TODO: but we have to, otherwise we overwrite textures that we might need. This happens in
      // _renderWithMask, which is why we currently force the allocation of a whole second surface
      // to avoid it. So, we need to find a solution here.
      //target.context.beginPath();
      //target.context.rect(surfaceRegionBounds.x, surfaceRegionBounds.y, surfaceRegionBounds.w,
      //                    surfaceRegionBounds.h);
      //target.context.clip();

      state = state.clone();
      state.target = target;
      state.matrix = matrix;
      state.clip.set(surfaceRegionBounds);
      node.visit(this, state);
      state.free();
      target.context.restore();
      return target;
    }

    private _allocateSurface(w: number, h: number, excludeSurface: ISurface): Canvas2DSurfaceRegion {
      var surface = <Canvas2DSurfaceRegion>(Canvas2DRenderer._surfaceCache.allocate(w, h,
                                            excludeSurface));
      if (!release) {
        surface.fill("#FF4981");
      }
      // var color = "rgba(" + (Math.random() * 255 | 0) + ", " + (Math.random() * 255 | 0) + ", " + (Math.random() * 255 | 0) + ", 1)"
      // surface.fill(color);
      return surface;
    }

    public screenShot(bounds: Rectangle, stageContent: boolean, disableHidpi: boolean): ScreenShot {
      if (stageContent) {
        // HACK: Weird way to get to the real content, but oh well...
        var contentStage = <Stage>this._stage.content.groupChild.child;
        assert (contentStage instanceof Stage);
        bounds = contentStage.content.getBounds(true);
        // Figure out the device bounds.
        contentStage.content.getTransform().getConcatenatedMatrix().transformRectangleAABB(bounds);
        // If it's zoomed in, clip by the viewport.
        bounds.intersect(this._viewport);
      }
      if (!bounds) {
        bounds = new Rectangle(0, 0, this._target.w, this._target.h);
      }
      var outputWidth = bounds.w;
      var outputHeight = bounds.h;
      var pixelRatio = this._devicePixelRatio;
      if (disableHidpi) {
        outputWidth /= pixelRatio;
        outputHeight /= pixelRatio;
        pixelRatio = 1;
      }
      var canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      var context = canvas.getContext("2d");
      context.fillStyle = this._container.style.backgroundColor;
      context.fillRect(0, 0, outputWidth, outputHeight);
      context.drawImage(this._target.context.canvas, bounds.x, bounds.y, bounds.w, bounds.h, 0, 0, outputWidth, outputHeight);
      return new ScreenShot(canvas.toDataURL('image/png'), outputWidth, outputHeight, pixelRatio);
    }
  }
}
