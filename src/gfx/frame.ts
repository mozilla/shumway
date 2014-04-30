/// <reference path='references.ts'/>
module Shumway.GFX {
  import Rectangle = Geometry.Rectangle;
  import Point = Geometry.Point;
  import Matrix = Geometry.Matrix;
  import DirtyRegion = Geometry.DirtyRegion;
  import Filter = Shumway.GFX.Filter;
  import TileCache = Geometry.TileCache;
  import Tile = Geometry.Tile;
  import OBB = Geometry.OBB;

  export enum Direction {
    None       = 0,
    Upward     = 1,
    Downward   = 2
  }

  export enum FrameFlags {
    Empty                                     = 0x0000,
    Dirty                                     = 0x0001,
    IsMask                                    = 0x0002,
    Culled                                    = 0x0004,
    IgnoreMask                                = 0x0008,
    IgnoreQuery                               = 0x0010,

    /**
     * Frame has invalid bounds.
     */
    InvalidBounds                             = 0x0020,

    /**
     * Frame has an invalid concatenated matrix because its matrix or one of its ancestor's matrices has been mutated.
     */
    InvalidConcatenatedMatrix                 = 0x0040,

    /**
     * Frame has an invalid inverted concatenated matrix because its matrix or one of its ancestor's matrices has been
     * mutated. We don't always need to compute the inverted matrix. This is why we use a sepearete invalid flag for it and don't
     * roll it under the |InvalidConcatenatedMatrix| flag.
     */
    InvalidInvertedConcatenatedMatrix         = 0x0080,

    /**
     * Frame has an invalid concatenated color transform because its color transform or one of its ancestor's color
     * transforms has been mutated.
     */
    InvalidConcatenatedColorMatrix            = 0x0100,

    /**
     * Frame has changed since the last time it was drawn.
     */
    InvalidPaint                              = 0x0200
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
    /**
     * Used as a temporary array to avoid allocations.
     */
    private static _path: Frame[] = [];

    /**
     * Return's a list of ancestors excluding the |last|, the return list is reused.
     */
    private static _getAncestors(node: Frame, last: Frame = null): Frame [] {
      var path = Frame._path;
      path.length = 0;
      while (node && node !== last) {
        path.push(node);
        node = node._parent;
      }
      assert (node === last, "Last ancestor is not an ancestor.");
      return path;
    }

    private _alpha: number;
    private _blendMode: BlendMode;
    private _matrix: Matrix;
    private _concatenatedMatrix: Matrix;
    private _invertedConcatenatedMatrix: Matrix;
    private _filters: Filter[];
    private _colorMatrix: ColorMatrix;
    private _concatenatedColorMatrix: ColorMatrix;
    private _properties: {[name: string]: any};
    private _mask: Frame;
    private _flags: FrameFlags;
    private _capability: FrameCapabilityFlags;

    /**
     * Stage location where the frame was previously drawn. This is used to compute dirty regions and
     * is updated every time the frame is rendered.
     */
    _previouslyRenderedAABB: Rectangle;

    _parent: Frame;

    public ignoreMaskAlpha: boolean;

    constructor () {
      this._flags = FrameFlags.InvalidPaint                       |
                    FrameFlags.InvalidBounds                      |
                    FrameFlags.InvalidConcatenatedMatrix          |
                    FrameFlags.InvalidInvertedConcatenatedMatrix  |
                    FrameFlags.InvalidConcatenatedMatrix          |
                    FrameFlags.InvalidConcatenatedColorMatrix;

      this._capability = FrameCapabilityFlags.AllowAllWrite;
      this._parent = null;
      this._alpha = 1;
      this._blendMode = BlendMode.Default;
      this._filters = [];
      this._mask = null;
      this._matrix = Matrix.createIdentity();
      this._concatenatedMatrix = Matrix.createIdentity();
      this._invertedConcatenatedMatrix = null;
      this._colorMatrix = ColorMatrix.createIdentity();
      this._concatenatedColorMatrix = ColorMatrix.createIdentity();
    }

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
     * Finds the closest ancestor with a given set of flags that are either turned on or off.
     */
    private _findClosestAncestor(flags: FrameFlags, on: boolean): Frame {
      var node = this;
      while (node) {
        if (node._hasFlags(flags) === on) {
          return node;
        }
        node = node._parent;
      }
      return null;
    }

    /**
     * Tests if this frame is an ancestor of the specified frame.
     */
    _isAncestor(child: Frame): boolean {
      var node = child;
      while (node) {
        if (node === this) {
          return true;
        }
        node = node._parent;
      }
      return false;
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

    /**
     * Propagates flags up and down the frame tree. Flags propagation stops if the flags are already set.
     */
    _propagateFlags(flags: FrameFlags, direction: Direction) {
      // Multiple flags can be passed here, stop propagation when all the flags are set.
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

    /**
     * Marks this object as having been moved in its parent frame.
     */
    private _invalidatePosition() {
      this._propagateFlags(FrameFlags.InvalidConcatenatedMatrix | FrameFlags.InvalidInvertedConcatenatedMatrix, Direction.Downward);
      if (this._parent) {
        this._parent._invalidateBounds();
      }
      this._invalidateParentPaint();
    }

    /**
     * Marks this object as needing to be repainted.
     */
    private _invalidatePaint() {
      this._propagateFlags(FrameFlags.InvalidPaint, Direction.Upward);
    }

    private _invalidateParentPaint() {
      if (this._parent) {
        this._parent._propagateFlags(FrameFlags.InvalidPaint, Direction.Upward);
      }
    }

    private _invalidateBounds(): void {
      /* TODO: We should only propagate this bit if the bounds are actually changed. We can do the
       * bounds computation eagerly if the number of children is low. If there are no changes in the
       * bounds we don't need to propagate the bit. */
      this._propagateFlags(FrameFlags.InvalidBounds, Direction.Upward);
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
      this._invalidatePosition();
    }

    get y(): number {
      return this._matrix.ty;
    }

    set y(value: number) {
      this.checkCapability(FrameCapabilityFlags.AllowMatrixWrite);
      this._matrix.ty = value;
      this._invalidatePosition();
    }

    get matrix(): Matrix {
      return this._matrix;
    }

    set matrix(value: Matrix) {
      this.checkCapability(FrameCapabilityFlags.AllowMatrixWrite);
      this._matrix.set(value);
      this._invalidatePosition();
    }

    get alpha(): number {
      return this._alpha;
    }

    set blendMode(value: BlendMode) {
      value = value | 0;
      this.checkCapability(FrameCapabilityFlags.AllowBlendModeWrite);
      this._blendMode = value;
      this._invalidateParentPaint();
    }

    get blendMode(): BlendMode {
      return this._blendMode;
    }

    set filters(value: Filter[]) {
      this.checkCapability(FrameCapabilityFlags.AllowFiltersWrite);
      this._filters = value;
      this._invalidateParentPaint();
    }

    get filters(): Filter[] {
      return this._filters;
    }

    set colorMatrix(value: ColorMatrix) {
      this.checkCapability(FrameCapabilityFlags.AllowColorMatrixWrite);
      this._colorMatrix = value;
      this._propagateFlags(FrameFlags.InvalidConcatenatedColorMatrix, Direction.Downward);
      this._invalidateParentPaint();
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

    getConcatenatedColorMatrix(): ColorMatrix {
      if (!this._parent) {
        return this._colorMatrix;
      }
      // Compute the concatenated color transforms for this node and all of its ancestors.
      if (this._hasFlags(FrameFlags.InvalidConcatenatedColorMatrix)) {
        var ancestor = this._findClosestAncestor(FrameFlags.InvalidConcatenatedColorMatrix, false);
        var path = Frame._getAncestors(this, ancestor);
        var m = ancestor ? ancestor._concatenatedColorMatrix.clone() : ColorMatrix.createIdentity();
        for (var i = path.length - 1; i >= 0; i--) {
          var ancestor = path[i];
          assert (ancestor._hasFlags(FrameFlags.InvalidConcatenatedColorMatrix));
          // TODO: Premultiply here.
          m.multiply(ancestor._colorMatrix);
          ancestor._concatenatedColorMatrix.set(m);
          ancestor._removeFlags(FrameFlags.InvalidConcatenatedColorMatrix);
        }
      }
      return this._concatenatedColorMatrix;
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
      // Compute the concatenated transforms for this node and all of its ancestors.
      if (this._hasFlags(FrameFlags.InvalidConcatenatedMatrix)) {
        var ancestor = this._findClosestAncestor(FrameFlags.InvalidConcatenatedMatrix, false);
        var path = Frame._getAncestors(this, ancestor);
        var m = ancestor ? ancestor._concatenatedMatrix.clone() : Matrix.createIdentity();
        for (var i = path.length - 1; i >= 0; i--) {
          var ancestor = path[i];
          assert (ancestor._hasFlags(FrameFlags.InvalidConcatenatedMatrix));
          m.preMultiply(ancestor._matrix);
          ancestor._concatenatedMatrix.set(m);
          ancestor._removeFlags(FrameFlags.InvalidConcatenatedMatrix);
        }
      }
      return this._concatenatedMatrix;
    }

    public getInvertedConcatenatedMatrix(): Matrix {
      if (this._hasFlags(FrameFlags.InvalidInvertedConcatenatedMatrix)) {
        if (!this._invertedConcatenatedMatrix) {
          this._invertedConcatenatedMatrix = Matrix.createIdentity();
        }
        this._invertedConcatenatedMatrix.set(this.getConcatenatedMatrix());
        this._invertedConcatenatedMatrix.inverse(this._invertedConcatenatedMatrix);
        this._removeFlags(FrameFlags.InvalidInvertedConcatenatedMatrix);
      }
      return this._invertedConcatenatedMatrix;
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