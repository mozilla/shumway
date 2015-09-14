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

  export const enum NodeFlags {
    None                              = 0x00000,

    Visible                           = 0x00001,

    Transparent                       = 0x00002,

    /**
     * Whether this node acts as a mask for another node.
     */
    IsMask                            = 0x00004,

    /**
     * Whether this node is marked to be cached as a bitmap. This isn't just a performance optimization,
     * but also affects the way masking is performed.
     */
    CacheAsBitmap                     = 0x00010,

    /**
     * Whether this node's contents should be drawn snapped to pixel boundaries.
     * Only relevant for bitmaps.
     */
    PixelSnapping                     = 0x00020,

    /**
     * Whether this node's contents should use higher quality image smoothing.
     * Only relevant for bitmaps.
     */
    ImageSmoothing                    = 0x00040,

    /**
     * Whether source has dynamic content.
     */
    Dynamic                           = 0x00100,

    /**
     * Whether the source's content can be scaled and drawn at a higher resolution.
     */
    Scalable                          = 0x00200,

    /**
     * Whether the source's content should be tiled.
     */
    Tileable                          = 0x00400,

    /**
     * Whether this node's bounding box is automatically computed from its children. If this
     * flag is |false| then this node's bounding box can only be set via |setBounds|.
     */
    BoundsAutoCompute                 = 0x00800,

    /**
     * Whether this node needs to be repainted.
     */
    Dirty                             = 0x01000,

    /**
     * Whether this node's bounds is invalid and needs to be recomputed. Only nodes that have the
     * |BoundsAutoCompute| flag set can have this flag set.
     */
    InvalidBounds                     = 0x02000,

    /**
     * Whether this node's concatenated matrix is invalid. This happens whenever a node's ancestor
     * is moved in the node tree.
     */
    InvalidConcatenatedMatrix         = 0x04000,

    /**
     * Whether this node's inverted concatenated matrix is invalid. This happens whenever a node's ancestor
     * is moved in the node tree.
     */
    InvalidInvertedConcatenatedMatrix = 0x08000,

    /**
     * Same as above, but for colors.
     */
    InvalidConcatenatedColorMatrix    = 0x10000,

    /**
     * Flags to propagate upwards when a node is added or removed from a group.
     */
    UpOnAddedOrRemoved                = InvalidBounds | Dirty,

    /**
     * Flags to propagate downwards when a node is added or removed from a group.
     */
    DownOnAddedOrRemoved              = InvalidConcatenatedMatrix | InvalidInvertedConcatenatedMatrix | InvalidConcatenatedColorMatrix,

    /**
     * Flags to propagate upwards when a node is moved.
     */
    UpOnMoved                         = InvalidBounds | Dirty,

    /**
     * Flags to propagate downwards when a node is moved.
     */
    DownOnMoved                       = InvalidConcatenatedMatrix | InvalidInvertedConcatenatedMatrix,

    /**
     * Flags to propagate upwards when a node's color matrix is changed.
     */
    UpOnColorMatrixChanged            = Dirty,

    /**
     * Flags to propagate downwards when a node's color matrix is changed.
     */
    DownOnColorMatrixChanged          = InvalidConcatenatedColorMatrix,

    /**
     * Flags to propagate upwards when a node is invalidated.
     */
    UpOnInvalidate                    = InvalidBounds | Dirty,

    /**
     * Default node flags, however not all node types use these defaults.
     */
    Default                           = BoundsAutoCompute |
                                        InvalidBounds |
                                        InvalidConcatenatedMatrix |
                                        InvalidInvertedConcatenatedMatrix |
                                        Visible,
  }

  /**
   * Scene graph object hierarchy. This enum makes it possible to write fast type checks.
   */
  export const enum NodeType {
    Node                   = 0x0001,
      Shape                = 0x0003, // 0x0002 | Node,
      Group                = 0x0005, // 0x0004 | Node,
        Stage              = 0x000D, // 0x0008 | Group
      Renderable           = 0x0021  // 0x0020 | Node
  }

  function getNodeTypeName(nodeType: NodeType) {
    if (nodeType === NodeType.Node) return "Node";
    else if (nodeType === NodeType.Shape) return "Shape";
    else if (nodeType === NodeType.Group) return "Group";
    else if (nodeType === NodeType.Stage) return "Stage";
    else if (nodeType === NodeType.Renderable) return "Renderable";
  }

  /**
   * Basic event types. Not much here.
   */
  export const enum NodeEventType {
    None                        = 0x0000,
    OnStageBoundsChanged        = 0x0001,
    RemovedFromStage            = 0x0002
  }

  /**
   * Basic node visitor. Inherit from this if you want a more sophisticated visitor, for instance all
   * renderers extends this class.
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

    visitRenderable(node: Renderable, state: State) {
      this.visitNode(node, state);
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

  export class PreRenderState extends State {
    private static _dirtyStack: PreRenderState [] = [];
    private static _doNotCallCtorDirectly = Object.create(null);

    matrix: Matrix = Matrix.createIdentity();
    depth: number = 0;

    constructor(unlock: any) {
      super();
      release || assert(unlock === PreRenderState._doNotCallCtorDirectly);
    }

    transform(transform: Transform): PreRenderState {
      var state = this.clone();
      state.matrix.preMultiply(transform.getMatrix());
      return state;
    }

    static allocate(): PreRenderState {
      var dirtyStack = PreRenderState._dirtyStack;
      var state = null;
      if (dirtyStack.length) {
        state = dirtyStack.pop();
      } else {
        state = new PreRenderState(this._doNotCallCtorDirectly);
      }
      return state;
    }

    public clone(): PreRenderState {
      var state = PreRenderState.allocate();
      release || assert(state);
      state.set(this);
      return state;
    }

    set (state: PreRenderState) {
      this.matrix.set(state.matrix);
    }

    free() {
      PreRenderState._dirtyStack.push(this);
    }
  }

  /**
   * Helper visitor that checks and resets the dirty bit and calculates stack levels. If the root
   * node is dirty, then we have to repaint the entire node tree.
   */
  export class PreRenderVisitor extends NodeVisitor {
    public isDirty = true;
    private _dirtyRegion: DirtyRegion;

    start(node: Group, dirtyRegion: DirtyRegion) {
      this._dirtyRegion = dirtyRegion;
      var state = PreRenderState.allocate();
      state.matrix.setIdentity();
      node.visit(this, state);
      state.free();
    }

    visitGroup(node: Group, state: PreRenderState) {
      var children = node.getChildren();
      this.visitNode(node, state);
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var childState = state.transform(child.getTransform());
        child.visit(this, childState);
        childState.free();
      }
    }

    visitNode(node: Node, state: PreRenderState) {
      if (node.hasFlags(NodeFlags.Dirty)) {
        this.isDirty = true;
      }
      node.toggleFlags(NodeFlags.Dirty, false);
      node.depth = state.depth++;
    }
  }

  /**
   * Debugging visitor.
   */
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
  }

  /**
   * Base class of all nodes in the scene graph.
   */
  export class Node {
    /**
     * Temporary array of nodes to avoid allocations.
     */
    private static _path: Node [] = [];

    /**
     * Used to give nodes unique ids.
     */
    private static _nextId: number = 0;

    protected _id: number;

    public get id(): number {
      return this._id;
    }

    /**
     * Keep track of node type directly on the node so we don't have to use |instanceof| for type checks.
     */
    protected _type: NodeType;

    /**
     * All sorts of flags.
     */
    _flags: NodeFlags;

    /**
     * Index of this node in its parent's children list.
     */
    _index: number;

    /**
     * Parent node. This is |null| for the root node and for |Renderables| which have more than one parent.
     */
    _parent: Group;

    /**
     * Number of sibillings to clip.
     */
    protected _clip: number = -1;

    /**
     * Layer info: blend modes, filters and such.
     */
    protected _layer: Layer;

    /**
     * Transform info: matrix, color matrix. Null transform is the identity.
     */
    protected _transform: Transform;

    /**
     * This nodes stack level.
     */
    public depth: number;

    protected _eventListeners: {
      type: NodeEventType;
      listener: (node: Node, type?: NodeEventType) => void;
    } [] = null;

    protected _dispatchEvent(type: NodeEventType) {
      if (!this._eventListeners) {
        return;
      }
      var listeners = this._eventListeners;
      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        if (listener.type === type) {
          listener.listener(this, type);
        }
      }
    }

    /**
     * Adds an event listener.
     */
    public addEventListener(type: NodeEventType, listener: (node: Node, type?: NodeEventType) => void) {
      if (!this._eventListeners) {
        this._eventListeners = [];
      }
      this._eventListeners.push({type: type, listener: listener});
    }

    /**
     * Removes an event listener.
     */
    public removeEventListener(type: NodeEventType, listener: (node: Node, type?: NodeEventType) => void) {
      var listeners = this._eventListeners;
      for (var i = 0; i < listeners.length; i++) {
        var listenerObject = listeners[i];
        if (listenerObject.type === type && listenerObject.listener === listener) {
          listeners.splice(i, 1);
          return;
        }
      }
    }

    /**
     * Property bag used to attach dynamic properties to this object.
     */
    protected _properties: {[name: string]: any};

    public get properties(): {[name: string]: any} {
      return this._properties || (this._properties = {});
    }

    /**
     * Bounds of the scene graph object. Bounds are computed automatically for non-leaf nodes
     * that have the |NodeFlags.BoundsAutoCompute| flag set.
     */
    protected _bounds: Rectangle;

    constructor() {
      this._id = Node._nextId ++;
      this._type = NodeType.Node;
      this._index = -1;
      this._parent = null;
      this.reset();
    }

    /**
     * Resets the Node to its initial state but preserves its identity.
     * It safe to call this on a child without disrupting ownership.
     */
    reset() {
      this._flags = NodeFlags.Default;
      this._bounds = null;
      this._layer = null;
      this._transform = null;
      this._properties = null;
      this.depth = -1;
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

    public getTransformedBounds(target: Node): Rectangle {
      var bounds = this.getBounds(true);
      if (target === this || bounds.isEmpty()) {
        // Nop.
      } else {
        var m = this.getTransform().getConcatenatedMatrix();
        if (target) {
          var t = target.getTransform().getInvertedConcatenatedMatrix(true);
          t.preMultiply(m);
          t.transformRectangleAABB(bounds);
          t.free();
        } else {
          m.transformRectangleAABB(bounds);
        }
      }
      return bounds;
    }

    _markCurrentBoundsAsDirtyRegion() {
      // return;
      var stage = this.getStage();
      if (!stage) {
        return;
      }
      var bounds = this.getTransformedBounds(stage);
      stage.dirtyRegion.addDirtyRectangle(bounds);
    }

    public getStage(withDirtyRegion: boolean = true): Stage {
      var node = this._parent;
      while (node) {
        if (node.isType(NodeType.Stage)) {
          var stage = <Stage>node;
          if (withDirtyRegion) {
            if (stage.dirtyRegion) {
              return stage;
            }
          } else {
            return stage;
          }
        }
        node = node._parent;
      }
      return null;
    }

    /**
     * This shouldn't be used on any hot path becuse it allocates.
     */
    public getChildren(clone: boolean = false): Node [] {
      throw Shumway.Debug.abstractMethod("Node::getChildren");
    }

    public getBounds(clone: boolean = false): Rectangle {
      throw Shumway.Debug.abstractMethod("Node::getBounds");
    }

    /**
     * Can only be set on nodes without the |NodeFlags.BoundsAutoCompute| flag set.
     */
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

    public hasAnyFlags(flags: NodeFlags): boolean {
      return !!(this._flags & flags);
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
      if (flags === NodeFlags.None || this.hasFlags(flags)) {
        return;
      }
      if (!this.hasFlags(NodeFlags.BoundsAutoCompute)) {
        flags &= ~NodeFlags.InvalidBounds;
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

    /**
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

    /**
     * Type check.
     */
    public isType(type: NodeType): boolean {
      return this._type === type;
    }

    /**
     * Subtype check.
     */
    public isTypeOf(type: NodeType): boolean {
      return (this._type & type) === type;
    }

    public isLeaf(): boolean {
      return this.isType(NodeType.Renderable) || this.isType(NodeType.Shape);
    }

    public isLinear(): boolean {
      if (this.isLeaf()) {
        return true;
      }
      if (this.isType(NodeType.Group)) {
        var children = (<any>this)._children;
        if (children.length === 1 && children[0].isLinear()) {
          return true;
        }
      }
      return false;
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
    
    public getLayerBounds(includeFilters: boolean): Rectangle {
      var bounds = this.getBounds();
      if (includeFilters && this._layer) {
        this._layer.expandBounds(bounds);
      }
      return bounds;
    }

//    public getConcatenatedMatrix(clone: boolean = false): Matrix {
//      var transform: Transform = this.getTransform(false);
//      if (transform) {
//        return transform.getConcatenatedMatrix(clone);
//      }
//      return Matrix.createIdentity();
//    }

    /**
     * Dispatch on node types.
     */
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
        case NodeType.Renderable:
          visitor.visitRenderable(<Renderable>this, state);
          break;
        default:
          Debug.unexpectedCase();
      }
    }

    public invalidate() {
      this._markCurrentBoundsAsDirtyRegion();
      this._propagateFlagsUp(NodeFlags.UpOnInvalidate);
    }

    public toString(bounds: boolean = false): string {
      var s = getNodeTypeName(this._type) + " " + this._id;
      if (bounds) {
        s += " " + this._bounds.toString();
      }
      return s;
    }
  }

  /**
   * Nodes that contain other nodes.
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

    public childAt(index: number): Node {
      release || assert(index >= 0 && index < this._children.length);
      return this._children[index];
    }

    public get child(): Node {
      release || assert(this._children.length === 1);
      return this._children[0];
    }

    public get groupChild(): Group {
      release || assert(this._children.length === 1);
      release || assert(this._children[0] instanceof Group);
      return <Group>this._children[0];
    }

    /**
     * Adds a node and remove's it from its previous location if it has a parent and propagates
     * flags accordingly.
     */
    public addChild(node: Node) {
      release || assert(node);
      release || assert(!node.isAncestor(this));
      if (node._parent) {
        node._parent.removeChildAt(node._index);
      }
      node._parent = this;
      node._index = this._children.length;
      this._children.push(node);
      this._propagateFlagsUp(NodeFlags.UpOnAddedOrRemoved);
      node._propagateFlagsDown(NodeFlags.DownOnAddedOrRemoved);
      node._markCurrentBoundsAsDirtyRegion();
    }

    /**
     * Removes a child at the given index and propagates flags accordingly.
     */
    public removeChildAt(index: number) {
      release || assert(index >= 0 && index < this._children.length);
      var node = this._children[index];
      release || assert(index === node._index);
      node._markCurrentBoundsAsDirtyRegion();
      this._children.splice(index, 1);
      node._index = -1;
      node._parent = null;
      this._propagateFlagsUp(NodeFlags.UpOnAddedOrRemoved);
      node._propagateFlagsDown(NodeFlags.DownOnAddedOrRemoved);
    }

    public clearChildren() {
      for (var i = 0; i < this._children.length; i++) {
        var child = this._children[i];
        child._markCurrentBoundsAsDirtyRegion();
        if (child) {
          child._index = -1;
          child._parent = null;
          child._propagateFlagsDown(NodeFlags.DownOnAddedOrRemoved);
        }
      }
      this._children.length = 0;
      this._propagateFlagsUp(NodeFlags.UpOnAddedOrRemoved);
    }

    /**
     * Override and propagate flags to all children.
     */
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

    /**
     * Takes the union of all child bounds and caches the bounds locally.
     */
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
    
    /**
     * Takes the union of all child bounds, optionaly including filter expansions.
     */
    public getLayerBounds(includeFilters: boolean): Rectangle {
      if (!includeFilters) {
        return this.getBounds();
      }
      var bounds = Rectangle.createEmpty();
      var children = this._children;
      var childBounds = Rectangle.allocate();
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        childBounds.set(child.getLayerBounds(includeFilters));
        child.getTransformMatrix().transformRectangleAABB(childBounds);
        bounds.union(childBounds);
      }
      childBounds.free();
      if (includeFilters && this._layer) {
        this._layer.expandBounds(bounds);
      }
      return bounds;
    }
  }

  /**
   * Transform associated with a node. This helps to reduce the size of nodes.
   */
  export class Transform {

    /**
     * Node that this transform belongs to.
     */
    protected _node: Node;

    /**
     * Transform matrix.
     */
    protected _matrix: Matrix;

    /**
     * Transform color matrix.
     */
    protected _colorMatrix: ColorMatrix;

    /**
     * Concatenated matrix. This is not frequently used.
     */
    protected _concatenatedMatrix: Matrix;

    /**
     * Inverted concatenated matrix. This is not frequently used.
     */
    protected _invertedConcatenatedMatrix: Matrix;

    /**
     * Concatenated color matrix. This is not frequently used.
     */
    protected _concatenatedColorMatrix: ColorMatrix;

    constructor(node: Node) {
      this._node = node;
      this._matrix = Matrix.createIdentity(); // MEMORY: Lazify construction.
      this._colorMatrix = ColorMatrix.createIdentity(); // MEMORY: Lazify construction.
      this._concatenatedMatrix = Matrix.createIdentity(); // MEMORY: Lazify construction.
      this._invertedConcatenatedMatrix = Matrix.createIdentity(); // MEMORY: Lazify construction.
      this._concatenatedColorMatrix = ColorMatrix.createIdentity(); // MEMORY: Lazify construction.
    }

//    public get x(): number {
//      return this._matrix.tx;
//    }
//
//    public set x(value: number) {
//      this._matrix.tx = value;
//      this._node._propagateFlagsUp(NodeFlags.UpOnMoved);
//      this._node._propagateFlagsDown(NodeFlags.DownOnMoved);
//    }
//
//    public get y(): number {
//      return this._matrix.ty;
//    }
//
//    public set y(value: number) {
//      this._matrix.ty = value;
//      this._node._propagateFlagsUp(NodeFlags.UpOnMoved);
//      this._node._propagateFlagsDown(NodeFlags.DownOnMoved);
//    }

    /**
     * Set a node's transform matrix. You should never mutate the matrix object directly.
     */
    public setMatrix(value: Matrix) {
      if (this._matrix.isEqual(value)) {
        return;
      }
      this._node._markCurrentBoundsAsDirtyRegion();
      this._matrix.set(value);
      this._node._propagateFlagsUp(NodeFlags.UpOnMoved);
      this._node._propagateFlagsDown(NodeFlags.DownOnMoved);
      this._node._markCurrentBoundsAsDirtyRegion();
    }

    public setColorMatrix(value: ColorMatrix) {
      this._colorMatrix.set(value);
      this._node._propagateFlagsUp(NodeFlags.UpOnColorMatrixChanged);
      this._node._propagateFlagsDown(NodeFlags.DownOnColorMatrixChanged);
      this._node._markCurrentBoundsAsDirtyRegion();
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

    /**
     * Compute the concatenated transforms for this node and all of its ancestors since we're already doing
     * all the work.
     */
    public getConcatenatedMatrix(clone: boolean = false): Matrix {
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

    public getInvertedConcatenatedMatrix(clone: boolean = false): Matrix {
      if (this._node.hasFlags(NodeFlags.InvalidInvertedConcatenatedMatrix)) {
        this.getConcatenatedMatrix().inverse(this._invertedConcatenatedMatrix);
        this._node.removeFlags(NodeFlags.InvalidInvertedConcatenatedMatrix);
      }
      if (clone) {
        return this._invertedConcatenatedMatrix.clone();
      }
      return this._invertedConcatenatedMatrix;
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

  /**
   * Layer information associated with a node. This helps to reduce the size of nodes.
   */
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
      if (value.length) {
        // TODO: We could avoid invalidating the node if the new filter list contains equal filter objects.
        this._node.invalidate();
      }
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
      if (this._mask !== value) {
        this._node.invalidate();
        if (this._mask) {
          this._mask.removeFlags(NodeFlags.IsMask);
        }
      }
      this._mask = value;
      if (this._mask) {
        this._mask.setFlags(NodeFlags.IsMask);
      }
      // TODO: Keep track of masked object so we can propagate flags up.
    }

    public toString() {
      return BlendMode[this._blendMode];
    }
    
    public expandBounds(bounds: Rectangle) {
      var filters = this._filters;
      if (filters) {
        for (var i = 0; i < filters.length; i++) {
          filters[i].expandBounds(bounds);
        }
      }
    }
  }

  /**
   * Shapes are instantiations of Renderables.
   */
  export class Shape extends Node {
    private _source: Renderable;
    private _ratio: number;

    constructor(source: Renderable) {
      super();
      release || assert(source);
      this._source = source;
      this._type = NodeType.Shape;
      this._ratio = 0;
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

    get ratio(): number {
      return this._ratio;
    }

    set ratio(value: number) {
      if (value === this._ratio) {
        return;
      }
      this.invalidate();
      this._ratio = value;
    }

    _propagateFlagsDown(flags: NodeFlags) {
      this.setFlags(flags);
    }

    public getChildren(clone: boolean = false): Node[] {
      return [this._source];
    }
  }


  import StageAlignFlags = Shumway.Remoting.StageAlignFlags;
  import StageScaleMode = Shumway.Remoting.StageScaleMode;

  function getRandomIntInclusive(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  export class RendererOptions {
    debug: boolean = false;
    paintRenderable: boolean = true;
    paintBounds: boolean = false;
    paintDirtyRegion: boolean = false;
    paintFlashing: boolean = false;
    paintViewport: boolean = false;
    clear: boolean = true;
  }

  export const enum Backend {
    Canvas2D = 0,
    WebGL = 1, // Soon
    Both = 2,
    DOM = 3, // Someday
    SVG = 4 // Someday
  }

  /**
   * Base class for all renderers.
   */
  export class Renderer extends NodeVisitor {
    /**
     * Everything is clipped by the viewport.
     */
    protected _viewport: Rectangle;

    protected _options: RendererOptions;

    /**
     * We can render either into a canvas element or into a div element.
     */
    protected _container: HTMLDivElement | HTMLCanvasElement;

    protected _stage: Stage;

    protected _devicePixelRatio: number;

    constructor(container: HTMLDivElement | HTMLCanvasElement, stage: Stage, options: RendererOptions) {
      super();
      this._container = container;
      this._stage = stage;
      this._options = options;
      this._viewport = Rectangle.createSquare(1024);
      this._devicePixelRatio = 1;
    }

    set viewport (viewport: Rectangle) {
      this._viewport.set(viewport);
    }

    public render() {
      throw Shumway.Debug.abstractMethod("Renderer::render");
    }

    /**
     * Notify renderer that the viewport has changed.
     */
    public resize() {
      throw Shumway.Debug.abstractMethod("Renderer::resize");
    }

    /**
     * Captures a rectangular region of the easel as a dataURL as specified by |bounds|. |stageContent| indicates if the bounds
     * should be computed by looking at the bounds of the content of the easel rather than the easel itself.
     */
    public screenShot(bounds: Rectangle, stageContent: boolean, disableHidpi: boolean): ScreenShot {
      throw Shumway.Debug.abstractMethod("Renderer::screenShot");
    }
  }

  /**
   * Node container that handles Flash style alignment and scale modes.
   */
  export class Stage extends Group {
    /**
     * This is supposed to keep track of dirty regions.
     */
    private _dirtyRegion: DirtyRegion;

    public get dirtyRegion(): DirtyRegion {
      return this._dirtyRegion;
    }

    private _align: StageAlignFlags;
    private _scaleMode: StageScaleMode;

    /**
     * All stage content is added to his child node. This is so what we can set the align and scale
     * transform to all stage descendants but not affect the stage itself.
     */
    private _content: Group;

    public color: Color;

    // Using these constants initially -- they don't require knowing bounds.
    // Notice that this default values are different from ActionScript object values.
    private static DEFAULT_SCALE = StageScaleMode.NoScale;
    private static DEFAULT_ALIGN = StageAlignFlags.Left | StageAlignFlags.Top;

    private _preVisitor: PreRenderVisitor = new PreRenderVisitor();

    constructor(w: number, h: number, trackDirtyRegion: boolean = false) {
      super();
      this._flags &= ~NodeFlags.BoundsAutoCompute;
      this._type = NodeType.Stage;
      this._scaleMode = Stage.DEFAULT_SCALE;
      this._align = Stage.DEFAULT_ALIGN;
      this._content = new Group();
      this._content._flags &= ~NodeFlags.BoundsAutoCompute;
      this.addChild(this._content);
      this.setFlags(NodeFlags.Dirty);
      this.setBounds(new Rectangle(0, 0, w, h));
      if (trackDirtyRegion) {
        this._dirtyRegion = new DirtyRegion(w, h);
        this._dirtyRegion.addDirtyRectangle(new Rectangle(0, 0, w, h));
      } else {
        this._dirtyRegion = null;
      }
      this._updateContentMatrix();
    }

    public setBounds(value: Rectangle) {
      super.setBounds(value);
      this._updateContentMatrix();
      this._dispatchEvent(NodeEventType.OnStageBoundsChanged);
      if (this._dirtyRegion) {
        this._dirtyRegion = new DirtyRegion(value.w, value.h);
        this._dirtyRegion.addDirtyRectangle(value);
      }
    }

    public get content(): Group {
      return this._content;
    }

    /**
     * Checks to see if we should render and if so, clears any relevant dirty flags. Returns
     * true if rendering should commence. Flag clearing is made optional here in case there
     * is any code that needs to check if rendering is about to happen.
     */
    readyToRender(): boolean {
      this._preVisitor.isDirty = false;
      this._preVisitor.start(this, this._dirtyRegion);
      if (this._preVisitor.isDirty) {
        return true;
      }
      return false;
    }

    public get align(): StageAlignFlags {
      return this._align;
    }

    public set align(value: StageAlignFlags) {
      this._align = value;
      this._updateContentMatrix();
    }

    public get scaleMode(): StageScaleMode {
      return this._scaleMode;
    }

    public set scaleMode(value: StageScaleMode) {
      this._scaleMode = value;
      this._updateContentMatrix();
    }

    /**
     * Figure out what the content transform shuold be given the current align and scale modes.
     */
    private _updateContentMatrix() {
      if (this._scaleMode === Stage.DEFAULT_SCALE && this._align === Stage.DEFAULT_ALIGN) {
        // Shortcut and also guard to avoid using targetWidth/targetHeight.
        // ThetargetWidth/targetHeight normally set in setScaleAndAlign call.
        this._content.getTransform().setMatrix(new Matrix(1, 0, 0, 1, 0, 0));
        return;
      }

      var bounds = this.getBounds();
      var contentBounds = this._content.getBounds();

      // Debug.assert(this.targetWidth > 0 && this.targetHeight > 0);
      var wScale = bounds.w / contentBounds.w;
      var hScale = bounds.h / contentBounds.h;
      var scaleX, scaleY;
      switch (this._scaleMode) {
        case StageScaleMode.NoBorder:
          scaleX = scaleY = Math.max(wScale, hScale);
          break;
        case StageScaleMode.NoScale:
          scaleX = scaleY = 1;
          break;
        case StageScaleMode.ExactFit:
          scaleX = wScale;
          scaleY = hScale;
          break;
        // case StageScaleMode.ShowAll:
        default:
          scaleX = scaleY = Math.min(wScale, hScale);
          break;
      }

      var offsetX;
      if ((this._align & StageAlignFlags.Left)) {
        offsetX = 0;
      } else if ((this._align & StageAlignFlags.Right)) {
        offsetX = bounds.w - contentBounds.w * scaleX;
      } else {
        offsetX = (bounds.w - contentBounds.w * scaleX) / 2;
      }

      var offsetY;
      if ((this._align & StageAlignFlags.Top)) {
        offsetY = 0;
      } else if ((this._align & StageAlignFlags.Bottom)) {
        offsetY = bounds.h - contentBounds.h * scaleY;
      } else {
        offsetY = (bounds.h - contentBounds.h * scaleY) / 2;
      }

      this._content.getTransform().setMatrix(new Matrix(scaleX, 0, 0, scaleY, offsetX, offsetY));
    }
  }
}
