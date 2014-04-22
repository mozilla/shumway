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

/**
 * Flash bugs to keep in mind:
 *
 * http://aaronhardy.com/flex/displayobject-quirks-and-tips/
 * http://blog.anselmbradford.com/2009/02/12/flash-movie-clip-transformational-properties-explorer-x-y-width-height-more/
 * http://gskinner.com/blog/archives/2007/08/annoying_as3_bu.html
 * http://blog.dennisrobinson.name/getbounds-getrect-unexpected-results/
 *
 */
// Class: DisplayObject
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import assert = Shumway.Debug.assert;

  import BlendMode = flash.display.BlendMode; assert (BlendMode);
  import ColorTransform = flash.geom.ColorTransform; assert (ColorTransform);
  import Matrix = flash.geom.Matrix; assert (Matrix);
  import Point = flash.geom.Point; assert (Point);
  import Rectangle = flash.geom.Rectangle; assert (Rectangle);
  import EventDispatcher = flash.events.EventDispatcher; assert (EventDispatcher);

  export enum Direction {
    Upward     = 1,
    Downward   = 2
  }

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

    /**
     * Display object has invalid bounds.
     */
    InvalidBounds                             = 0x0004,

    /**
     * Display object has an invalid matrix because one of its local properties: x, y, scaleX, ... has been mutated.
     */
    InvalidMatrix                             = 0x0008,

    /**
     * Display object has an invalid concatenated matrix because its matrix or one of its ancestor's matrices has been mutated.
     */
    InvalidConcatenatedMatrix                 = 0x0010,

    /**
     * Display object has an invalid concatenated color transform because its color transform or one of its ancestor's color
     * transforms has been mutated.
     */
    InvalidConcatenatedColorTransform         = 0x0020,

    /**
     * Display object has changed since the last time it was drawn.
     */
    InvalidPaint                              = 0x0040,

    /**
     * The display object's constructor has been executed or any of the derived class constructors have executed. It may be
     * that the derived class doesn't call super, in such cases this flag must be set manually elsewhere.
     */
    Constructed                               = 0x0080,

    /**
     * Display object has been removed by the timeline but it no longer recieves any event.
     */
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
     * Indicates whether this display object should be cached as a bitmap. The display object
     * may be cached as bitmap even if this flag is not set, depending on whether any filters
     * are applied or if the bitmap is too large or we've run out of memory.
     */
    CacheAsBitmap                             = 0x1000
  }

  /**
   * Controls how the visitor walks the display tree.
   */
  export enum VisitorFlags {
    /**
     * None
     */
    None         = 0,

    /**
     * Continue with normal traversal.
     */
    Continue     = 0,

    /**
     * Not used yet, should probably just stop the visitor.
     */
    Stop         = 1,

    /**
     * Skip processing current node.
     */
    Skip         = 2,

    /**
     * Visit front to back.
     */
    FrontToBack  = 8
  }

  /*
   * Note: Private or protected functions are prefixed with "_" and *may* return objects that
   * should not be mutated. This is for performance reasons and it's up to you to make sure
   * such return values are cloned.
   *
   * Private or protected functions usually operate on twips, public functions work with pixels
   * since that's what the AS3 specifies.
   */

  export class DisplayObject extends flash.events.EventDispatcher implements IBitmapDrawable {

    /**
     * Every displayObject is assigned an unique integer ID.
     */
    private static _nextID = 0;
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
      return 'instance' + DisplayObject._instances.length;
    }

    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: DisplayObject) {
      var self: DisplayObject = this;
      var instanceName = DisplayObject.register(self);

      self._flags = DisplayObjectFlags.Visible       |
                    DisplayObjectFlags.InvalidBounds |
                    DisplayObjectFlags.InvalidMatrix;

      self._root = null;
      self._stage = null;
      self._name = instanceName;
      self._parent = null;
      self._mask = null;

      self._z = 0;
      self._scaleX = 1;
      self._scaleY = 1;
      self._scaleZ = 1;
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

      self._concatenatedMatrix = new Matrix();
      self._matrix = new Matrix();
      self._matrix3D = null;
      self._colorTransform = new ColorTransform();

      self._depth = 0;
      self._ratio = 0;
      self._graphics = null;
      self._hitTarget = null;
      self._index = -1;
      self._maskedObject = null;

      self._rect = new Rectangle();
      self._bounds = new Rectangle();


      // TODO move to InteractiveObject
      self._mouseOver = false;

      if (symbol) {
        self._name        = symbol._name      || self._name;
        self._parent      = symbol._parent    || self._parent;
        self._clipDepth   = symbol._clipDepth || self._clipDepth;
        self._blendMode   = symbol._blendMode || self._blendMode;
        self._depth       = symbol._depth     || self._depth;

        if (symbol._scale9Grid) {
          self._scale9Grid = symbol._scale9Grid.clone();
        }

        if (symbol._hasFlags(DisplayObjectFlags.AnimatedByTimeline)) {
          self._setFlags(DisplayObjectFlags.AnimatedByTimeline);
        }

//        if (symbol.bbox) {
//          var bbox = symbol.bbox;
//          self._bounds.setTo(bbox.xMin, bbox.yMin, bbox.xMax - bbox.xMin, bbox.yMax - bbox.yMin);
//        }

        if (symbol._matrix) {
          this._setMatrix(symbol._matrix, false);
        }

        if (symbol._colorTransform) {
          this._setColorTransform(symbol._colorTransform);
        }

        if (symbol._hasFlags(DisplayObjectFlags.OwnedByTimeline)) {
          self._setFlags(DisplayObjectFlags.OwnedByTimeline);
        }
      }
    };
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["hitTestObject", "hitTestPoint"];
    
    constructor () {
      false && super(undefined);
      EventDispatcher.instanceConstructorNoInitialize();
      this._setFlags(DisplayObjectFlags.Constructed);
      this._id = DisplayObject._nextID ++;
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

    /**
     * Propagates flags up and down the the display list.
     */
    _propagateFlags(flags: DisplayObjectFlags, direction: Direction) {
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
        if (DisplayObjectContainer.isType(this)) {
          var children = (<DisplayObjectContainer>this)._children;
          for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (!child._hasFlags(flags)) {
              child._propagateFlags(flags, Direction.Downward);
            }
          }
        }
      }
    }

    // AS -> JS Bindings

    private _id: number;
    private _flags: number;

    _root: DisplayObject;
    _stage: flash.display.Stage;
    _name: string;
    _parent: DisplayObjectContainer;
    _mask: DisplayObject;

    /**
     * These are always the most up to date properties. The |_matrix| is kept in sync with
     * these values.
     */
    _z: number;
    _scaleX: number;
    _scaleY: number;
    _scaleZ: number;

    _rotation: number;

    _rotationX: number;
    _rotationY: number;
    _rotationZ: number;

    _mouseX: number;
    _mouseY: number;

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

    /**
     * Bounding box excluding strokes.
     */
    _rect: flash.geom.Rectangle;

    /**
     * Bounding box including strokes.
     */
    _bounds: flash.geom.Rectangle;

    _clipDepth: number;

    /**
     * The a, b, c, d components of the matrix are only valid if the InvalidMatrix flag
     * is not set. Don't access this directly unless you can be sure that its components
     * are valid.
     */
    _matrix: flash.geom.Matrix;


    _concatenatedMatrix: flash.geom.Matrix;
    _colorTransform: flash.geom.ColorTransform;
    _concatenatedColorTransform: flash.geom.ColorTransform;
    _matrix3D: flash.geom.Matrix3D;
    _depth: number;
    _ratio: number;
    _graphics: flash.display.Graphics;
    _hitTarget: DisplayObject;

    /**
     * Index of this display object within its container's children
     */
    _index: number;

    _isContainer: boolean;
    _maskedObject: DisplayObject;
    _mouseChildren: boolean;
    _mouseDown: boolean;
    _mouseOver: boolean;


    /**
     * Finds the closest ancestor with a given set of flags that are either turned on or off.
     */
    private _findClosestAncestor(flags: DisplayObjectFlags, on: boolean): DisplayObject {
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
     * Tests if this display object is an ancestor of the specified display object.
     */
    _isAncestor(child: DisplayObject): boolean {
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
     * Clamps the rotation value to the range (-180, 180).
     */
    private static _clampRotation(value): number {
      value %= 360;
      if (value > 180) {
        value -= 360;
      } else if (value < -180) {
        value += 360;
      }
      return value;
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
      while (node && node !== last) {
        path.push(node);
        node = node._parent;
      }
      assert (node === last, "Last ancestor is not an ancestor.");
      return path;
    }

    /**
     * Computes the combined transformation matrixes of this display object and all of its parents. It is not
     * the same as |transform.concatenatedMatrix|, the latter also includes the screen space matrix.
     */
    _getConcatenatedMatrix(): Matrix {
      // Compute the concatenated transforms for this node and all of its ancestors.
      if (this._hasFlags(DisplayObjectFlags.InvalidConcatenatedMatrix)) {
        var ancestor = this._findClosestAncestor(DisplayObjectFlags.InvalidConcatenatedMatrix, false);
        var path = DisplayObject._getAncestors(this, ancestor);
        var m = ancestor ? ancestor._concatenatedMatrix.clone() : new Matrix();
        for (var i = path.length - 1; i >= 0; i--) {
          var ancestor = path[i];
          assert (ancestor._hasFlags(DisplayObjectFlags.InvalidConcatenatedMatrix));
          m.preMultiply(ancestor._getMatrix());
          ancestor._concatenatedMatrix.copyFrom(m);
          ancestor._removeFlags(DisplayObjectFlags.InvalidConcatenatedMatrix);
        }
      }
      return this._concatenatedMatrix;
    }

    _getInvertedConcatenatedMatrix(): Matrix {
      return this._getConcatenatedMatrix().clone().invert();
    }

    _setMatrix(matrix: Matrix, toTwips: boolean): void {
      var m = this._matrix;
      m.copyFrom(matrix);
      if (toTwips) {
        m.toTwips();
      }
      this._scaleX = m.getScaleX();
      this._scaleY = m.getScaleY();
      this._rotation = DisplayObject._clampRotation(matrix.getRotation() * 180 / Math.PI);
      this._removeFlags(DisplayObjectFlags.InvalidMatrix);
      this._invalidatePosition();
    }

    /**
     * Returns an updated matrix if the current one is invalid.
     */
    _getMatrix() {
      if (this._hasFlags(DisplayObjectFlags.InvalidMatrix)) {
        this._matrix.updateScaleAndRotation(this._scaleX, this._scaleY, this._rotation);
        this._removeFlags(DisplayObjectFlags.InvalidMatrix);
      }
      return this._matrix;
    }

    /**
     * Computes the combined transformation color matrixes of this display object and all of its ancestors.
     */
    _getConcatenatedColorTransform(): ColorTransform {
      if (ancestor === this._parent) {
        return this._colorTransform;
      }
      // Compute the concatenated color transforms for this node and all of its ancestors.
      if (this._hasFlags(DisplayObjectFlags.InvalidConcatenatedColorTransform)) {
        var ancestor = this._findClosestAncestor(DisplayObjectFlags.InvalidConcatenatedColorTransform, false);
        var path = DisplayObject._getAncestors(this, ancestor);
        var m = ancestor ? ancestor._concatenatedColorTransform.clone() : new ColorTransform();
        for (var i = path.length - 1; i >= 0; i--) {
          var ancestor = path[i];
          assert (ancestor._hasFlags(DisplayObjectFlags.InvalidConcatenatedColorTransform));
          m.preMultiply(ancestor._colorTransform);
          ancestor._concatenatedColorTransform.copyFrom(m);
          ancestor._removeFlags(DisplayObjectFlags.InvalidConcatenatedColorTransform);
        }
      }
      return this._concatenatedColorTransform;
    }

    _setColorTransform(colorTransform: flash.geom.ColorTransform) {
      this._colorTransform.copyFrom(colorTransform);
      this._propagateFlags(DisplayObjectFlags.InvalidConcatenatedColorTransform, Direction.Downward);
      this._invalidatePaint();
    }

    /**
     * Invalidates the bounds of this display object along with all of its ancestors.
     */
    _invalidateBounds(): void {
      this._propagateFlags(DisplayObjectFlags.InvalidBounds, Direction.Upward);
    }

    /**
     * Computes the bounding box for all of this display object's content, its graphics and all of its children.
     */
    private _getContentBounds(includeStrokes: boolean = true): Rectangle {
      // Tobias: What about filters?
      var rectangle = includeStrokes ? this._bounds : this._rect;
      if (this._hasFlags(DisplayObjectFlags.InvalidBounds)) {
        rectangle.setEmpty();
        var graphics: Graphics = this._getGraphics();
        if (graphics) {
          rectangle.unionWith(graphics._getContentBounds(includeStrokes));
        }
        if (DisplayObjectContainer.isType(this)) {
          var container: DisplayObjectContainer = <DisplayObjectContainer>this;
          var children = container._children;
          for (var i = 0; i < children.length; i++) {
            rectangle.unionWith(children[i]._getTransformedBounds(this, includeStrokes));
          }
        }
        this._removeFlags(DisplayObjectFlags.InvalidBounds);
      }
      return rectangle;
    }

    /**
     * Gets the bounds of this display object relative to another coordinate space. The transformation
     * matrix from the local coordinate space to the target coordinate space is computed using:
     *
     *   this.concatenatedMatrix * inverse(target.concatenatedMatrix)
     */
    private _getTransformedBounds(targetCoordinateSpace: DisplayObject, includeStroke: boolean = true) {
      var bounds = this._getContentBounds(includeStroke).clone();
      if (!targetCoordinateSpace || targetCoordinateSpace === this || bounds.isEmpty()) {
        return bounds;
      }
      var m = targetCoordinateSpace._getConcatenatedMatrix().clone();
      m.invert();
      m.preMultiply(this._getConcatenatedMatrix());
      return m.transformRectAABB(bounds);
    }

    /**
     * Marks this object as needing to be repainted.
     */
    _invalidatePaint() {
      this._propagateFlags(DisplayObjectFlags.InvalidPaint, Direction.Upward);
    }

    private _stopTimelineAnimation() {
      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
    }

    /**
     * Marks this object as having been moved in its parent display object.
     */
    _invalidatePosition() {
      this._propagateFlags(DisplayObjectFlags.InvalidConcatenatedMatrix, Direction.Downward);
      if (this._parent) {
        this._parent._invalidateBounds();
      }
    }

    get x(): number {
      return this._matrix.tx * 0.05;
    }

    set x(value: number) {
      value = (value * 20) | 0;
      this._stopTimelineAnimation();
      if (value === this._matrix.tx) {
        return;
      }
      this._matrix.tx = value;
      this._invalidatePosition();
    }

    get y(): number {
      return this._matrix.ty * 0.05;
    }

    set y(value: number) {
      value = (value * 20) | 0;
      this._stopTimelineAnimation();
      if (value === this._matrix.ty) {
        return;
      }
      this._matrix.ty = value;
      this._invalidatePosition();
    }

    get scaleX(): number {
      return this._scaleX;
    }

    set scaleX(value: number) {
      value = +value;
      this._stopTimelineAnimation();
      if (value === this._scaleX) {
        return;
      }
      this._scaleX = value;
      this._setFlags(DisplayObjectFlags.InvalidMatrix);
      this._invalidatePosition();
    }

    get scaleY(): number {
      return this._scaleY;
    }

    set scaleY(value: number) {
      value = +value;
      this._stopTimelineAnimation();
      if (value === this._scaleY) {
        return;
      }
      this._scaleY = value;
      this._setFlags(DisplayObjectFlags.InvalidMatrix);
      this._invalidatePosition();
    }

    get scaleZ(): number {
      return this._scaleZ;
    }

    set scaleZ(value: number) {
      value = +value;
      notImplemented("public DisplayObject::set scaleZ"); return;
    }

    get rotation(): number {
      return this._rotation;
    }

    set rotation(value: number) {
      value = +value;
      this._stopTimelineAnimation();
      value = DisplayObject._clampRotation(value);
      if (value === this._rotation) {
        return;
      }
      this._rotation = value;
      this._setFlags(DisplayObjectFlags.InvalidMatrix);
      this._invalidatePosition();
    }

    get rotationX(): number {
      return this._rotationX;
    }

    set rotationX(value: number) {
      value = +value;
      notImplemented("public DisplayObject::set rotationX"); return;
    }

    get rotationY(): number {
      return this._rotationY;
    }

    set rotationY(value: number) {
      value = +value;
      notImplemented("public DisplayObject::set rotationY"); return;
    }

    get rotationZ(): number {
      return this._rotationZ;
    }

    set rotationZ(value: number) {
      value = +value;
      notImplemented("public DisplayObject::set rotationZ"); return;
    }

    /**
     * The width of this display object in its parent coordinate space.
     */
    get width(): number {
      var bounds = this._getTransformedBounds(this._parent, true);
      return bounds.width * 0.05;
    }

    /**
     * Attempts to change the width of this display object by changing its scaleX / scaleY
     * properties. The scaleX property is set to the specified |width| value / baseWidth
     * of the object in its parent cooridnate space with rotation applied.
     */
    set width(value: number) {
      value = (value * 20) | 0;
      this._stopTimelineAnimation();
      if (value < 0) {
        return;
      }
      var bounds = this._getTransformedBounds(this._parent, true);
      var contentBounds = this._getContentBounds(true);
      var angle = this._rotation / 180 * Math.PI;
      var baseWidth = contentBounds.getBaseWidth(angle);
      if (!baseWidth) {
        return;
      }
      var baseHeight = contentBounds.getBaseHeight(angle);
      this._scaleY = bounds.height / baseHeight;
      this._scaleX = value / baseWidth;
      this._setFlags(DisplayObjectFlags.InvalidMatrix);
      this._invalidatePosition();
    }

    /**
     * The height of this display object in its parent coordinate space.
     */
    get height(): number {
      var bounds = this._getTransformedBounds(this._parent, true);
      return bounds.height * 0.05;
    }

    /**
     * Attempts to change the height of this display object by changing its scaleY / scaleX
     * properties. The scaleY property is set to the specified |height| value / baseHeight
     * of the object in its parent cooridnate space with rotation applied.
     */
    set height(value: number) {
      value = (value * 20) | 0;
      this._stopTimelineAnimation();
      if (value < 0) {
        return;
      }
      var bounds = this._getTransformedBounds(this._parent, true);
      var contentBounds = this._getContentBounds(true);
      var angle = this._rotation / 180 * Math.PI;
      var baseHeight = contentBounds.getBaseWidth(angle);
      if (!baseHeight) {
        return;
      }
      var baseWidth = contentBounds.getBaseWidth(angle);
      this._scaleY = value / baseHeight;
      this._scaleX = bounds.width / baseWidth;
      this._setFlags(DisplayObjectFlags.InvalidMatrix);
      this._invalidatePosition();
    }

    get mask(): DisplayObject {
      return this._mask;
    }

    /**
     * Sets the mask for this display object. This does not affect the bounds.
     */
    set mask(value: DisplayObject) {
      this._stopTimelineAnimation();
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
      this._invalidatePaint();
    }

    get transform(): flash.geom.Transform {
      return new flash.geom.Transform(this);
    }

    set transform(value: flash.geom.Transform) {
      this._stopTimelineAnimation();
      if (value.matrix3D) {
        this._matrix3D = value.matrix3D;
      } else {
        this._setMatrix(value.matrix, true);
      }
      this._setColorTransform(value.colorTransform);
    }

    private destroy(): void {
      this._setFlags(DisplayObjectFlags.Destroyed);
    }

    /**
     * Walks up the tree to find this display object's root. An object is classified
     * as a root if its _root property points to itself. Root objects are the Stage,
     * the main timeline object and a Loader's content.
     */
    get root(): DisplayObject {
      var node = this;
      do {
        if (node._root === node) {
          return node;
        }
        node = node._parent;
      } while (node);
      return null;
    }

    /**
     * Walks up the tree to find this display object's stage, the first object whose
     * |_stage| property points to itself.
     */
    get stage(): flash.display.Stage {
      var node = this;
      do {
        if (node._stage === node) {
          assert(flash.display.Stage.isType(node));
          return <flash.display.Stage>node;
        }
        node = node._parent;
      } while (node);
      return null;
    }

    get name(): string {
      return this._name;
    }

    set name(value: string) {
      this._name = asCoerceString(value);
    }

    get parent(): DisplayObjectContainer {
      return this._parent;
    }

    get visible(): boolean {
      return this._hasFlags(DisplayObjectFlags.Visible);
    }

    get alpha(): number {
      return this._alpha;
    }

    set alpha(value: number) {
      this._stopTimelineAnimation();
      value = +value;

      if (value === this._alpha) {
        return;
      }

      this._alpha = value;
      this._invalidatePaint();
    }

    /**
     * Marks this display object as visible / invisible. This does not affect the bounds.
     */
    set visible(value: boolean) {
      this._stopTimelineAnimation();
      value = !!value;
      if (value === this._hasFlags(DisplayObjectFlags.Visible)) {
        return;
      }
      this._setFlags(DisplayObjectFlags.Visible);
    }

    get z(): number {
      return this._z;
    }

    set z(value: number) {
      value = +value;
      this._z = value;
      notImplemented("public DisplayObject::set z"); return;
    }

    getBounds(targetCoordinateSpace: DisplayObject): flash.geom.Rectangle {
      return this._getTransformedBounds(targetCoordinateSpace, true).toPixels();
    }

    getRect(targetCoordinateSpace: DisplayObject): flash.geom.Rectangle {
      return this._getTransformedBounds(targetCoordinateSpace, false).toPixels();
    }

    /**
     * Converts a point from the global coordinate space into the local coordinate space.
     */
    globalToLocal(point: flash.geom.Point): flash.geom.Point {
      var m = this._getInvertedConcatenatedMatrix();
      return m.transformCoords(point.x, point.y, true).toPixels();
    }

    /**
     * Converts a point form the local coordinate sapce into the global coordinate space.
     */
    localToGlobal(point: flash.geom.Point): flash.geom.Point {
      var m = this._getConcatenatedMatrix();
      return m.transformCoords(point.x, point.y, true).toPixels();
    }

    public visit(visitor: (DisplayObject) => VisitorFlags, visitorFlags: VisitorFlags) {
      var stack: DisplayObject [];
      var displayObject: DisplayObject;
      var displayObjectContainer: DisplayObjectContainer;
      var frontToBack = visitorFlags & VisitorFlags.FrontToBack;
      stack = [this];
      while (stack.length > 0) {
        displayObject = stack.pop();
        var flags = visitor(displayObject);
        if (flags === VisitorFlags.Continue) {
          if (DisplayObjectContainer.isType(displayObject)) {
            displayObjectContainer = <DisplayObjectContainer>displayObject;
            var children = displayObjectContainer._children;
            var length = children.length;
            for (var i = 0; i < length; i++) {
              var child = children[frontToBack ? i : length - 1 - i];
              stack.push(child);
            }
          }
        } else if (flags === VisitorFlags.Stop) {
          return;
        }
      }
    }

    /**
     * Returns the loader info for this display object's root.
     */
    get loaderInfo(): flash.display.LoaderInfo {
      var root = this.root;
      if (root) {
        assert(root._loaderInfo, "No LoaderInfo object found on root.");
        return root._loaderInfo;
      }
      return null;
    }

    /**
     * Gets the graphics object of this object. Only Shapes, Sprites, and MorphShapes can have
     * graphics.
     */
    private _getGraphics(): flash.display.Graphics {
      if (flash.display.Shape.isType(this)) {
        return (<flash.display.Shape>this)._graphics;
      } else if (flash.display.Shape.isType(this)) {
        return (<flash.display.Shape>this)._graphics;
      } else if (flash.display.Shape.isType(this)) {
        return (<flash.display.Shape>this)._graphics;
      }
      return null;
    }

    /**
     * Checks if the bounding boxes of two display objects overlap, this happens in the global
     * coordinate coordinate space.
     *
     * Two objects overlap even if one or both are not on the stage, as long as their bounds
     * in the global coordinate space overlap.
     */
    hitTestObject(other: DisplayObject): boolean {
      release || assert (other && DisplayObject.isType(other));
      var a = this, b = other;
      var aBounds = a._getContentBounds(false);
      var bBounds = b._getContentBounds(false);
      a._getConcatenatedMatrix().transformRectAABB(aBounds);
      b._getConcatenatedMatrix().transformRectAABB(bBounds);
      return aBounds.intersects(bBounds);
    }

    /**
     * The |x| and |y| arguments are in global coordinates. The |shapeFlag| indicates whether
     * the hit test should be on the actual pixels of the object |true| or just its bounding
     * box |false|.
     */
    hitTestPoint(x: number, y: number, shapeFlag: boolean = false): boolean {
      x = +x; y = +y; shapeFlag = !!shapeFlag;
      var point = this._getInvertedConcatenatedMatrix().transformCoords(x, y, true);
      if (!this._getContentBounds().containsPoint(point)) {
        return false;
      }
      if (!shapeFlag) {
        return true;
      }
      // TODO: Figure out if we need to test against the graphics path first
      // and exit early instead of going down the children list. Testing the
      // path can be more expensive sometimes, more so than testing the
      // children.
      if (DisplayObjectContainer.isType(this)) {
        var children = (<DisplayObjectContainer>this)._children;
        for (var i = 0; i < children.length; i++) {
          if (children[i].hitTestPoint(x, y, shapeFlag)) {
            return true;
          }
        }
      }
      var graphics = this._getGraphics();
      if (graphics) {
        return graphics._containsPoint(point);
      }
      return false;
    }

    // ---------------------------------------------------------------------------------------------------------------------------------------------
    // -- Stuff below we still need to port.                                                                                                      --
    // ---------------------------------------------------------------------------------------------------------------------------------------------

    /*

    get mouseX(): number {
      return this._mouseX / 20;
    }
    get mouseY(): number {
      return this._mouseY / 20;
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
      notImplemented("public DisplayObject::set opaqueBackground"); return;
      // this._opaqueBackground = value;
    }
    get scrollRect(): flash.geom.Rectangle {
      return this._scrollRect;
    }
    set scrollRect(value: flash.geom.Rectangle) {
      value = value;
      notImplemented("public DisplayObject::set scrollRect"); return;
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
      value = asCoerceString(value);

      if (this._blendMode === value) {
        return;
      }

      if (BlendMode.toNumber(value) >= 0) {
        this._blendMode = value;
      } else {
        throwError("ArgumentError", Errors.InvalidEnumError, "blendMode");
      }

      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
      this._invalidate();
    }

    get scale9Grid(): flash.geom.Rectangle {
      return this._scale9Grid;
    }
    set scale9Grid(innerRectangle: flash.geom.Rectangle) {
      innerRectangle = innerRectangle;
      notImplemented("public DisplayObject::set scale9Grid"); return;
      // this._scale9Grid = innerRectangle;
    }
    get accessibilityProperties(): flash.accessibility.AccessibilityProperties {
      return this._accessibilityProperties;
    }
    set accessibilityProperties(value: flash.accessibility.AccessibilityProperties) {
      value = value;
      notImplemented("public DisplayObject::set accessibilityProperties"); return;
      // this._accessibilityProperties = value;
    }
    set blendShader(value: flash.display.Shader) {
      value = value;
      notImplemented("public DisplayObject::set blendShader"); return;
      // this._blendShader = value;
    }
    globalToLocal3D(point: flash.geom.Point): flash.geom.Vector3D {
      point = point;
      notImplemented("public DisplayObject::globalToLocal3D"); return;
    }
    local3DToGlobal(point3d: flash.geom.Vector3D): flash.geom.Point {
      point3d = point3d;
      notImplemented("public DisplayObject::local3DToGlobal"); return;
    }
    _hitTest(use_xy: boolean, x: number, y: number, useShape: boolean, hitTestObject: DisplayObject): boolean {
      use_xy = !!use_xy; x = +x; y = +y; useShape = !!useShape;
      //hitTestObject = hitTestObject;

      if (use_xy) {
        var m = this._getConcatenatedMatrix(null).clone();
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
   */
  }
}
