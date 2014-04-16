/// <reference path='references.ts'/>
module Shumway.GFX.Layers {
  import Rectangle = Shumway.Geometry.Rectangle;
  import Point = Shumway.Geometry.Point;
  import Matrix = Shumway.Geometry.Matrix;
  import DirtyRegion = Shumway.Geometry.DirtyRegion;
  import Filter = Shumway.GFX.Layers.Filter;
  import TileCache = Shumway.Geometry.TileCache;
  import Tile = Shumway.Geometry.Tile;
  import OBB = Shumway.Geometry.OBB;

  export enum Direction {
    None       = 0,
    Upward     = 1,
    Downward   = 2
  }

  export enum FrameFlags {
    Empty      = 0,
    Dirty      = 1,
    Hidden     = 2,
    IsMask     = 4,
    Culled     = 8,
    IgnoreMask = 16
  }

  /**
   * Frame capabilities, the fewer capabilities the better.
   */
  export enum FrameCapabilityFlags {
    None                        = 0,

    AllowMatrixWrite            = 1,
    AllowColorMatrixWrite       = 2,
    AllowBlendModeWrite         = 4,
    AllowFiltersWrite           = 8,
    AllowMaskWrite              = 16,
    AllowAllWrite               = AllowMatrixWrite |
                                  AllowColorMatrixWrite |
                                  AllowBlendModeWrite |
                                  AllowFiltersWrite |
                                  AllowMaskWrite
  }

  export enum BlendMode {
    Default    = 0,
    Normal     = 1,
    Layer      = 2,
    Multiply   = 3,
    Screen     = 4,
    Lighten    = 5,
    Darken     = 6,
    Difference = 7,
    Add        = 8,
    Subtract   = 9,
    Invert     = 10,
    Alpha      = 11,
    Erase      = 12,
    Overlay    = 13,
    HardLight  = 14
  }

  /**
   * Controls how the visitor walks the display tree.
   */
  export enum VisitorFlags {
    /**
     * Continue with normal traversal.
     */
    Continue     = 0,

    /**
     * Not used yet, should probably just stop the visitor.
     */
    Stop         = 1,

    /**
     * Skip processing current frame.
     */
    Skip         = 2,

    /**
     * Only visit visible frames.
     */
    VisibleOnly  = 4,

    /**
     * Visit front to back.
     */
    FrontToBack  = 8
  }

  function getRandomIntInclusive(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  export class Frame {
    private static _path: Frame[] = [];

    private _alpha: number = 1;
    private _blendMode: BlendMode = BlendMode.Default;
    private _matrix: Matrix;
    private _filters: Filter[] = [];
    private _colorMatrix: ColorMatrix;
    private _isTransformInvalid: boolean = true;
    private _properties: {[name: string]: any};
    private _mask: Frame;
    private _flags: FrameFlags = FrameFlags.Empty;
    private _capability: FrameCapabilityFlags = FrameCapabilityFlags.AllowAllWrite;

    /**
     * Stage location where the frame was previously drawn. This is used to compute dirty regions and
     * is updated every time the frame is rendered.
     */
    _previouslyRenderedAABB: Rectangle;

    _setFlags(flags: FrameFlags) {
      this._flags |= flags;
    }

    _removeFlags(flags: FrameFlags) {
      this._flags &= ~flags;
    }

    _hasFlags(flags: FrameFlags): boolean {
      return (this._flags & flags) === flags;
    }

    _hasAnyFlags(flags: FrameFlags): boolean {
      return !!(this._flags & flags);
    }

    /**
     * Propagates capabilities up and down the frame tree.
     *
     * TODO: Make this non-recursive.
     */
    public setCapability(capability: FrameCapabilityFlags, on: boolean = true, direction: Direction = Direction.None) {
      if (on) {
        this._capability |= capability;
      } else {
        this._capability &= ~capability;
      }
      if (direction === Direction.Upward && this.parent) {
        this.parent.setCapability(capability, on, direction);
      } else if (direction === Direction.Downward && this instanceof FrameContainer) {
        var frameContainer = <FrameContainer>this;
        var children = frameContainer.children;
        for (var i = 0; i < children.length; i++) {
          children[i].setCapability(capability, on, direction);
        }
      }
    }

    public removeCapability(capability: FrameCapabilityFlags) {
      this.setCapability(capability, false);
    }

    public hasCapability(capability: FrameCapabilityFlags) {
      return this._capability & capability;
    }

    public checkCapability(capability: FrameCapabilityFlags) {
      if (!(this._capability & capability)) {
        unexpected("Frame doesn't have capability: " + FrameCapabilityFlags[capability]);
      }
    }

    get properties(): {[name: string]: any} {
      return this._properties || (this._properties = Object.create(null));
    }

    get x(): number {
      return this._matrix.tx;
    }

    set x(value: number) {
      this.checkCapability(FrameCapabilityFlags.AllowMatrixWrite);
      this._matrix.tx = value;
    }

    get y(): number {
      return this._matrix.ty;
    }

    set y(value: number) {
      this.checkCapability(FrameCapabilityFlags.AllowMatrixWrite);
      this._matrix.ty = value;
    }

    get matrix(): Matrix {
      return this._matrix;
    }

    set matrix(value: Matrix) {
      this.checkCapability(FrameCapabilityFlags.AllowMatrixWrite);
      this._matrix = value;
    }

    get alpha(): number {
      return this._alpha;
    }

    set blendMode(value: number) {
      this.checkCapability(FrameCapabilityFlags.AllowBlendModeWrite);
      this._blendMode = value;
      this.invalidate();
    }

    get blendMode() {
      return this._blendMode;
    }

    set filters(value: Filter[]) {
      this.checkCapability(FrameCapabilityFlags.AllowFiltersWrite);
      this._filters = value;
      this.invalidate();
    }

    get filters(): Filter[] {
      return this._filters;
    }

    set colorMatrix(value: ColorMatrix) {
      this.checkCapability(FrameCapabilityFlags.AllowColorMatrixWrite);
      this._colorMatrix = value;
      this.invalidate();
    }

    get colorMatrix(): ColorMatrix {
      return this._colorMatrix;
    }

    set mask(value: Frame) {
      this.checkCapability(FrameCapabilityFlags.AllowMaskWrite);
      if (this._mask && this._mask !== value) {
        this._mask._removeFlags(FrameFlags.IsMask);
      }
      this._mask = value;
      if (this._mask) {
        assert (!this._mask._hasFlags(FrameFlags.IsMask));
        this._mask._setFlags(FrameFlags.IsMask);
        this._mask.invalidate();
      }
      this.invalidate();
    }

    get mask() {
      return this._mask;
    }

    public getBounds(): Rectangle {
      assert(false, "Override this.");
      return null;
    }

    gatherPreviousDirtyRegions() {
      var stage = this.stage;
      if (!stage.trackDirtyRegions) {
        return;
      }
      this.visit(function (frame: Frame): VisitorFlags {
        if (frame instanceof FrameContainer) {
          return VisitorFlags.Continue;
        }
        if (frame._previouslyRenderedAABB) {
          stage.dirtyRegion.addDirtyRectangle(frame._previouslyRenderedAABB);
        }
        return VisitorFlags.Continue;
      });
    }

    getPathInto(stack: Frame[]) {
      stack.length = 0;
      stack.push(this);
      var frame = this;
      while (frame.parent) {
        frame = frame.parent;
        stack.push(frame);
      }
    }

    getConcatenatedColorMatrix(): ColorMatrix {
      var path = Frame._path;
      this.getPathInto(path);
      var colorMatrix = null;
      for (var i = path.length - 1; i >= 0; i--) {
        if (path[i]._colorMatrix) {
          if (!colorMatrix) {
            colorMatrix = ColorMatrix.createIdentity();
          }
          colorMatrix.multiply(path[i]._colorMatrix);
        }
      }
      return colorMatrix;
    }

    getConcatenatedAlpha(): number {
      var frame = this;
      var alpha = 1;
      while (frame) {
        alpha *= frame._alpha;
        frame = frame.parent;
      }
      return alpha;
    }

    set alpha(value: number) {
      this._alpha = value;
      this.invalidate();
    }

    public parent: Frame;
    public ignoreMaskAlpha: boolean;

    constructor () {
      this.parent = null;
      this.matrix = Matrix.createIdentity();
    }

    get stage(): Stage {
      var frame = this;
      while (frame.parent) {
        frame = frame.parent;
      }
      if (frame instanceof Stage) {
        return <Stage>frame;
      }
      return null;
    }

    public getConcatenatedMatrix(): Matrix {
      var frame = this;
      var t = Matrix.createIdentity();
      while (frame) {
        t.concat(frame.matrix);
        frame = frame.parent;
      }
      return t;
    }

    invalidate() {
      this._setFlags(FrameFlags.Dirty);
    }

    public visit(visitor: (Frame, Matrix?, FrameFlags?) => VisitorFlags,
                 transform?: Matrix,
                 flags: FrameFlags = FrameFlags.Empty,
                 visitorFlags: VisitorFlags = VisitorFlags.VisibleOnly) {
      var stack: Frame [];
      var frame: Frame;
      var frameContainer: FrameContainer;
      var frontToBack = visitorFlags & VisitorFlags.FrontToBack;
      var visibleOnly = visitorFlags & VisitorFlags.VisibleOnly;
      if (visibleOnly && this._hasFlags(FrameFlags.Hidden)) {
        return;
      }
      stack = [this];
      var transformStack: Matrix [];
      var calculateTransform = !!transform;
      if (calculateTransform) {
        transformStack = [transform];
      }
      var flagsStack: FrameFlags [] = [flags];
      while (stack.length > 0) {
        frame = stack.pop();
        if (calculateTransform) {
          transform = transformStack.pop();
        }
        flags = flagsStack.pop() | frame._flags;
        var result: VisitorFlags = visitor(frame, transform, flags);
        if (result === VisitorFlags.Continue) {
          if (frame instanceof FrameContainer) {
            frameContainer = <FrameContainer>frame;
            var length = frameContainer.children.length;
            for (var i = 0; i < length; i++) {
              var child = frameContainer.children[frontToBack ? i : length - 1 - i];
              if (!child || (visibleOnly && child._hasFlags(FrameFlags.Hidden))) {
                continue;
              }
              stack.push(child);
              if (calculateTransform) {
                var t = transform.clone();
                Matrix.multiply(t, child.matrix);
                transformStack.push(t);
              }
              flagsStack.push(flags);
            }
          }
        } else if (result === VisitorFlags.Stop) {
          return;
        }
      }
    }

    public getDepth(): number {
      var depth = 0;
      var frame = this;
      while (frame.parent) {
        depth ++;
        frame = frame.parent;
      }
      return depth;
    }

    /**
     * Returns a list of frames whose bounds intersect the query point. The frames
     * are returned front to back. By default, only the first frame that intersects
     * the query point is returned, unless the |multiple| argument is specified.
     */
    public queryFramesByPoint(query: Point, multiple?: boolean): Frame [] {
      var inverseTransform: Matrix = Matrix.createIdentity();
      var local = Point.createEmpty();
      var frames = [];
      this.visit(function (frame: Frame, transform?: Matrix): VisitorFlags {
        transform.inverse(inverseTransform);
        local.set(query);
        inverseTransform.transformPoint(local);
        if (frame.getBounds().containsPoint(local)) {
          if (frame instanceof FrameContainer) {
            return VisitorFlags.Continue;
          } else {
            frames.push(frame);
            if (!multiple) {
              return VisitorFlags.Stop;
            }
          }
          return VisitorFlags.Continue;
        } else {
          return VisitorFlags.Skip;
        }
      }, Matrix.createIdentity(), FrameFlags.Empty, VisitorFlags.FrontToBack);
      return frames;
    }
  }

  export class FrameContainer extends Frame {
    public children: Frame [];
    constructor() {
      super();
      this.children = [];
    }

    public addChild(child: Frame): Frame {
      if (child) {
        child.parent = this;
        child.invalidate();
      }
      this.children.push(child);
      return child;
    }

    public addChildAt(child: Frame, index: number): Frame {
      assert(index >= 0 && index <= this.children.length);
      if (index === this.children.length) {
        this.children.push(child);
      } else {
        this.children.splice(index, 0, child);
      }
      if (child) {
        child.parent = this;
        child.invalidate();
      }
      return child;
    }

    public removeChild(child: Frame) {
      if (child.parent === this) {
        var index = this.children.indexOf(child);
        this.removeChildAt(index)
      }
    }

    public removeChildAt(index: number) {
      assert(index >= 0 && index < this.children.length);
      var result = this.children.splice(index, 1);
      var child = result[0];
      if (!child) {
        return;
      }
      child.gatherPreviousDirtyRegions();
      child.parent = undefined;
      child.invalidate();
    }

    public clearChildren() {
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        if (child) {
          child.gatherPreviousDirtyRegions();
        }
      }
      this.children.length = 0;
    }

    public shuffleChildren() {
      var length = this.children.length;
      for (var i = 0; i < length * 2; i++) {
        var a = getRandomIntInclusive(0, length - 1);
        var b = getRandomIntInclusive(0, length - 1);
        var t = this.children[a];
        this.children[a] = this.children[b];
        this.children[b] = t;
        this.children[a].invalidate();
        this.children[b].invalidate();
      }
    }

    public getBounds(): Rectangle {
      var bounds = Rectangle.createEmpty();
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i];
        if (!child._hasFlags(FrameFlags.Hidden)) {
          var childBounds = child.getBounds().clone();
          child.matrix.transformRectangleAABB(childBounds);
          bounds.union(childBounds);
        }
      }
      return bounds;
    }
  }

  export interface ITextureRegion {
    texture: any;
    region: Rectangle;
  }

  export class Stage extends FrameContainer {
    public trackDirtyRegions: boolean;
    public dirtyRegion: DirtyRegion;
    public w: number;
    public h: number;

    constructor(w: number, h: number, trackDirtyRegions: boolean = false) {
      super();
      this.w = w;
      this.h = h;
      this.dirtyRegion = new DirtyRegion(w, h);
      this.trackDirtyRegions = trackDirtyRegions;
      this._setFlags(FrameFlags.Dirty);
    }

    gatherMarkedDirtyRegions(transform: Matrix) {
      var self = this;
      // Find all invalid frames.
      this.visit(function (frame: Frame, transform?: Matrix, flags?: FrameFlags): VisitorFlags {
        frame._removeFlags(FrameFlags.Dirty);
        if (frame instanceof FrameContainer) {
          return VisitorFlags.Continue;
        }
        if (flags & FrameFlags.Dirty) {
          var rectangle = frame.getBounds().clone();
          transform.transformRectangleAABB(rectangle);
          self.dirtyRegion.addDirtyRectangle(rectangle);
          if (frame._previouslyRenderedAABB) {
            // Add last render position to dirty list.
            self.dirtyRegion.addDirtyRectangle(frame._previouslyRenderedAABB);
          }
        }
        return VisitorFlags.Continue;
      }, transform, FrameFlags.Empty);
    }

    gatherFrames() {
      var frames = [];
      this.visit(function (frame: Frame, transform?: Matrix): VisitorFlags {
        if (!(frame instanceof FrameContainer)) {
          frames.push(frame);
        }
        return VisitorFlags.Continue;
      }, this.matrix);
      return frames;
    }

    gatherLayers() {
      var layers = [];
      var currentLayer;
      this.visit(function (frame: Frame, transform?: Matrix): VisitorFlags {
        if (frame instanceof FrameContainer) {
          return VisitorFlags.Continue;
        }
        var rectangle = frame.getBounds().clone();
        transform.transformRectangleAABB(rectangle);
        if (frame._hasFlags(FrameFlags.Dirty)) {
          if (currentLayer) {
            layers.push(currentLayer);
          }
          layers.push(rectangle.clone());
          currentLayer = null;
        } else {
          if (!currentLayer) {
            currentLayer = rectangle.clone();
          } else {
            currentLayer.union(rectangle);
          }
        }
        return VisitorFlags.Continue;
      }, this.matrix);

      if (currentLayer) {
        layers.push(currentLayer);
      }

      return layers;
    }
  }

  export interface IAnimator {
    onEnterFrame ();
  }

  export class SolidRectangle extends Frame {
    fillStyle: string = randomStyle();
    constructor() {
      super();
    }
  }

  export class Shape extends Frame {
    source: IRenderable;
    constructor(source: IRenderable) {
      super();
      assert(source);
      this.source = source;
    }

    public getBounds(): Rectangle {
      return this.source.getBounds();
    }
  }

  export class Renderable implements IRenderable {
    private _bounds: Rectangle;
    properties: {[name: string]: any} = {};
    render: (context: CanvasRenderingContext2D, clipBounds?: Rectangle) => void;
    isDynamic: boolean = true;
    isInvalid: boolean = true;
    isScalable: boolean = true;
    isTileable: boolean = false;
    constructor(w: number, h: number, render: (context: CanvasRenderingContext2D, clipBounds?: Rectangle) => void) {
      this.render = render;
      this._bounds = new Rectangle(0, 0, w, h);
    }
    getBounds (): Rectangle {
      return this._bounds;
    }
  }

  export class Label implements IRenderable {
    properties: {[name: string]: any} = {};
    private _text: string;
    private _bounds: Rectangle;

    get text (): string {
      return this._text;
    }

    set text (value: string) {
      this._text = value;
    }

    isDynamic: boolean = true;
    isInvalid: boolean = true;
    isScalable: boolean = true;
    isTileable: boolean = false;
    constructor(w: number, h: number) {
      this._bounds = new Rectangle(0, 0, w, h);
    }
    getBounds (): Rectangle {
      return this._bounds;
    }
    render (context: CanvasRenderingContext2D, clipBounds?: Rectangle) {
      context.save();
      context.textBaseline = "top";
      context.fillStyle = "white";
      context.fillText(this.text, 0, 0);
      context.restore();
    }
  }

  export class Grid implements IRenderable {
    properties: {[name: string]: any} = {};
    isDynamic: boolean = false;
    isInvalid: boolean = true;
    isScalable: boolean = true;
    isTileable: boolean = true;

    private _maxBounds = Rectangle.createMaxI16();

    constructor() {

    }

    getBounds (): Rectangle {
      return this._maxBounds;
    }

    render (context: CanvasRenderingContext2D, clipBounds?: Rectangle) {
      context.save();

      var gridBounds = clipBounds || this.getBounds();

      context.fillStyle = ColorStyle.VeryDark;
      context.fillRect(gridBounds.x, gridBounds.y, gridBounds.w, gridBounds.h);

      function gridPath(level) {
        var vStart = Math.floor(gridBounds.x / level) * level;
        var vEnd   = Math.ceil((gridBounds.x + gridBounds.w) / level) * level;

        for (var x = vStart; x < vEnd; x += level) {
          context.moveTo(x + 0.5, gridBounds.y);
          context.lineTo(x + 0.5, gridBounds.y + gridBounds.h);
        }

        var hStart = Math.floor(gridBounds.y / level) * level;
        var hEnd   = Math.ceil((gridBounds.y + gridBounds.h) / level) * level;

        for (var y = hStart; y < hEnd; y += level) {
          context.moveTo(gridBounds.x, y + 0.5);
          context.lineTo(gridBounds.x + gridBounds.w, y + 0.5);
        }
      }

      context.beginPath();
      gridPath(50);
      context.lineWidth = 1;
      context.strokeStyle = ColorStyle.Dark;
      context.stroke();

      context.beginPath();
      gridPath(200);
      context.lineWidth = 1;
      context.strokeStyle = ColorStyle.TabToolbar;
      context.stroke();

      context.beginPath();
      gridPath(1000);
      context.lineWidth = 3;
      context.strokeStyle = ColorStyle.Toolbars;
      context.stroke();

      var MAX = 1024 * 1024;
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(-MAX, 0.5);
      context.lineTo(MAX , 0.5);
      context.moveTo(0.5, -MAX);
      context.lineTo(0.5, MAX);
      context.strokeStyle = ColorStyle.Orange;
      context.stroke();

      context.restore();
    }
  }
}