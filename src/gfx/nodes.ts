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

  export enum BlendMode {
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

  export enum NodeFlags {
    None                              = 0x00000,
    BoundsAutoCompute                 = 0x00002,
    IsMask                            = 0x00004,

    Dirty                             = 0x00010,

    InvalidBounds                     = 0x00100,

    InvalidConcatenatedMatrix         = 0x00200,
    InvalidConcatenatedColorMatrix    = 0x00400,

    UpOnAddedOrRemoved                = InvalidBounds | Dirty,
    UpOnMoved                         = InvalidBounds | Dirty,

    DownOnAddedOrRemoved              = InvalidConcatenatedMatrix | InvalidConcatenatedColorMatrix,
    DownOnMoved                       = InvalidConcatenatedMatrix | InvalidConcatenatedColorMatrix,

    UpOnColorMatrixChanged            = Dirty,
    DownOnColorMatrixChanged          = InvalidConcatenatedColorMatrix,

    Visible                           = 0x10000,

    UpOnInvalidate                    = InvalidBounds | Dirty,

    Default                           = BoundsAutoCompute |
                                        InvalidBounds |
                                        InvalidConcatenatedMatrix |
                                        Visible,

    Scalable                          = 0x100000,

    CacheAsBitmap                     = 0x20000,
    PixelSnapping                     = 0x40000,
    ImageSmoothing                    = 0x80000,

    // Delete These
    InvalidPaint                      = 0x00020,
    Transparent                       = 0x08000,
  }

  /**
   * Scene graph object hierarchy. This enum makes it possible to write fast type checks.
   */
  export enum NodeType {
    Node                   = 0x0001,
      Shape                = 0x0003, // 0x0002 | Node,
      Group                = 0x0005, // 0x0004 | Node,
        Stage              = 0x000D, // 0x0008 | Group
        Scissor            = 0x0015  // 0x0010 | Group
  }

  /**
   * Basic node visitor.
   */
  export class NodeVisitor {
    visitNode(node: Node, state: State) {
      // ...
    }

    visitShape(node: Shape, state: State) {
      this.visitNode(node, state);
    }

    visitGroup(node: Group, state: State) {
      this.visitNode(node, state);
      var children = node.getChildren();
      for (var i = 0; i < children.length; i++) {
        children[i].visit(this, state);
      }
    }

    visitStage(node: Stage, state: State) {
      this.visitGroup(node, state);
    }

    visitScissor(node: Scissor, state: State) {
      this.visitGroup(node, state);
    }
  }

  /**
   * Helper visitor that checks and resets the dirty bit.
   */
  export class DirtyNodeVisitor extends NodeVisitor {
    public isDirty = true;
    visitNode(node: Node, state: State) {
      if (node.hasFlags(NodeFlags.Dirty)) {
        this.isDirty = true;
      }
      node.toggleFlags(NodeFlags.Dirty, false);
    }
  }

  export class TracingNodeVisitor extends NodeVisitor {
    constructor(public writer: IndentingWriter) {
      super();
    }

    visitNode(node: Node, state: State) {
      // ...
    }

    visitShape(node: Shape, state: State) {
      this.writer.writeLn(node.toString());
      this.visitNode(node, state);
    }

    visitGroup(node: Group, state: State) {
      this.visitNode(node, state);

      var children = node.getChildren();
      this.writer.enter(node.toString() + " " + children.length);
      for (var i = 0; i < children.length; i++) {
        children[i].visit(this, state);
      }
      this.writer.outdent();
    }

    visitStage(node: Stage, state: State) {
      this.visitGroup(node, state);
    }

    visitScissor(node: Scissor, state: State) {
      this.visitGroup(node, state);
    }
  }

  /**
   * Base class of all nodes in the scene graph.
   */
  export class Node {
    private static _nextId: number = 0;

    /**
     * Used as a temporary array to avoid allocations.
     */
    private static _path: Node [] = [];

    protected _id: number;
    protected _type: NodeType;
    protected _flags: NodeFlags;
    protected _index: number;
    protected _parent: Node;
    protected _clip: number = -1;

    protected _layer: Layer;
    protected _transform: Transform;

    /**
     * Property bag used to attach dynamic properties to this object.
     */
    protected _properties: {[name: string]: any};

    /**
     * Bounds of the scene graph object. Bounds are computed automatically for non-leaf nodes
     * that have the |NodeFlags.BoundsAutoCompute| flag set.
     */
    protected _bounds: Rectangle;

    constructor() {
      this._id = Node._nextId ++;
      this._type = NodeType.Node;
      this._flags = NodeFlags.Default;
      this._index = -1;
      this._parent = null;
      this._bounds = null;
      this._layer = null;
      this._transform = null;
      this._properties = null;
    }

    public get properties(): {[name: string]: any} {
      return this._properties || (this._properties = {});
    }

    public get clip(): number {
      return this._clip;
    }

    public set clip(value: number) {
      this._clip = value;
    }

    public get parent(): Node {
      return this._parent;
    }

    public getBounds(clone: boolean = false): Rectangle {
      throw Shumway.Debug.abstractMethod("Node::getBounds");
    }

    public setBounds(value: Rectangle) {
      release || assert(!(this._flags & NodeFlags.BoundsAutoCompute));
      var bounds = this._bounds || (this._bounds = Rectangle.createEmpty());
      bounds.set(value);
      this.removeFlags(NodeFlags.InvalidBounds);
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

    public removeFlags(flags: NodeFlags) {
      this._flags &= ~flags;
    }

    public toggleFlags(flags: NodeFlags, on: boolean) {
      if (on) {
        this._flags |= flags;
      } else {
        this._flags &= ~flags;
      }
    }

    /**
     * Propagates flags up the tree. Propagation stops if all flags are already set.
     */
    _propagateFlagsUp(flags: NodeFlags) {
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
     * Propagates flags down the tree. Non-containers just set the flags on themselves.
     */
    _propagateFlagsDown(flags: NodeFlags) {
      throw Shumway.Debug.abstractMethod("Node::_propagateFlagsDown");
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

    /*
     * Return's a list of ancestors excluding the |last|, the return list is reused.
     */
    static _getAncestors(node: Node, last: Node): Node [] {
      var path = Node._path;
      path.length = 0;
      while (node && node !== last) {
        release || assert(node !== node._parent);
        path.push(node);
        node = node._parent;
      }
      release || assert (node === last, "Last ancestor is not an ancestor.");
      return path;
    }

    /**
     * Finds the closest ancestor with a given set of flags that are either turned on or off.
     */
    _findClosestAncestor(flags: NodeFlags, on: boolean): Node {
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

    uncheckedSetChildAt(node: Node, index: number) {
      throw Shumway.Debug.abstractMethod("Node::uncheckedSetChildAt");
    }

    public isType(type: NodeType): boolean {
      return this._type === type;
    }

    public isTypeOf(type: NodeType): boolean {
      return (this._type & type) === type;
    }

    public getTransformMatrix(clone: boolean = false): Matrix {
      return this.getTransform().getMatrix(clone);
    }

    public getTransform(): Transform {
      if (this._transform === null) {
        this._transform = new Transform(this);
      }
      return this._transform;
    }

    public getLayer(): Layer {
      if (this._layer === null) {
        this._layer = new Layer(this);
      }
      return this._layer;
    }

//    public getConcatenatedMatrix(clone: boolean = false): Matrix {
//      var transform: Transform = this.getTransform(false);
//      if (transform) {
//        return transform.getConcatenatedMatrix(clone);
//      }
//      return Matrix.createIdentity();
//    }

    public visit(visitor: NodeVisitor, state: State) {
      switch (this._type) {
        case NodeType.Node:
          visitor.visitNode(this, state);
          break;
        case NodeType.Group:
          visitor.visitGroup(<Group>this, state);
          break;
        case NodeType.Stage:
          visitor.visitStage(<Stage>this, state);
          break;
        case NodeType.Shape:
          visitor.visitShape(<Shape>this, state);
          break;
        case NodeType.Scissor:
          visitor.visitScissor(<Scissor>this, state);
          break;
        default:
          Debug.unexpectedCase();
      }
    }

    public invalidate() {
      this._propagateFlagsUp(NodeFlags.UpOnInvalidate);
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
      this._propagateFlagsUp(NodeFlags.UpOnAddedOrRemoved);
      node._propagateFlagsDown(NodeFlags.DownOnAddedOrRemoved);
    }

    public setChildAt(node: Node, index: number) {
      release || assert(node, "Cannot set null nodes.");
      release || assert(!node._parent, "Node is already has a parent elsewhere.");
      release || assert(!node.isAncestor(this), "Cycles are not allowed.");
      release || assert(index >= 0 && index < this._children.length, "Out of range.");
      this.uncheckedSetChildAt(node, index);
    }

    uncheckedSetChildAt(node: Node, index: number) {
      var last = this._children[index];
      last._index = -1;
      last._parent = null;
      last._propagateFlagsDown(NodeFlags.DownOnAddedOrRemoved);
      node._index = index;
      node._parent = this;
      this._children[index] = node;
      this._propagateFlagsUp(NodeFlags.UpOnAddedOrRemoved);
      node._propagateFlagsDown(NodeFlags.DownOnAddedOrRemoved);
    }

    public clearChildren() {
      for (var i = 0; i < this._children.length; i++) {
        var child = this._children[i];
        if (child) {
          child._index = -1;
          child._parent = null;
          child._propagateFlagsDown(NodeFlags.DownOnAddedOrRemoved);
        }
      }
      this._children.length = 0;
    }

    _propagateFlagsDown(flags: NodeFlags) {
      if (this.hasFlags(flags)) {
        return;
      }
      this.setFlags(flags);
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        children[i]._propagateFlagsDown(flags);
      }
    }

    public getBounds(clone: boolean = false): Rectangle {
      var bounds = this._bounds || (this._bounds = Rectangle.createEmpty());
      if (this.hasFlags(NodeFlags.InvalidBounds)) {
        bounds.setEmpty();
        var children = this._children;
        var childBounds = Rectangle.allocate();
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          childBounds.set(child.getBounds());
          child.getTransformMatrix().transformRectangleAABB(childBounds);
          bounds.union(childBounds);
        }
        childBounds.free();
        this.removeFlags(NodeFlags.InvalidBounds);
      }
      if (clone) {
        return bounds.clone();
      }
      return bounds;
    }
  }

  /**
   * Nodes with transformations: matrix, color matrix, etc.
   */
  export class Transform {

    protected _node: Node;
    protected _matrix: Matrix;
    protected _colorMatrix: ColorMatrix;
    protected _concatenatedMatrix: Matrix;
    protected _concatenatedColorMatrix: ColorMatrix;

    constructor(node: Node) {
      this._node = node;
      this._matrix = Matrix.createIdentity();
      this._colorMatrix = ColorMatrix.createIdentity();
      this._concatenatedMatrix = Matrix.createIdentity();
      this._concatenatedColorMatrix = ColorMatrix.createIdentity();
    }

    public get x(): number {
      return this._matrix.tx;
    }

    public set x(value: number) {
      this._matrix.tx = value;
      this._node._propagateFlagsUp(NodeFlags.UpOnMoved);
      this._node._propagateFlagsDown(NodeFlags.DownOnMoved);
    }

    public get y(): number {
      return this._matrix.ty;
    }

    public set y(value: number) {
      this._matrix.ty = value;
      this._node._propagateFlagsUp(NodeFlags.UpOnMoved);
      this._node._propagateFlagsDown(NodeFlags.DownOnMoved);
    }

    public setMatrix(value: Matrix) {
      this._matrix.set(value);
      this._node._propagateFlagsUp(NodeFlags.UpOnMoved);
      this._node._propagateFlagsDown(NodeFlags.DownOnMoved);
    }

    public setColorMatrix(value: ColorMatrix) {
      this._colorMatrix.set(value);
      this._node._propagateFlagsUp(NodeFlags.UpOnColorMatrixChanged);
      this._node._propagateFlagsDown(NodeFlags.DownOnColorMatrixChanged);
    }

    public getMatrix(clone: boolean = false): Matrix {
      if (clone) {
        return this._matrix.clone();
      }
      return this._matrix;
    }

    public hasColorMatrix() {
      return this._colorMatrix !== null;
    }

    public getColorMatrix(clone: boolean = false): ColorMatrix {
      if (this._colorMatrix === null) {
        this._colorMatrix = ColorMatrix.createIdentity();
      }
      if (clone) {
        return this._colorMatrix.clone();
      }
      return this._colorMatrix;
    }

    public getConcatenatedMatrix(clone: boolean = false): Matrix {
      // Compute the concatenated transforms for this node and all of its ancestors.
      if (this._node.hasFlags(NodeFlags.InvalidConcatenatedMatrix)) {
        var ancestor = this._node._findClosestAncestor(NodeFlags.InvalidConcatenatedMatrix, false);
        var path = Node._getAncestors(this._node, ancestor);
        var m = ancestor ? ancestor.getTransform()._concatenatedMatrix.clone() : Matrix.createIdentity();
        for (var i = path.length - 1; i >= 0; i--) {
          var ancestor = path[i];
          var ancestorTransform = ancestor.getTransform();
          release || assert (ancestor.hasFlags(NodeFlags.InvalidConcatenatedMatrix));
          m.preMultiply(ancestorTransform._matrix);
          ancestorTransform._concatenatedMatrix.set(m);
          ancestor.removeFlags(NodeFlags.InvalidConcatenatedMatrix);
        }
      }
      if (clone) {
        return this._concatenatedMatrix.clone();
      }
      return this._concatenatedMatrix;
    }

//    public getConcatenatedColorMatrix(clone: boolean = false): ColorMatrix {
//      // Compute the concatenated color transforms for this node and all of its ancestors.
//      if (this.hasFlags(NodeFlags.InvalidConcatenatedColorMatrix)) {
//        var ancestor = <Transform>this._findClosestAncestor(NodeFlags.InvalidConcatenatedColorMatrix, false);
//        var path = <Transform []>Node._getAncestors(this, ancestor, NodeType.Transform);
//        var m = ancestor ? ancestor._concatenatedColorMatrix.clone() : ColorMatrix.createIdentity();
//        for (var i = path.length - 1; i >= 0; i--) {
//          var ancestor = path[i];
//          release || assert (ancestor.hasFlags(NodeFlags.InvalidConcatenatedColorMatrix));
//          // TODO: Premultiply here.
//          m.multiply(ancestor._colorMatrix);
//          ancestor._concatenatedColorMatrix.set(m);
//          ancestor.removeFlags(NodeFlags.InvalidConcatenatedColorMatrix);
//        }
//      }
//      if (clone) {
//        return this._concatenatedColorMatrix.clone();
//      }
//      return this._concatenatedColorMatrix;
//    }

    public toString() {
      return this._matrix.toString();
    }
  }

  export class Layer {
    protected _node: Node;
    protected _blendMode: BlendMode;
    protected _mask: Node;
    protected _filters: Filter [];

    constructor(node: Node) {
      this._node = node;
      this._mask = null;
      this._blendMode = BlendMode.Normal;
    }

    get filters() {
      return this._filters;
    }

    set filters(value: Filter []) {
      this._filters = value;
    }

    get blendMode() {
      return this._blendMode;
    }

    set blendMode(value: BlendMode) {
      this._blendMode = value;
    }

    get mask(): Node {
      return this._mask;
    }

    set mask(value: Node) {
      if (this._mask && this._mask !== value) {
        this._mask.removeFlags(NodeFlags.IsMask);
      }
      this._mask = value;
      if (this._mask) {
        this._mask.setFlags(NodeFlags.IsMask);
      }
      // TODO: Keep track of masked object so we can propagate flags up.
    }

//    protected _propagateFlagsDown(flags: NodeFlags) {
//      this.setFlags(flags);
//      if (this._child) {
//        this._child._propagateFlagsDown(flags);
//      }
//      if (this._mask) {
//        this._mask._propagateFlagsDown(flags);
//      }
//    }

    public toString() {
      return BlendMode[this._blendMode];
    }
  }

  /**
   * Nodes that cache transformation state. These are used to thread state when traversing
   * the scene graph. Since they keep track of rendering state, they might as well become
   * scene graph nodes.
   */
  export class State {
    constructor() {

    }
  }

  export class Shape extends Node {
    private _source: Renderable;
    public ratio: number;

    constructor(source: Renderable) {
      super();
      release || assert(source);
      this._source = source;
      this._type = NodeType.Shape;
      this.ratio = 0;
    }

    public getBounds(clone: boolean = false): Rectangle {
      var bounds = this._bounds || (this._bounds = Rectangle.createEmpty());
      if (this.hasFlags(NodeFlags.InvalidBounds)) {
        bounds.set(this._source.getBounds());
        this.removeFlags(NodeFlags.InvalidBounds);
      }
      if (clone) {
        return bounds.clone();
      }
      return bounds;
    }

    get source(): Renderable {
      return this._source;
    }

    _propagateFlagsDown(flags: NodeFlags) {
      this.setFlags(flags);
    }
  }

  /**
   * Scissor node that clips everything outside of its bounds.
   */
  export class Scissor extends Group {
    color: Color = Color.None;
    constructor(w: number, h: number) {
      super();
      this._bounds = new Rectangle(0, 0, w, h);
      this._flags &= ~NodeFlags.BoundsAutoCompute;
      this._type = NodeType.Scissor;
    }

    public getBounds(clone: boolean = false): Rectangle {
      if (clone) {
        return this._bounds.clone();
      }
      return this._bounds;
    }
  }
}
