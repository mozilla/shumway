/**
 * Copyright 2013 Mozilla Foundation
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
// Class: DisplayObject
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import throwError = Shumway.AVM2.Runtime.throwError;

  import BlendMode = flash.display.BlendMode;
  import ColorTransform = flash.geom.ColorTransform;
  import Matrix = flash.geom.Matrix;
  import Point = flash.geom.Point;
  import Rectangle = flash.geom.Rectangle;

  /*
   * Invalid Bits:
   *
   * Invalid bits are used to mark path dependent properties of display objects as stale. To compute these properties we either have to
   * walk the tree all the way the root, or visit all children.
   *
   *       +---+
   *       | A |
   *       +---+
   *       /   \
   *   +---+   +---+
   *   | B |   | C |
   *   +---+   +---+
   *           /   \
   *       +---+   +---+
   *       | D |   | E |
   *       +---+   +---+
   *
   * We use a combination of eager invalid bit propagation and lazy property evaluation. If a node becomes invalid because one of its
   * local properties has changed, we mark all of its valid descendents as invalid. When computing dependent properties, we walk up
   * the tree until we find a valid node and propagate the computation lazily downwards, marking all the nodes along the path as
   * valid.
   *
   * Suppose we mark A as invalid, this causes nodes B, C, D, and E to become invalid. We then compute a path dependent property
   * on E, causing A, and C to become valid. If we mark A as invalid again, A and C become invalid again. We don't need to mark
   * parts of the tree that are already invalid.
   */
  export enum DisplayObjectFlags {
    None                                      = 0x0000,

    /**
     * Display object is visible.
     */
    Visible                                   = 0x0001,


    InvalidBounds                             = 0x0004,
    InvalidTransform                          = 0x0008,
    InvalidConcatenatedTransform              = 0x0010,

    // ...

    Constructed                               = 0x0080,
    Destroyed                                 = 0x0100,

    /**
     * Display object is owned by the timeline, meaning that it is under the control of the timeline and that a reference
     * to this object has not leaked into AS3 code via the DisplayObjectContainer methods |getChildAt|,  |getChildByName|
     * or through the execution of the symbol class constructor.
     */
    OwnedByTimeline                           = 0x0200,

    /**
     * Display object is animated by the timeline. It may no longer be owned by the timeline (|OwnedByTimeline|) but it
     * is still animated by it. If AS3 code mutates any property on the display object, this flag is cleared and further
     * timeline mutations are ignored.
     */
    AnimatedByTimeline                        = 0x0400,

    /**
     * Tobias: Should this really be just true of if any of the other invalid bits are on?
     */
    Invalid                                   = 0x0800,

    /**
     * Indicates whether this display object should be cached as a bitmap. The display object
     * may be cached as bitmap even if this flag is not set, depending on whether any filters
     * are applied or if the bitmap is too large or we've run out of memory.
     */
    CacheAsBitmap                             = 0x1000
  }

  export class DisplayObject extends flash.events.EventDispatcher implements IBitmapDrawable {

    private static _instances: DisplayObject [];

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      DisplayObject._instances = [];
    };

    /**
     * All display objects in the world need to be notified of certain events, here we keep track
     * of all the display objects that were ever constructed.
     */
    static register(object: DisplayObject) {
      DisplayObject._instances.push(object);
    }

    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: DisplayObject) {
      var self: DisplayObject = this;

      DisplayObject.register(self);

      self._flags = DisplayObjectFlags.None;
      self._root = null;
      self._stage = null;
      self._name = 'instance' + DisplayObject._instances.length;
      self._parent = null;
      self._mask = null;
      self._z = 0;
      self._scaleX = 1;
      self._scaleY = 1;
      self._scaleZ = 1;
      self._mouseX = 0;
      self._mouseY = 0;
      self._rotation = 0;
      self._rotationX = 0;
      self._rotationY = 0;
      self._rotationZ = 0;
      self._alpha = 1;
      self._width = 0;
      self._height = 0;
      self._opaqueBackground = null;
      self._scrollRect = null;
      self._filters = [];
      self._blendMode = BlendMode.NORMAL;
      self._scale9Grid = null;
      self._loaderInfo = null;
      self._accessibilityProperties = null;

      self._bounds = null;
      self._clipDepth = 0;
      self._concatenatedTransform = new Matrix();
      self._currentTransform = new Matrix();
      self._current3dTransform = null;
      self._colorTransform = new ColorTransform();
      self._depth = 0;
      self._graphics = null;
      self._hitTarget = null;
      self._index = -1;
      self._level = -1;
      self._maskedObject = null;
      self._rotationCos = 0;
      self._rotationSin = 0;

      // TODO get this via loaderInfo
      self._loader = null;

      self._removeFlags (
        DisplayObjectFlags.AnimatedByTimeline    |
        DisplayObjectFlags.InvalidBounds         |
        DisplayObjectFlags.Constructed           |
        DisplayObjectFlags.Destroyed             |
        DisplayObjectFlags.Invalid               |
        DisplayObjectFlags.OwnedByTimeline       |
        DisplayObjectFlags.InvalidTransform
      );

      // TODO move to InteractiveObject
      self._mouseOver = false;

      // TODO move to DisplayObjectContainer
      self._children = [];
      self._isContainer = false;
      self._mouseChildren = true;

      if (symbol) {
        self._root        = symbol.root       || self._root;
        self._stage       = symbol.stage      || self._stage;
        self._name        = symbol.name       || self._stage;
        self._parent      = symbol.parent     || self._parent;
        self._clipDepth   = symbol.clipDepth  || self._clipDepth;

        if (symbol.blendMode) {
          self._blendMode = BlendMode.fromNumber(symbol.blendMode);
        }

        if (symbol.scale9Grid) {
          var scale9Grid = symbol.scale9Grid;
          this._scale9Grid = new Rectangle(
            scale9Grid.left,
            scale9Grid.top,
            scale9Grid.right - scale9Grid.left,
            scale9Grid.bottom - scale9Grid.top
          );
        }

        if (symbol._hasFlags(DisplayObjectFlags.AnimatedByTimeline)) {
          self._setFlags(DisplayObjectFlags.AnimatedByTimeline);
        }

        if (symbol.bbox) {
          var bbox = symbol.bbox;
          self._bounds.setTo (
            bbox.xMin,
            bbox.yMin,
            bbox.xMax - bbox.xMin,
            bbox.yMax - bbox.yMin
          );
        }

        if (symbol.currentTransform) {
          this._setTransformMatrix(symbol.currentTransform);
        }

        if (symbol.cxform) {
          this._setColorTransform(symbol.cxform);
        }

        self._depth = symbol.depth || self._depth;
        self._index = isNaN(symbol.index) ? self._index : symbol.index;
        self._level = isNaN(symbol.level) ? self._level : symbol.level;
        self._loader = symbol.loader || self._loader;

        if (symbol._hasFlags(DisplayObjectFlags.OwnedByTimeline)) {
          self._setFlags(DisplayObjectFlags.OwnedByTimeline);
        }
      }
    };
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["hitTestObject", "hitTestPoint"];
    
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.display.DisplayObject");
    }

    _setFlags(flags: DisplayObjectFlags) {
      this._flags |= flags;
    }

    _toggleFlags(flags: DisplayObjectFlags, on: boolean) {
      if (on) {
        this._flags |= flags;
      } else {
        this._flags &= ~flags;
      }
    }

    _removeFlags(flags: DisplayObjectFlags) {
      this._flags &= ~flags;
    }

    _hasFlags(flags: DisplayObjectFlags): boolean {
      return (this._flags & flags) === flags;
    }

    _hasAnyFlags(flags: DisplayObjectFlags): boolean {
      return !!(this._flags & flags);
    }

    // JS -> AS Bindings
    
    hitTestObject: (obj: flash.display.DisplayObject) => boolean;
    hitTestPoint: (x: number, y: number, shapeFlag: boolean = false) => boolean;
    
    // AS -> JS Bindings

    private _flags: number;

    _root: flash.display.DisplayObject;
    _stage: flash.display.Stage;
    _name: string;
    _parent: flash.display.DisplayObjectContainer;
    _mask: flash.display.DisplayObject;
    _z: number;
    _scaleX: number;
    _scaleY: number;
    _scaleZ: number;
    _mouseX: number;
    _mouseY: number;
    _rotation: number;
    _rotationX: number;
    _rotationY: number;
    _rotationZ: number;
    _alpha: number;
    _width: number;
    _height: number;
    _opaqueBackground: ASObject;
    _scrollRect: flash.geom.Rectangle;
    _filters: any [];
    _blendMode: string;
    _scale9Grid: flash.geom.Rectangle;
    _loaderInfo: flash.display.LoaderInfo;
    _accessibilityProperties: flash.accessibility.AccessibilityProperties;

    _bounds: flash.geom.Rectangle;
    _children: flash.display.DisplayObject [];
    _clipDepth: number;
    _currentTransform: flash.geom.Matrix;
    _concatenatedTransform: flash.geom.Matrix;
    _current3dTransform: flash.geom.Matrix3D;
    _colorTransform: flash.geom.ColorTransform;
    _depth: number;
    _graphics: flash.display.Graphics;
    _hitTarget: flash.display.DisplayObject;
    _index: number;
    _isContainer: boolean;
    _level: number;
    _loader: flash.display.Loader;
    _maskedObject: flash.display.DisplayObject;
    _mouseChildren: boolean;
    _mouseDown: boolean;
    _mouseOver: boolean;
    _rotationCos: number;
    _rotationSin: number;
    _zindex: number;

    private _setTransformMatrix(matrix: Matrix, toTwips: boolean = false): void {
      var m = this._currentTransform;
      m.copyFrom(matrix);
      if (toTwips) {
        m.toTwips();
      }
      var angleInRadians = matrix.getRotation();
      this._rotation = angleInRadians * 180 / Math.PI;
      this._rotationCos = Math.cos(angleInRadians);
      this._rotationSin = Math.sin(angleInRadians);
      this._scaleX = m.getScaleX();
      this._scaleY = m.getScaleY();
      this._invalidate();
      this._invalidateTransform();
    }

    /**
     * Finds the furthest ancestor with a given set of flags.
     */
    private _findFurthestAncestor(flags: DisplayObjectFlags, on: boolean): DisplayObject {
      var node = this;
      var last = this._stage;
      var oldest = null;
      while (node) {
        if (node._hasFlags(flags) === on) {
          oldest = node;
        }
        if (node === last) {
          break;
        }
        node = node._parent;
      }
      return oldest;
    }

    /**
     * Finds the closest ancestor with a given set of flags that are either turned on or off.
     */
    private _findClosestAncestor(flags: DisplayObjectFlags, on: boolean): DisplayObject {
      var node = this;
      var last = this._stage;
      while (node) {
        if (node._hasFlags(flags) === on) {
          return node;
        }
        if (node === last) {
          return null;
        }
        node = node._parent;
      }
      return null;
    }

    /**
     * Tests if the given display object is an ancestor of this display object.
     */
    private _isAncestor(ancestor: DisplayObject): boolean {
      var node = this;
      while (node) {
        if (node === ancestor) {
          return true;
        }
        node = node._parent;
      }
      return false;
    }

    /**
     * Used as a temporary array to avoid allocations.
     */
    private static _path: DisplayObject[] = [];

    /**
     * Return's a list of ancestors excluding the |last|, the return list is reused.
     */
    private static _getAncestors(node: DisplayObject, last: DisplayObject = null) {
      var path = DisplayObject._path;
      path.length = 0;
      while (node && node === last) {
        path.push(this);
        node = node._parent;
      }
      assert (node === last, "Last ancestor is not an ancestor.");
      return path;
    }

    private _getConcatenatedTransformWIP(targetCoordinateSpace: DisplayObject): Matrix {
      // If we're the stage or the |targetCoordinateSpace| is our parent then return
      // the current transform.

      // Tobias: It's not immediately obvious that the current transform should be returned if we're the stage.
      if (this === this._stage || targetCoordinateSpace === this._parent) {
        return this._currentTransform;
      }

      // Compute the concatenated transforms for this node and all of its ancestors.
      if (this._hasFlags(DisplayObjectFlags.InvalidConcatenatedTransform)) {
        // Start from the closest ancestor that has a valid concatenated transform.
        var node = this;
        var ancestor = this._findClosestAncestor(DisplayObjectFlags.InvalidConcatenatedTransform, false);
        if (ancestor) {
          // There are no ancestors that have a valid transform ..
          notImplemented();
        }
        var path = DisplayObject._getAncestors(this, ancestor);
        var m = ancestor._concatenatedTransform.clone();
        for (var i = path.length - 1; i >= 0; i--) {
          var ancestor = path[i];
          assert (ancestor._hasFlags(DisplayObjectFlags.InvalidConcatenatedTransform));
          m.concat(ancestor._currentTransform);
          ancestor._concatenatedTransform.copyFrom(m);
          ancestor._removeFlags(DisplayObjectFlags.InvalidConcatenatedTransform);
        }
      }

      assert (!this._hasFlags(DisplayObjectFlags.InvalidConcatenatedTransform));
      if (!targetCoordinateSpace) {
        return this._concatenatedTransform;
      }

      notImplemented("WIP ...");
      var inverse = targetCoordinateSpace._getConcatenatedTransform(null).clone();
      inverse.invert();

    }

    private _getConcatenatedTransform(targetCoordinateSpace: DisplayObject): Matrix {
      var stage = this._stage;

      if (this === stage || targetCoordinateSpace === this._parent) {
        return this._currentTransform;
      }

      var invalidNode = null;
      var m1, m2;
      var currentNode = this;
      while (currentNode !== stage) {
        if (currentNode._hasFlags(DisplayObjectFlags.InvalidTransform)) {
          invalidNode = currentNode;
        }
        if (currentNode === targetCoordinateSpace) {
          m2 = currentNode._concatenatedTransform.clone();
        }
        currentNode = currentNode._parent;
      }

      if (invalidNode) {
        if (this._parent === stage) {
          m1 = this._concatenatedTransform;
          m1.copyFrom(this._currentTransform);
        } else {
          var stack = [];
          var currentNode = this;
          while (currentNode !== invalidNode) {
            stack.push(currentNode);
            currentNode = currentNode._parent;
          }

          var node = invalidNode;
          do {
            m1 = node._concatenatedTransform;
            if (node._parent) {
              if (node._parent !== stage) {
                m1.copyFrom(node._parent._concatenatedTransform);
                m1.concat(node._currentTransform);
              }
            } else {
              m1.copyFrom(node._currentTransform);
            }
            node._removeFlags(DisplayObjectFlags.InvalidTransform);

            var nextNode = stack.pop();
            var children = node._children;
            for (var i = 0; i < children.length; i++) {
              var child = children[i];
              if (child !== nextNode) {
                child._setFlags(DisplayObjectFlags.InvalidTransform);
              }
            }
            node = nextNode;
          } while (node);
        }
      } else {
        m1 = this._concatenatedTransform;
      }

      if (targetCoordinateSpace && targetCoordinateSpace !== stage) {
        if (!m2) {
          m2 = targetCoordinateSpace._getConcatenatedTransform(null).clone();
        }
        m2.invert();
        m2.concat(m1);
        return m2;
      }

      return m1;
    }

    private _setColorTransform(colorTransform: flash.geom.ColorTransform) {
      this._colorTransform.copyFrom(colorTransform);
      this._invalidate();
    }

    private _getContentBounds(includeStrokes: boolean = true): Rectangle {
      var bounds = this._bounds;
      if (this._hasFlags(DisplayObjectFlags.InvalidBounds)) {
        bounds.setEmpty();
        if (this._graphics) {
          bounds.unionWith(this._graphics._getBounds(includeStrokes));
        }
        var children = this._children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          bounds.unionWith(child.getBounds(this));
        }
        this._removeFlags(DisplayObjectFlags.InvalidBounds);
      }
      return bounds;
    }

    private _getTransformedBounds(targetCoordinateSpace: DisplayObject, includeStroke: boolean = true, toPixels: boolean = false) {
      var bounds = this._getContentBounds(includeStroke);
      if (!targetCoordinateSpace || targetCoordinateSpace === this || bounds.isEmpty()) {
        return bounds.clone();
      }
      bounds = bounds.clone();
      var m = this._getConcatenatedTransform(targetCoordinateSpace);
      m.transformRectAABB(bounds);
      if (toPixels) {
        bounds.toPixels();
      }
      return bounds;
    }

    private destroy(): void {
      this._setFlags(DisplayObjectFlags.Destroyed);
    }

    _invalidate(flags: DisplayObjectFlags): void {
      // Invalidate what ?
      notImplemented("public flash.display.DisplayObject::_invalidate"); return;
    }

    _invalidateBounds(): void {
      var currentNode = this;
      while (currentNode && !currentNode._hasFlags(DisplayObjectFlags.InvalidBounds)) {
        currentNode._setFlags(DisplayObjectFlags.InvalidBounds);
        currentNode = currentNode._parent;
      }
    }

    _invalidateTransform(): void {
      this._setFlags(DisplayObjectFlags.InvalidTransform);
      if (this._parent) {
        this._parent._invalidateBounds();
      }
    }

    get root(): flash.display.DisplayObject {
      return this._root;
    }

    get stage(): flash.display.Stage {
      return this._stage;
    }
    get name(): string {
      return this._name;
    }
    set name(value: string) {
      this._name = "" + value;
    }
    get parent(): flash.display.DisplayObjectContainer {
      return this._parent;
    }
    get mask(): flash.display.DisplayObject {
      return this._mask;
    }
    set mask(value: flash.display.DisplayObject) {
      //value = value;

      if (this._mask === value || value === this) {
        return;
      }

      if (value && value._maskedObject) {
        value._maskedObject.mask = null;
      }
      this._mask = value;
      if (value) {
        value._maskedObject = this;
      }
      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
      this._invalidate();
    }
    get visible(): boolean {
      return this._hasFlags(DisplayObjectFlags.Visible);
    }
    set visible(value: boolean) {
      value = !!value;

      if (value === this._hasFlags(DisplayObjectFlags.Visible)) {
        return;
      }

      this._setFlags(DisplayObjectFlags.Visible | DisplayObjectFlags.Invalid);
      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
    }

    get x(): number {
      return this._currentTransform.tx / 20;
    }

    set x(value: number) {
      value = (value * 20) | 0;

      if (value === this._currentTransform.tx) {
        return;
      }

      this._currentTransform.tx = value;
      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
      this._invalidate();
      this._invalidateTransform();
    }
    get y(): number {
      return this._currentTransform.ty / 20;
    }
    set y(value: number) {
      value = (value * 20) | 0;

      if (value === this._currentTransform.ty) {
        return;
      }

      this._currentTransform.ty = value;
      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
      this._invalidate();
      this._invalidateTransform();
    }
    get z(): number {
      return this._z;
    }
    set z(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set z"); return;
      // this._z = value;
    }
    get scaleX(): number {
      return this._scaleX;
    }
    set scaleX(value: number) {
      value = +value;

      if (value === this._scaleX) {
        return;
      }

      var m = currentTransform;
      m.a = this._rotationCos * value;
      m.b = this._rotationSin * value;

      this._scaleX = value;
      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
      this._invalidate();
      this._invalidateTransform();
    }
    get scaleY(): number {
      return this._scaleY;
    }
    set scaleY(value: number) {
      value = +value;

      if (value === this._scaleY) {
        return;
      }

      var m = this._currentTransform;
      m.c = -this._rotationSin * value;
      m.d = this._rotationCos * value;

      this._scaleY = value;
      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
      this._invalidate();
      this._invalidateTransform();
    }
    get scaleZ(): number {
      return this._scaleZ;
    }
    set scaleZ(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set scaleZ"); return;
      // this._scaleZ = value;
    }
    get mouseX(): number {
      return this._mouseX / 20;
    }
    get mouseY(): number {
      return this._mouseY / 20;
    }
    get rotation(): number {
      return this._rotation;
    }
    set rotation(value: number) {
      value = +value;

      value %= 360;
      if (value > 180) {
        value -= 360;
      }

      if (value === this._rotation) {
        return;
      }

      var angle = value / 180 * Math.PI;
      var u, v;
      switch (value) {
        case 0:
        case 360:
          u = 1, v = 0;
          break;
        case 90:
        case -270:
          u = 0, v = 1;
          break;
        case 180:
        case -180:
          u = -1, v = 0;
          break;
        case 270:
        case -90:
          u = 0, v = -1;
          break;
        default:
          u = Math.cos(angle);
          v = Math.sin(angle);
          break;
      }

      var m = this._currentTransform;
      m.a = u * this._scaleX;
      m.b = v * this._scaleX;
      m.c = -v * this._scaleY;
      m.d = u * this._scaleY;

      this._rotation = value;
      this._rotationCos = u;
      this._rotationSin = v;
      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
      this._invalidate();
      this._invalidateTransform();
    }
    get rotationX(): number {
      return this._rotationX;
    }
    set rotationX(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotationX"); return;
      // this._rotationX = value;
    }
    get rotationY(): number {
      return this._rotationY;
    }
    set rotationY(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotationY"); return;
      // this._rotationY = value;
    }
    get rotationZ(): number {
      return this._rotationZ;
    }
    set rotationZ(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotationZ"); return;
      // this._rotationZ = value;
    }
    get alpha(): number {
      return this._alpha;
    }
    set alpha(value: number) {
      value = +value;

      if (value === this._alpha) {
        return;
      }

      this._alpha = value;
      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
      this._invalidate();
    }
    get width(): number {
      var bounds = this._getContentBounds();
      var m = this._currentTransform;
      return (Math.abs(m.a) * bounds.width +
              Math.abs(m.c) * bounds.height) / 20;
    }
    set width(value: number) {
      value = +value;

      if (value < 0) {
        return;
      }

      var u = Math.abs(this._rotationCos);
      var v = Math.abs(this._rotationSin);
      var bounds = this._getContentBounds();
      var baseWidth = u * bounds.width + v * bounds.height;

      if (!baseWidth) {
        return;
      }

      var baseHeight = v * bounds.width + u * bounds.height;
      this.scaleY = this.height / baseHeight;
      this.scaleX = ((value * 20) | 0) / baseWidth;
    }
    get height(): number {
      var bounds = this._getContentBounds();
      var m = this._currentTransform;
      return (Math.abs(m.b) * bounds.width +
              Math.abs(m.d) * bounds.height) / 20;
    }
    set height(value: number) {
      value = +value;

      if (value < 0) {
        return;
      }

      var u = Math.abs(this._rotationCos);
      var v = Math.abs(this._rotationSin);
      var bounds = this._getContentBounds();
      var baseHeight = v * bounds.width + u * bounds.height;

      if (!baseHeight) {
        return;
      }

      var baseWidth = u * bounds.width + v * bounds.height;
      this.scaleX = this.width / baseWidth;
      this.scaleY = ((value * 20) | 0) / baseHeight;
    }

    get cacheAsBitmap(): boolean {
      return this._filters.length > 0 || this._hasFlags(DisplayObjectFlags.CacheAsBitmap);
    }

    set cacheAsBitmap(value: boolean) {
      value = !!value;
      if (!this._filters.length) {
        this._toggleFlags(DisplayObjectFlags.CacheAsBitmap, value);
      }
      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
    }

    get opaqueBackground(): Object {
      return this._opaqueBackground;
    }
    set opaqueBackground(value: Object) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set opaqueBackground"); return;
      // this._opaqueBackground = value;
    }
    get scrollRect(): flash.geom.Rectangle {
      return this._scrollRect;
    }
    set scrollRect(value: flash.geom.Rectangle) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set scrollRect"); return;
      // this._scrollRect = value;
    }
    get filters(): any [] {
      return this._filters;
    }
    set filters(value: any []) {
      //value = value;

      this._invalidate();
      this._filters = value;
      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
    }
    get blendMode(): string {
     return this._blendMode;
    }
    set blendMode(value: string) {
      value = "" + value;

      if (this._blendMode === value) {
        return;
      }

      if (BlendMode.isMember(value)) {
        this._blendMode = value;
      } else {
        throwError("ArgumentError", Errors.InvalidEnumError, "blendMode");
      }

      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
      this._invalidate();
    }
    get transform(): flash.geom.Transform {
      return new flash.geom.Transform(this);
    }
    set transform(value: flash.geom.Transform) {
      //value = value;
      if (value.matrix3D) {
        this._current3dTransform = value.matrix3D;
      } else {
        this._setTransformMatrix(transform.matrix, true);
      }
      this._setColorTransform(value.colorTransform);
    }
    get scale9Grid(): flash.geom.Rectangle {
      return this._scale9Grid;
    }
    set scale9Grid(innerRectangle: flash.geom.Rectangle) {
      innerRectangle = innerRectangle;
      notImplemented("public flash.display.DisplayObject::set scale9Grid"); return;
      // this._scale9Grid = innerRectangle;
    }
    get loaderInfo(): flash.display.LoaderInfo {
      return (this._loader && this._loader._contentLoaderInfo) ||
             (this._parent && this._parent.loaderInfo);
    }
    get accessibilityProperties(): flash.accessibility.AccessibilityProperties {
      return this._accessibilityProperties;
    }
    set accessibilityProperties(value: flash.accessibility.AccessibilityProperties) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set accessibilityProperties"); return;
      // this._accessibilityProperties = value;
    }
    set blendShader(value: flash.display.Shader) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set blendShader"); return;
      // this._blendShader = value;
    }
    globalToLocal(point: flash.geom.Point): flash.geom.Point {
      //point = point;
      var m = this._getConcatenatedTransform(null).clone();
      m.invert();
      var p = m.transformCoords(point.x, point.y, true);
      p.toPixels();
      return p;
    }
    localToGlobal(point: flash.geom.Point): flash.geom.Point {
      //point = point;
      var m = this._getConcatenatedTransform(null);
      var p = m.transformCoords(point.x, point.y, true);
      p.toPixels();
      return p;
    }
    getBounds(targetCoordinateSpace: flash.display.DisplayObject): flash.geom.Rectangle {
      //targetCoordinateSpace = targetCoordinateSpace;
      return this._getTransformedBounds(targetCoordinateSpace, true, true);
    }
    getRect(targetCoordinateSpace: flash.display.DisplayObject): flash.geom.Rectangle {
      //targetCoordinateSpace = targetCoordinateSpace;
      return this._getTransformedBounds(targetCoordinateSpace, false, true);
    }
    globalToLocal3D(point: flash.geom.Point): flash.geom.Vector3D {
      point = point;
      notImplemented("public flash.display.DisplayObject::globalToLocal3D"); return;
    }
    local3DToGlobal(point3d: flash.geom.Vector3D): flash.geom.Point {
      point3d = point3d;
      notImplemented("public flash.display.DisplayObject::local3DToGlobal"); return;
    }
    _hitTest(use_xy: boolean, x: number, y: number, useShape: boolean, hitTestObject: flash.display.DisplayObject): boolean {
      use_xy = !!use_xy; x = +x; y = +y; useShape = !!useShape;
      //hitTestObject = hitTestObject;

      if (use_xy) {
        var m = this._getConcatenatedTransform(null).clone();
        m.invert();
        var point = m.transformCoords(x, y);

        var b = this._getContentBounds();
        if (!b.containsPoint(point)) {
          return false;
        }

        if (!useShape || !this._graphics) {
          return true;
        }

        // TODO move into Graphics
        if (this._graphics) {
          var paths = this._graphics._paths;
          for (var i = 0; i < paths.length; i++) {
            var path = paths[i];

            if (path.isPointInPath(point.x, point.y)) {
              return true;
            }

            if (path.strokeStyle) {
              var strokePath = path._strokePath;
              if (!strokePath) {
                strokePath = path.strokePath(path.drawingStyles);
                path._strokePath = strokePath;
              }

              if (strokePath.isPointInPath(point.x, point.y)) {
                return true;
              }
            }
          }
        }

        var children = this._children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (child._hitTest(true, x, y, true, null)) {
            return true;
          }
        }

        return false;
      }

      var b1 = this.getBounds(this._stage);
      var b2 = hitTestObject.getBounds(hitTestObject._stage);
      return b1.intersects(b2);
    }
  }
}
