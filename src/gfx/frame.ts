/// <reference path='references.ts'/>
module Shumway.GFX {
  import Rectangle = Shumway.Geometry.Rectangle;
  import Point = Shumway.Geometry.Point;
  import Matrix = Shumway.Geometry.Matrix;
  import DirtyRegion = Shumway.Geometry.DirtyRegion;
  import Filter = Shumway.GFX.Filter;
  import TileCache = Shumway.Geometry.TileCache;
  import Tile = Shumway.Geometry.Tile;
  import OBB = Shumway.Geometry.OBB;

  export enum Direction {
    None       = 0,
    Upward     = 1,
    Downward   = 2
  }

  export enum FrameFlags {
    Empty           = 0,
    Dirty           = 1,
    IsMask          = 4,
    Culled          = 8,
    IgnoreMask      = 16,
    IgnoreQuery     = 32
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
    AllowChildrenWrite          = 32,
    AllowAllWrite               = AllowMatrixWrite      |
                                  AllowColorMatrixWrite |
                                  AllowBlendModeWrite   |
                                  AllowFiltersWrite     |
                                  AllowMaskWrite        |
                                  AllowChildrenWrite
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
      if (direction === Direction.Upward && this._parent) {
        this._parent.setCapability(capability, on, direction);
      } else if (direction === Direction.Downward && this instanceof FrameContainer) {
        var frameContainer = <FrameContainer>this;
        var children = frameContainer._children;
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

    _propagateFlags(flags: FrameFlags, direction: Direction) {
      if (this._hasFlags(flags)) {
        return;
      }
      this._setFlags(flags);

      if (direction & Direction.Upward) {
        var node = this._parent;
        while (node) {
          node._setFlags(flags);
          node = node._parent;
        }
      }

      if (direction & Direction.Downward) {
        if (this instanceof FrameContainer) {
          var children = (<FrameContainer>this)._children;
          for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (!child._hasFlags(flags)) {
              child._propagateFlags(flags, Direction.Downward);
            }
          }
        }
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

    set blendMode(value: BlendMode) {
      value = value | 0;
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
      while (frame._parent) {
        frame = frame._parent;
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
        frame = frame._parent;
      }
      return alpha;
    }

    set alpha(value: number) {
      this._alpha = value;
      this.invalidate();
    }

    _parent: Frame;

    public ignoreMaskAlpha: boolean;

    constructor () {
      this._parent = null;
      this.matrix = Matrix.createIdentity();
    }

    get stage(): Stage {
      var frame = this;
      while (frame._parent) {
        frame = frame._parent;
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
        frame = frame._parent;
      }
      return t;
    }

    invalidate() {
      this._setFlags(FrameFlags.Dirty);
    }

    public visit(visitor: (Frame, Matrix?, FrameFlags?) => VisitorFlags,
                 transform?: Matrix,
                 flags: FrameFlags = FrameFlags.Empty,
                 visitorFlags: VisitorFlags = VisitorFlags.None) {
      var stack: Frame [];
      var frame: Frame;
      var frameContainer: FrameContainer;
      var frontToBack = visitorFlags & VisitorFlags.FrontToBack;
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
            var length = frameContainer._children.length;
            for (var i = 0; i < length; i++) {
              var child = frameContainer._children[frontToBack ? i : length - 1 - i];
              if (!child) {
                continue;
              }
              stack.push(child);
              if (calculateTransform) {
                var t = transform.clone();
                t.preMultiply(child.matrix);
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
      while (frame._parent) {
        depth ++;
        frame = frame._parent;
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
      this.visit(function (frame: Frame, transform?: Matrix, flags?: FrameFlags): VisitorFlags {
        if (flags & FrameFlags.IgnoreQuery) {
          return VisitorFlags.Skip;
        }
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
}