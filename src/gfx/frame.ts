/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Shumway.GFX {
  import Rectangle = Geometry.Rectangle;
  import Point = Geometry.Point;
  import Matrix = Geometry.Matrix;
  import DirtyRegion = Geometry.DirtyRegion;
  import Filter = Shumway.GFX.Filter;
  import TileCache = Geometry.TileCache;
  import Tile = Geometry.Tile;
  import OBB = Geometry.OBB;

  import assert = Shumway.Debug.assert;
  import unexpected = Shumway.Debug.unexpected;

  export enum Direction {
    None       = 0,
    Upward     = 1,
    Downward   = 2
  }

  export enum PixelSnapping {
    Never      = 0,
    Always     = 1,
    Auto       = 2
  }

  export enum Smoothing {
    Never      = 0,
    Always     = 1
  }

  export enum FrameFlags {
    Empty                                     = 0x00000,
    Dirty                                     = 0x00001,
    IsMask                                    = 0x00002,
    IgnoreMask                                = 0x00008,
    IgnoreQuery                               = 0x00010,

    /**
     * Frame has invalid bounds because one of its children's bounds have been mutated.
     */
    InvalidBounds                             = 0x00020,

    /**
     * Frame has an invalid concatenated matrix because its matrix or one of its ancestor's matrices has been mutated.
     */
    InvalidConcatenatedMatrix                 = 0x00040,

    /**
     * Frame has an invalid inverted concatenated matrix because its matrix or one of its ancestor's matrices has been
     * mutated. We don't always need to compute the inverted matrix. This is why we use a sepearete invalid flag for it
     * and don't roll it under the |InvalidConcatenatedMatrix| flag.
     */
    InvalidInvertedConcatenatedMatrix         = 0x00080,

    /**
     * Frame has an invalid concatenated color transform because its color transform or one of its ancestor's color
     * transforms has been mutated.
     */
    InvalidConcatenatedColorMatrix            = 0x00100,

    /**
     * Frame has invalid contents and needs to be repainted, this bit is culled by the viewport.
     */
    InvalidPaint                              = 0x00200,

    EnterClip                                 = 0x01000,
    LeaveClip                                 = 0x02000,

    Visible                                   = 0x04000,
    Transparent                               = 0x08000,

    /**
     * Frame should be cached as a bitmap. This causes masks to behave differently, so it's more than just an optimization.
     */
    CacheAsBitmap                             = 0x10000
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
    AllowClipWrite              = 64,
    AllowAllWrite               = AllowMatrixWrite      |
                                  AllowColorMatrixWrite |
                                  AllowBlendModeWrite   |
                                  AllowFiltersWrite     |
                                  AllowMaskWrite        |
                                  AllowChildrenWrite    |
                                  AllowClipWrite
  }

  /**
   * The |Frame| class is the base class for all nodes in the frame tree. Frames have several local and computed
   * properties. Computed properties are evaluated lazily and cached locally. Invalid bits are used to mark
   * computed properties as being invalid and may be cleared once these properties are re-evaluated.
   *
   * Capability flags are not yet implemented. The idea is to force some constraits on frames so that algorithms
   * can run more effectively.
   *
   */
  export class Frame {

    /**
     * Used as a temporary array to avoid allocations.
     */
    private static _path: Frame[] = [];

    /**
     * Give each frame a unique id number.
     */
    private static _nextID: number = 0;

    /*
     * Return's a list of ancestors excluding the |last|, the return list is reused.
     */
    private static _getAncestors(node: Frame, last: Frame = null): Frame [] {
      var path = Frame._path;
      path.length = 0;
      while (node && node !== last) {
        release || assert(node !== node._parent);
        path.push(node);
        node = node._parent;
      }
      release || assert (node === last, "Last ancestor is not an ancestor.");
      return path;
    }

    private _blendMode: BlendMode;
    private _matrix: Matrix;
    private _concatenatedMatrix: Matrix;
    private _invertedConcatenatedMatrix: Matrix;
    private _filters: Filter [];
    private _colorMatrix: ColorMatrix;
    private _concatenatedColorMatrix: ColorMatrix;
    private _properties: {[name: string]: any};
    private _mask: Frame;

    /**
     * The number of sibilings to clip in back-to-front order. If |-1| then this does not specify a clipping region.
     */
    private _clip: number;

    /**
     * Stage location where the frame was previously drawn. This is used to compute dirty regions and
     * is updated every time the frame is rendered.
     */
    private _previouslyRenderedAABB: Rectangle;
    private _flags: FrameFlags;
    private _smoothing: Smoothing;
    private _pixelSnapping: PixelSnapping;
    private _id: number;

    protected _parent: Frame;
    protected _capability: FrameCapabilityFlags;

    public set previouslyRenderedAABB(rectange: Rectangle) {
      this._previouslyRenderedAABB = rectange;
    }

    public get previouslyRenderedAABB(): Rectangle {
      return this._previouslyRenderedAABB;
    }

    public get parent(): Frame {
      return this._parent;
    }

    public get id(): number {
      return this._id;
    }

    constructor () {
      this._id = Frame._nextID ++;
      this._flags = FrameFlags.Visible                            |
                    FrameFlags.InvalidPaint                       |
                    FrameFlags.InvalidBounds                      |
                    FrameFlags.InvalidConcatenatedMatrix          |
                    FrameFlags.InvalidInvertedConcatenatedMatrix  |
                    FrameFlags.InvalidConcatenatedColorMatrix;

      this._capability = FrameCapabilityFlags.AllowAllWrite;
      this._parent = null;
      this._clip = -1;
      this._blendMode = BlendMode.Normal;
      this._filters = [];
      this._mask = null;
      this._matrix = Matrix.createIdentity();
      this._concatenatedMatrix = Matrix.createIdentity();
      this._invertedConcatenatedMatrix = null;
      this._colorMatrix = ColorMatrix.createIdentity();
      this._concatenatedColorMatrix = ColorMatrix.createIdentity();

      this._smoothing = Smoothing.Never;
      this._pixelSnapping = PixelSnapping.Never;
    }

    public setFlags(flags: FrameFlags) {
      this._flags |= flags;
    }

    protected _removeFlags(flags: FrameFlags) {
      this._flags &= ~flags;
    }

    public hasFlags(flags: FrameFlags): boolean {
      return (this._flags & flags) === flags;
    }

    public toggleFlags(flags: FrameFlags, on: boolean) {
      if (on) {
        this._flags |= flags;
      } else {
        this._flags &= ~flags;
      }
    }

    protected _hasAnyFlags(flags: FrameFlags): boolean {
      return !!(this._flags & flags);
    }

    /**
     * Finds the closest ancestor with a given set of flags that are either turned on or off.
     */
    private _findClosestAncestor(flags: FrameFlags, on: boolean): Frame {
      var node = this;
      while (node) {
        if (node.hasFlags(flags) === on) {
          return node;
        }
        release || assert(node !== node._parent);
        node = node._parent;
      }
      return null;
    }

    /**
     * Tests if this frame is an ancestor of the specified frame.
     */
    private _isAncestor(child: Frame): boolean {
      var node = child;
      while (node) {
        if (node === this) {
          return true;
        }
        release || assert(node !== node._parent);
        node = node._parent;
      }
      return false;
    }

    /**
     * Propagates capabilities up and down the frame tree.
     * TODO: Make this non-recursive.
     */
    protected _setCapability(capability: FrameCapabilityFlags, on: boolean = true, direction: Direction = Direction.None) {
      if (on) {
        this._capability |= capability;
      } else {
        this._capability &= ~capability;
      }
      if (direction === Direction.Upward && this._parent) {
        this._parent._setCapability(capability, on, direction);
      }
    }

    private _removeCapability(capability: FrameCapabilityFlags) {
      this._setCapability(capability, false);
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
     * Propagates flags up the frame tree. Propagation stops if all flags are already set.
     */
    protected _propagateFlagsUp(flags: FrameFlags) {
      if (this.hasFlags(flags)) {
        return;
      }
      this.setFlags(flags);
      var parent = this._parent;
      if (parent) {
        parent._propagateFlagsUp(flags);
      }
    }

    /**
     * Propagates flags down the frame tree. Non-containers just set the flags on themselves.
     *
     * Overridden in FrameContainer.
     */
    protected _propagateFlagsDown(flags: FrameFlags) {
      this.setFlags(flags);
    }

    /**
     * Marks this frame as having been moved in its parent frame. This needs to be called whenever the position
     * of a frame changes in the frame tree. For instance, its matrix has been mutated or it has been added or
     * removed from a frame container.
     */
    protected _invalidatePosition() {
      this._propagateFlagsDown(FrameFlags.InvalidConcatenatedMatrix |
                               FrameFlags.InvalidInvertedConcatenatedMatrix);
      if (this._parent) {
        this._parent._invalidateBounds();
      }
      this._invalidateParentPaint();
    }

    /**
     * Marks this frame as needing to be repainted.
     */
    public invalidatePaint() {
      this._propagateFlagsUp(FrameFlags.InvalidPaint);
    }

    private _invalidateParentPaint() {
      if (this._parent) {
        this._parent._propagateFlagsUp(FrameFlags.InvalidPaint);
      }
    }

    private _invalidateBounds(): void {
      /* TODO: We should only propagate this bit if the bounds are actually changed. We can do the
       * bounds computation eagerly if the number of children is low. If there are no changes in the
       * bounds we don't need to propagate the bit. */
      this._propagateFlagsUp(FrameFlags.InvalidBounds);
    }

    public get properties(): {[name: string]: any} {
      return this._properties || (this._properties = Object.create(null));
    }

    public get x(): number {
      return this._matrix.tx;
    }

    public set x(value: number) {
      this.checkCapability(FrameCapabilityFlags.AllowMatrixWrite);
      this._matrix.tx = value;
      this._invalidatePosition();
    }

    public get y(): number {
      return this._matrix.ty;
    }

    public set y(value: number) {
      this.checkCapability(FrameCapabilityFlags.AllowMatrixWrite);
      this._matrix.ty = value;
      this._invalidatePosition();
    }

    public get matrix(): Matrix {
      return this._matrix;
    }

    public set matrix(value: Matrix) {
      this.checkCapability(FrameCapabilityFlags.AllowMatrixWrite);
      this._matrix.set(value);
      this._invalidatePosition();
    }

    public set blendMode(value: BlendMode) {
      value = value | 0;
      this.checkCapability(FrameCapabilityFlags.AllowBlendModeWrite);
      this._blendMode = value;
      this._invalidateParentPaint();
    }

    public get blendMode(): BlendMode {
      return this._blendMode;
    }

    public set filters(value: Filter[]) {
      this.checkCapability(FrameCapabilityFlags.AllowFiltersWrite);
      this._filters = value;
      this._invalidateParentPaint();
    }

    public get filters(): Filter[] {
      return this._filters;
    }

    public set colorMatrix(value: ColorMatrix) {
      this.checkCapability(FrameCapabilityFlags.AllowColorMatrixWrite);
      this._colorMatrix.set(value);
      this._propagateFlagsDown(FrameFlags.InvalidConcatenatedColorMatrix);
      this._invalidateParentPaint();
    }

    public get colorMatrix(): ColorMatrix {
      return this._colorMatrix;
    }

    public set mask(value: Frame) {
      this.checkCapability(FrameCapabilityFlags.AllowMaskWrite);
      if (this._mask && this._mask !== value) {
        this._mask._removeFlags(FrameFlags.IsMask);
      }
      this._mask = value;
      if (this._mask) {
        // TODO: Check if this assertion makes sense.
        // release || assert (!this._mask._hasFlags(FrameFlags.IsMask));
        this._mask.setFlags(FrameFlags.IsMask);
        this._mask.invalidate();
      }
      this.invalidate();
    }

    public get mask() {
      return this._mask;
    }

    public set clip(value: number) {
      this.checkCapability(FrameCapabilityFlags.AllowClipWrite);
      this._clip = value;
    }

    public get clip(): number {
      return this._clip;
    }

    public getBounds(): Rectangle {
      release || assert(false, "Override this.");
      return null;
    }

    public gatherPreviousDirtyRegions() {
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

    public getConcatenatedColorMatrix(): ColorMatrix {
      if (!this._parent) {
        return this._colorMatrix;
      }
      // Compute the concatenated color transforms for this node and all of its ancestors.
      if (this.hasFlags(FrameFlags.InvalidConcatenatedColorMatrix)) {
        var ancestor = this._findClosestAncestor(FrameFlags.InvalidConcatenatedColorMatrix, false);
        var path = Frame._getAncestors(this, ancestor);
        var m = ancestor ? ancestor._concatenatedColorMatrix.clone() : ColorMatrix.createIdentity();
        for (var i = path.length - 1; i >= 0; i--) {
          var ancestor = path[i];
          release || assert (ancestor.hasFlags(FrameFlags.InvalidConcatenatedColorMatrix));
          // TODO: Premultiply here.
          m.multiply(ancestor._colorMatrix);
          ancestor._concatenatedColorMatrix.set(m);
          ancestor._removeFlags(FrameFlags.InvalidConcatenatedColorMatrix);
        }
      }
      return this._concatenatedColorMatrix;
    }

    public getConcatenatedAlpha(ancestor: Frame = null): number {
      var frame = this;
      var alpha = 1;
      while (frame && frame !== ancestor) {
        alpha *= frame._colorMatrix.alphaMultiplier;
        frame = frame._parent;
      }
      return alpha;
    }

    public get stage(): Stage {
      /*
      var frame = this;
      while (frame._parent) {
        frame = frame._parent;
      }
      if (frame instanceof Stage) {
        return <Stage>frame;
      }
      */
      return null;
    }

    public getConcatenatedMatrix(): Matrix {
      // Compute the concatenated transforms for this node and all of its ancestors.
      if (this.hasFlags(FrameFlags.InvalidConcatenatedMatrix)) {
        var ancestor = this._findClosestAncestor(FrameFlags.InvalidConcatenatedMatrix, false);
        var path = Frame._getAncestors(this, ancestor);
        var m = ancestor ? ancestor._concatenatedMatrix.clone() : Matrix.createIdentity();
        for (var i = path.length - 1; i >= 0; i--) {
          var ancestor = path[i];
          release || assert (ancestor.hasFlags(FrameFlags.InvalidConcatenatedMatrix));
          m.preMultiply(ancestor._matrix);
          ancestor._concatenatedMatrix.set(m);
          ancestor._removeFlags(FrameFlags.InvalidConcatenatedMatrix);
        }
      }
      return this._concatenatedMatrix;
    }

    private _getInvertedConcatenatedMatrix(): Matrix {
      if (this.hasFlags(FrameFlags.InvalidInvertedConcatenatedMatrix)) {
        if (!this._invertedConcatenatedMatrix) {
          this._invertedConcatenatedMatrix = Matrix.createIdentity();
        }
        this._invertedConcatenatedMatrix.set(this.getConcatenatedMatrix());
        this._invertedConcatenatedMatrix.inverse(this._invertedConcatenatedMatrix);
        this._removeFlags(FrameFlags.InvalidInvertedConcatenatedMatrix);
      }
      return this._invertedConcatenatedMatrix;
    }

    public invalidate() {
      this.setFlags(FrameFlags.Dirty);
    }

    public visit(visitor: (Frame, Matrix?, FrameFlags?) => VisitorFlags,
                 transform?: Matrix,
                 flags: FrameFlags = FrameFlags.Empty,
                 visitorFlags: VisitorFlags = VisitorFlags.None) {
      var frameStack: Frame [];
      var frame: Frame;
      var frameContainer: FrameContainer;
      var frontToBack = visitorFlags & VisitorFlags.FrontToBack;
      frameStack = [this];
      var transformStack: Matrix [];
      var calculateTransform = !!transform;
      if (calculateTransform) {
        transformStack = [transform.clone()];
      }
      var flagsStack: FrameFlags [] = [flags];
      while (frameStack.length > 0) {
        frame = frameStack.pop();
        if (calculateTransform) {
          transform = transformStack.pop();
        }
        flags = flagsStack.pop() | frame._flags;
        var result: VisitorFlags = visitor(frame, transform, flags);
        if (result === VisitorFlags.Continue) {
          if (frame instanceof FrameContainer) {
            frameContainer = <FrameContainer>frame;
            var children = frameContainer.children;
            var length = children.length;
            if (visitorFlags & VisitorFlags.Clips && !disableClipping.value) {
              var leaveClip: Frame [][] = frameContainer.gatherLeaveClipEvents();

              /* This code looks a bit strange because it needs to push nodes into the |frameStack| in reverse. This is the
               * reason we had to collect the clip regions in a seperate pass before. */
              for (var i = length - 1; i >= 0; i--) {
                // Check to see if we have any clip leave events that we need to push into the |frameStack|?
                if (leaveClip && leaveClip[i]) {
                  while (leaveClip[i].length) {
                    var clipFrame = leaveClip[i].shift();
                    frameStack.push(clipFrame);
                    flagsStack.push(FrameFlags.LeaveClip);
                    if (calculateTransform) {
                      var t = transform.clone();
                      t.preMultiply(clipFrame.matrix);
                      transformStack.push(t);
                    }
                  }
                }
                var child = children[i];
                release || assert(child);
                frameStack.push(child);
                if (calculateTransform) {
                  var t = transform.clone();
                  t.preMultiply(child.matrix);
                  transformStack.push(t);
                }
                if (child.clip >= 0) {
                  flagsStack.push(flags | FrameFlags.EnterClip);
                } else {
                  flagsStack.push(flags);
                }
              }
            } else {
              for (var i = 0; i < length; i++) {
                var child = children[frontToBack ? i : length - 1 - i];
                if (!child) {
                  continue;
                }
                frameStack.push(child);
                if (calculateTransform) {
                  var t = transform.clone();
                  t.preMultiply(child.matrix);
                  transformStack.push(t);
                }
                flagsStack.push(flags);
              }
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

    public set smoothing(value: Smoothing) {
      this._smoothing = value;
      this.invalidate();
    }

    public get smoothing(): Smoothing {
      return this._smoothing;
    }

    public set pixelSnapping(value: PixelSnapping) {
      this._pixelSnapping = value;
      this.invalidate();
    }

    public get pixelSnapping(): PixelSnapping {
      return this._pixelSnapping;
    }

//    /**
//     * Returns a list of frames whose bounds intersect the query point. The frames
//     * are returned front to back. By default, only the first frame that intersects
//     * the query point is returned, unless the |multiple| argument is specified.
//     */
//    public queryFramesByPoint(query: Point, multiple: boolean = false, includeFrameContainers: boolean = false): Frame [] {
//      var inverseTransform: Matrix = Matrix.createIdentity();
//      var local = Point.createEmpty();
//      var frames = [];
//      this.visit(function (frame: Frame, transform?: Matrix, flags?: FrameFlags): VisitorFlags {
//        if (flags & FrameFlags.IgnoreQuery) {
//          return VisitorFlags.Skip;
//        }
//        transform.inverse(inverseTransform);
//        local.set(query);
//        inverseTransform.transformPoint(local);
//        if (frame.getBounds().containsPoint(local)) {
//          if (frame instanceof FrameContainer) {
//            if (includeFrameContainers) {
//              frames.push(frame);
//              if (!multiple) {
//                return VisitorFlags.Stop;
//              }
//            }
//            return VisitorFlags.Continue;
//          } else {
//            frames.push(frame);
//            if (!multiple) {
//              return VisitorFlags.Stop;
//            }
//          }
//          return VisitorFlags.Continue;
//        } else {
//          return VisitorFlags.Skip;
//        }
//      }, Matrix.createIdentity(), FrameFlags.Empty);
//
//      /*
//       *  We can't simply do a back to front traversal here because the order in which we
//       *  visit frame containers would make it hard to compute the correct front-to-back
//       *  order.
//       *
//       *       A
//       *      / \
//       *     /   \
//       *    B     E
//       *   / \   / \
//       *  C   D F   G
//       *
//       *  The front-to-back order is [A, E, G, F, B, D, C], if G and D are both hit, then the hit order
//       *  would be computed as [A, E, G, B, D] when clearly it should be [G, E, D, B, A]. If we walk
//       *  the tree in back-to-front order [A, B, C, D, E, F, G] the hit order becomes [A, B, D, E, G]
//       *  which we can simply reverse.
//       */
//      frames.reverse();
//      return frames;
//    }
  }

  export enum NodeCapabilityFlags {
    None                        = 0,

    AllowMatrixWrite            = 1,
    AllowColorMatrixWrite       = 2,
    AllowBlendModeWrite         = 4,
    AllowFiltersWrite           = 8,
    AllowMaskWrite              = 16,
    AllowChildrenWrite          = 32,
    AllowClipWrite              = 64,
    AllowAllWrite               = AllowMatrixWrite      |
                                  AllowColorMatrixWrite |
                                  AllowBlendModeWrite   |
                                  AllowFiltersWrite     |
                                  AllowMaskWrite        |
                                  AllowChildrenWrite    |
                                  AllowClipWrite
  }

  export enum NodeFlags {
    None                                      = 0x00000,
    Dirty                                     = 0x00001,
    InvalidPaint                              = 0x00002,
    InvalidConcatenatedMatrix                 = 0x00004 // Delete
  }

  /**
   * Faster way of doing type and subtype checks, also nice for switching.
   */
  export enum NodeType {
    Node                   = 0x0001,
     Shape                 = 0x0002 | Node,
     Group                 = 0x0004 | Node,
      TransformGroup       = 0x0008 | Group,
       Stage               = 0x0010 | TransformGroup,
     State                 = 0x0020 | Node
  }

  export class NodeVisitor {
    visitNode(node: Node, state: State) {
      // ...
    }

    visitGroup(node: Group, state: State) {
      this.visitNode(node, state);
    }

    visitTransformGroup(node: TransformGroup, state: State) {
      this.visitGroup(node, state);
    }

    visitStage(node: Stage, state: State) {
      this.visitTransformGroup(node, state);
    }

    visitShape(node: Shape, state: State) {
      this.visitNode(node, state);
    }

    visitState(node: State, state: State) {
      this.visitNode(node, state);
    }
  }

  /**
   * Base class of all nodes in the scene graph.
   */
  export class Node {
    private static _nextId: number = 0;

    protected _id: number;
    protected _type: NodeType;
    protected _flags: NodeFlags;
    protected _index: number;
    protected _parent: Node;
    protected _capability: NodeCapabilityFlags;

    constructor() {
      this._id = Node._nextId ++;
      this._type = NodeType.Node;
      this._flags = NodeFlags.None;
      this._index = -1;
      this._parent = null;
      this._capability = NodeCapabilityFlags.None;
    }

    public getBounds(clone: boolean = false): Rectangle {
      throw Shumway.Debug.abstractMethod("Node::getBounds");
    }

    public clone(): Node {
      throw Shumway.Debug.abstractMethod("Node::clone");
    }

    public setFlags(flags: NodeFlags) {
      this._flags |= flags;
    }

    public hasFlags(flags: NodeFlags): boolean {
      return (this._flags & flags) === flags;
    }

    protected removeFlags(flags: NodeFlags) {
      this._flags &= ~flags;
    }

    public hasCapability(capability: NodeCapabilityFlags) {
      return this._capability & capability;
    }

    public isAncestor(node: Node): boolean {
      while (node) {
        if (node === this) {
          return true;
        }
        release || assert(node !== node._parent);
        node = node._parent;
      }
      return false;
    }

    public isType(type: NodeType): boolean {
      return this._type === type;
    }

    public isTypeOf(type: NodeType): boolean {
      return (this._type & type) === type;
    }

    public getTransformGroup(): TransformGroup {
      var node = this, last = null;
      // Look for the first |TransformGroup| ancestor that is older than the
      while (!node.isTypeOf(NodeType.TransformGroup)) {
        var parent = <Group>node._parent;
        if (parent === null) {
          // We cannot create a transform group for the root node.
          return null;
        } else if (!parent.isTypeOf(NodeType.TransformGroup)) {
          // Insert a transform group between the node and the parent.
          var transformGroup = new TransformGroup();
          parent.uncheckedAddChildAt(transformGroup, node._index);
          transformGroup.uncheckedAddChild(node)
          return transformGroup;
        }
        node = node._parent;
      }
      return <TransformGroup>node;
    }

    public getConcatenatedMatrix(clone: boolean = false): Matrix {
      return Matrix.createIdentity();
    }

    public visit(visitor: NodeVisitor, state: State) {
      switch (this._type) {
        case NodeType.Node:
          visitor.visitNode(this, state);
          break;
        case NodeType.Group:
          visitor.visitGroup(<Group>this, state);
          break;
        case NodeType.TransformGroup:
          visitor.visitTransformGroup(<TransformGroup>this, state);
          break;
        case NodeType.Stage:
          visitor.visitStage(<Stage>this, state);
          break;
        case NodeType.Shape:
          visitor.visitShape(<Shape>this, state);
          break;
        case NodeType.State:
          visitor.visitState(<State>this, state);
          break;
        default:
          Debug.unexpectedCase();
      }
    }

    public toString() {
      return NodeType[this._type] + " " + this._id;
    }
  }

  /**
   * Nodes that contain other nodes. All nodes have back references to the groups
   * they belong to, forming a tree structure.
   */
  export class Group extends Node {
    protected _children: Node [];

    constructor() {
      super();
      this._type = NodeType.Group;
      this._children = [];
    }

    public getChildren(clone: boolean = false): Node [] {
      if (clone) {
        return this._children.slice(0);
      }
      return this._children;
    }

    public addChild(node: Node) {
      release || assert(node, "Cannot add null nodes.");
      release || assert(!node._parent, "Node is already has a parent elsewhere.");
      release || assert(!node.isAncestor(this), "Cycles are not allowed.");
      this.uncheckedAddChild(node);
    }

    uncheckedAddChild(node: Node) {
      node._parent = this;
      node._index = this._children.length;
      this._children.push(node);
    }

    public addChildAt(node: Node, index: number) {
      release || assert(node, "Cannot set null nodes.");
      release || assert(!node._parent, "Node is already has a parent elsewhere.");
      release || assert(!node.isAncestor(this), "Cycles are not allowed.");
      release || assert(index >= 0 && index < this._children.length, "Out of range.");
      this.uncheckedAddChildAt(node, index);
    }

    uncheckedAddChildAt(node: Node, index: number) {
      var previous = this._children[index];
      previous._index = -1;
      previous._parent = null;
      node._index = index;
      node._parent = this;
      this._children[index] = node;
    }
  }

  /**
   * Nodes with transformations: matrix, color matrix, etc.
   */
  export class TransformGroup extends Group {
    protected _matrix: Matrix;
    protected _colorMatrix: ColorMatrix;

    constructor() {
      super();
      this._type = NodeType.TransformGroup;
      this._matrix = Matrix.createIdentity();
      this._colorMatrix = ColorMatrix.createIdentity();
    }

    public get x(): number {
      return this._matrix.tx;
    }

    public set x(value: number) {
      this._matrix.tx = value;
    }

    public get y(): number {
      return this._matrix.ty;
    }

    public set y(value: number) {
      this._matrix.ty = value;
    }

    public setMatrix(value: Matrix) {
      this._matrix.set(value);
    }

    public getMatrix(clone: boolean = false): Matrix {
      if (clone) {
        return this._matrix.clone();
      }
      return this._matrix;
    }
  }

  /**
   * Nodes that cache transformation state. These are used to thread state when traversing
   * the scene graph. Since they keep track of rendering state, they might as well become
   * scene graph nodes.
   *
   * TODO: Maybe we should be extending TransformGroup, but what to do about the child
   * pointer that doesn't point back to us.
   */
  export class State extends Node {
    protected _matrix: Matrix;
    protected _colorMatrix: ColorMatrix;
    protected _child: Node;

    public setChild(child: Node) {
      this._child = child;
    }

    constructor() {
      super();
      this._type = NodeType.State;
    }
  }

  export class Shape extends Node {
    private _source: Renderable;

    get source(): Renderable {
      return this._source;
    }

    constructor(source: Renderable) {
      super();
      release || assert(source);
      this._source = source;
      this._type = NodeType.Shape;
    }

    public getBounds(): Rectangle {
      return this.source.getBounds();
    }
  }
}
