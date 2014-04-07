/// <reference path='all.ts'/>
module Shumway.Layers {
  import Rectangle = Shumway.Geometry.Rectangle;
  import Point = Shumway.Geometry.Point;
  import Matrix = Shumway.Geometry.Matrix;
  import DirtyRegion = Shumway.Geometry.DirtyRegion;
  import Filter = Shumway.Layers.Filter;
  import TileCache = Shumway.Geometry.TileCache;
  import Tile = Shumway.Geometry.Tile;
  import OBB = Shumway.Geometry.OBB;

  export enum FrameFlags {
    Empty      = 0,
    Dirty      = 1,
    Hidden     = 2,
    IsMask     = 4,
    Culled     = 8
  }

  export enum BlendMode {
    DEFAULT    = 0,
    NORMAL     = 1,
    LAYER      = 2,
    MULTIPLY   = 3,
    SCREEN     = 4,
    LIGHTEN    = 5,
    DARKEN     = 6,
    DIFFERENCE = 7,
    ADD        = 8,
    SUBTRACT   = 9,
    INVERT     = 10,
    ALPHA      = 11,
    ERASE      = 12,
    OVERLAY    = 13,
    HARDLIGHT  = 14
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
    private _x: number;
    private _y: number;
    private _alpha: number = 1;
    private _blendMode: BlendMode = BlendMode.DEFAULT;
    private _scaleX: number;
    private _scaleY: number;
    private _rotation: number;
    private _transform: Matrix;
    private _colorTransform: ColorTransform;
    private _isTransformInvalid: boolean = true;
    private _origin: Point = new Point(0, 0);
    private _properties: {[name: string]: any};
    private static _path: Frame[] = [];
    private _mask: Frame;

    /**
     * Stage location where the frame was previously drawn. This is used to compute dirty regions and
     * is updated every time the frame is rendered.
     */
    _previouslyRenderedAABB: Rectangle;

    _flags: FrameFlags = FrameFlags.Empty;

    setFlags(flags: FrameFlags, on: boolean) {
      if (on) {
        this._flags |= flags;
      } else {
        this._flags &= ~flags;
      }
    }

    hasFlags(flags: FrameFlags): boolean {
      return !!(this._flags & flags);
    }

    get properties(): {[name: string]: any} {
      return this._properties || (this._properties = Object.create(null));
    }

    get x(): number {
      return this._x;
    }

    set x(value: number) {
      this._x = value;
      this.invalidateTransform();
    }

    get y(): number {
      return this._y;
    }

    set y(value: number) {
      this._y = value;
      this.invalidateTransform();
    }

    get scaleX(): number {
      return this._scaleX;
    }

    set scaleX(value: number) {
      this._scaleX = value;
      this.invalidateTransform();
    }

    get scaleY(): number {
      return this._scaleY;
    }

    set scaleY(value: number) {
      this._scaleY = value;
      this.invalidateTransform();
    }

    get rotation(): number {
      return this._rotation;
    }

    set rotation(value: number) {
      this._rotation = value;
      this.invalidateTransform();
    }

    get alpha(): number {
      return this._alpha;
    }

    set blendMode(value: number) {
      this._blendMode = value;
      this.invalidate();
    }

    get blendMode() {
      return this._blendMode;
    }

    set colorTransform(value: ColorTransform) {
      this._colorTransform = value;
      this.invalidate();
    }

    get colorTransform(): ColorTransform {
      return this._colorTransform;
    }

    set mask(value: Frame) {
      if (this._mask && this._mask !== value) {
        this._mask.setFlags(FrameFlags.IsMask, false);
      }
      this._mask = value;
      if (this._mask) {
        assert (!this._mask.hasFlags(FrameFlags.IsMask));
        this._mask.setFlags(FrameFlags.IsMask, true);
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

    getConcatenatedColorTransform(): ColorTransform {
      var path = Frame._path;
      this.getPathInto(path);
      var colorTransform = null;
      for (var i = path.length - 1; i >= 0; i--) {
        if (path[i]._colorTransform) {
          if (!colorTransform) {
            colorTransform = ColorTransform.createIdentity();
          }
          colorTransform.multiply(path[i]._colorTransform);
        }
      }
      return colorTransform;
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

    get transform(): Matrix {
      if (this._isTransformInvalid) {
        this._transform.setIdentity();
        this._transform.scale(this._scaleX, this._scaleY);
        this._transform.rotate(this._rotation * Math.PI / 180);
        this._transform.translate(this._x, this._y);

        var t = Matrix.createIdentity();
        t.translate(-this._origin.x, -this._origin.y);
        t.concat(this._transform);
        this._transform = t;
        this._isTransformInvalid = false;
      }
      return this._transform;
    }

    set transform(value: Matrix) {
      var t = Matrix.createIdentity();
      t.translate(this._origin.x, this._origin.y);
      t.concat(value);

      if (this._transform && this.transform.isEqual(t)) {
        return;
      }

      this._transform = t;
      this._x = t.getTranslateX();
      this._y = t.getTranslateY();
      this._scaleX = t.getScaleX();
      this._scaleY = t.getScaleY();
      this._rotation = t.getRotation();
      this._isTransformInvalid = false;
      this.invalidate();
    }

    public w: number;
    public h: number;
    public parent: Frame;
    public ignoreMaskAlpha: boolean;

    public filters: Filter [];

    get origin(): Point {
      return this._origin;
    }

    set origin(value: Point) {
      this._origin.set(value);
      this.invalidateTransform();
    }

    constructor () {
      this.parent = null;
      this.transform = Matrix.createIdentity();
      this.filters = null;
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

    public getConcatenatedTransform(): Matrix {
      var frame = this;
      var t = Matrix.createIdentity();
      while (frame) {
        t.concat(frame.transform);
        frame = frame.parent;
      }
      return t;
    }

    invalidate() {
      this.setFlags(FrameFlags.Dirty, true);
    }

    private invalidateTransform() {
      this._isTransformInvalid = true;
      this.invalidate();
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
      if (visibleOnly && this.hasFlags(FrameFlags.Hidden)) {
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
        if (visitor(frame, transform, flags) === VisitorFlags.Continue) {
          if (frame instanceof FrameContainer) {
            frameContainer = <FrameContainer>frame;
            var length = frameContainer.children.length;
            for (var i = 0; i < length; i++) {
              var child = frameContainer.children[frontToBack ? i : length - 1 - i];
              if (!child || (visibleOnly && child.hasFlags(FrameFlags.Hidden))) {
                continue;
              }
              stack.push(child);
              if (calculateTransform) {
                var t = transform.clone();
                Matrix.multiply(t, child.transform);
                transformStack.push(t);
              }
              flagsStack.push(flags);
            }
          }
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
  }

  export class FrameContainer extends Frame {
    public children: Frame [];
    constructor() {
      super();
      this.children = [];
    }

    public addChild(child: Frame) {
      if (child) {
        child.parent = this;
        child.invalidate();
      }
      this.children.push(child);
    }

    public addChildAt(child: Frame, index: number) {
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
        if (!child.hasFlags(FrameFlags.Hidden)) {
          var childBounds = child.getBounds();
          child.transform.transformRectangleAABB(childBounds);
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
    constructor(w: number, h: number, trackDirtyRegions: boolean = false) {
      super();
      this.w = w;
      this.h = h;
      this.dirtyRegion = new DirtyRegion(w, h);
      this.trackDirtyRegions = trackDirtyRegions;
      this.setFlags(FrameFlags.Dirty, true);
    }

    gatherMarkedDirtyRegions(transform: Matrix) {
      var self = this;
      // Find all invalid frames.
      this.visit(function (frame: Frame, transform?: Matrix, flags?: FrameFlags): VisitorFlags {
        frame.setFlags(FrameFlags.Dirty, false);
        if (frame instanceof FrameContainer) {
          return VisitorFlags.Continue;
        }
        if (flags & FrameFlags.Dirty) {
          var rectangle = new Rectangle(0, 0, frame.w, frame.h);
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
      }, this.transform);
      return frames;
    }

    gatherLayers() {
      var layers = [];
      var currentLayer;
      this.visit(function (frame: Frame, transform?: Matrix): VisitorFlags {
        if (frame instanceof FrameContainer) {
          return VisitorFlags.Continue;
        }
        var rectangle = new Rectangle(0, 0, frame.w, frame.h);
        transform.transformRectangleAABB(rectangle);
        if (frame.hasFlags(FrameFlags.Dirty)) {
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
      }, this.transform);

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
      var bounds = source.getBounds();
      this.w = bounds.w;
      this.h = bounds.h;
    }

    public getBounds(): Rectangle {
      return new Rectangle(0, 0, this.w, this.h);
    }
  }
}