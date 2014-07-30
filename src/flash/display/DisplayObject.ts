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
  import abstractMethod = Shumway.Debug.abstractMethod;
  import isNullOrUndefined = Shumway.isNullOrUndefined;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import assert = Shumway.Debug.assert;
  import unexpected = Shumway.Debug.unexpected;

  import Bounds = Shumway.Bounds;
  import geom = flash.geom;
  import events = flash.events;

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
   *
   *
   * Dirty Bits:
   *
   * These are used to mark properties as having been changed.
   */
  export enum DisplayObjectFlags {
    None                                      = 0x0000,

    /**
     * Display object is visible.
     */
    Visible                                   = 0x0001,

    /**
     * Display object has invalid line bounds.
     */
    InvalidLineBounds                         = 0x0002,

    /**
     * Display object has invalid fill bounds.
     */
    InvalidFillBounds                         = 0x0004,

    /**
     * Display object has an invalid matrix because one of its local properties: x, y, scaleX, ... has been mutated.
     */
    InvalidMatrix                             = 0x0008,

    /**
     * Display object has an invalid inverted matrix because its matrix has been mutated.
     */
    InvalidInvertedMatrix                     = 0x0010,

    /**
     * Display object has an invalid concatenated matrix because its matrix or one of its ancestor's matrices has been mutated.
     */
    InvalidConcatenatedMatrix                 = 0x0020,

    /**
     * Display object has an invalid inverted concatenated matrix because its matrix or one of its ancestor's matrices has been
     * mutated. We don't always need to compute the inverted matrix. This is why we use a sepearete invalid flag for it and don't
     * roll it under the |InvalidConcatenatedMatrix| flag.
     */
    InvalidInvertedConcatenatedMatrix         = 0x0040,

    /**
     * Display object has an invalid concatenated color transform because its color transform or one of its ancestor's color
     * transforms has been mutated.
     */
    InvalidConcatenatedColorTransform         = 0x0080,

    /**
     * The display object's constructor has been executed or any of the derived class constructors have executed. It may be
     * that the derived class doesn't call super, in such cases this flag must be set manually elsewhere.
     */
    Constructed                               = 0x0100,

    /**
     * Display object has been removed by the timeline but it no longer recieves any event.
     */
    Destroyed                                 = 0x0200,

    /**
     * Display object is owned by the timeline, meaning that it is under the control of the timeline and that a reference
     * to this object has not leaked into AS3 code via the DisplayObjectContainer methods |getChildAt|,  |getChildByName|
     * or through the execution of the symbol class constructor.
     */
    OwnedByTimeline                           = 0x0400,

    /**
     * Display object is animated by the timeline. It may no longer be owned by the timeline (|OwnedByTimeline|) but it
     * is still animated by it. If AS3 code mutates any property on the display object, this flag is cleared and further
     * timeline mutations are ignored.
     */
    AnimatedByTimeline                        = 0x0800,

    /**
     * MovieClip object has reached a frame with a frame script or ran a frame script that attached
     * a new one to the current frame. To run the script, it has to be appended to the queue of
     * scripts.
     */
    HasFrameScriptPending                     = 0x1000,

    /**
     * DisplayObjectContainer contains at least one descendant with the HasFrameScriptPending flag
     * set.
     */
    ContainsFrameScriptPendingChildren        = 0x2000,

    /**
     * Indicates whether this display object should be cached as a bitmap. The display object may be cached as bitmap even
     * if this flag is not set, depending on whether any filters are applied or if the bitmap is too large or we've run out
     * of memory.
     */
    CacheAsBitmap                             = 0x4000,

    /**
     * Indicates whether this display object's matrix has changed since the last time it was synchronized.
     */
    DirtyMatrix                               = 0x100000,

    /**
     * Indicates whether this display object's has dirty descendents. If this flag is not set then the subtree does not
     * need to be synchronized.
     */
    DirtyChildren                             = 0x200000,

    /**
     * Indicates whether this display object's graphics has changed since the last time it was synchronized.
     */
    DirtyGraphics                             = 0x400000,

    /**
     * Indicates whether this display object's text content has changed since the last time it was synchronized.
     */
    DirtyTextContent                          = 0x800000,

    /**
     * Indicates whether this display object's bitmap data has changed since the last time it was synchronized.
     */
    DirtyBitmapData                           = 0x1000000,

    /**
     * Indicates whether this display object's color transform has changed since the last time it was synchronized.
     */
    DirtyColorTransform                       = 0x2000000,

    /**
     * Indicates whether this display object's mask has changed since the last time it was synchronized.
     */
    DirtyMask                                 = 0x4000000,

    /**
     * Indicates whether this display object's clip depth has changed since the last time it was synchronized.
     */
    DirtyClipDepth                            = 0x8000000,

    /**
     * Indicates whether this display object's other properties have changed. We need to split this up in multiple
     * bits so we don't serialize as much:
     *
     * So far we only mark these properties here:
     *
     * blendMode,
     * scale9Grid,
     * cacheAsBitmap,
     * filters,
     * visible,
     */
    DirtyMiscellaneousProperties              = 0x10000000,

    /**
     * All synchronizable properties are dirty.
     */
    Dirty                                     = DirtyMatrix | DirtyChildren | DirtyGraphics |
                                                DirtyTextContent | DirtyBitmapData |
                                                DirtyColorTransform | DirtyMask | DirtyClipDepth |
                                                DirtyMiscellaneousProperties
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
    Stop         = 0x01,

    /**
     * Skip processing current node.
     */
    Skip         = 0x02,

    /**
     * Visit front to back.
     */
    FrontToBack  = 0x08,

    /**
     * Only visit the nodes matching a certain flag set.
     */
    Filter       = 0x10
  }

  /*
   * Note: Private or protected functions are prefixed with "_" and *may* return objects that
   * should not be mutated. This is for performance reasons and it's up to you to make sure
   * such return values are cloned.
   *
   * Private or protected functions usually operate on twips, public functions work with pixels
   * since that's what the AS3 specifies.
   */

  export interface IAdvancable extends Shumway.IReferenceCountable {
    _initFrame(advance: boolean): void;
    _constructFrame(): void;
  }

  export class DisplayObject extends flash.events.EventDispatcher implements IBitmapDrawable, Shumway.Remoting.IRemotable {

    /**
     * Every displayObject is assigned an unique integer ID.
     */
    static _syncID = 0;

    static getNextSyncID() {
      return this._syncID++;
    }

    static _advancableInstances: WeakList<IAdvancable>;

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      DisplayObject.reset();
    };

    static reset() {
      DisplayObject._advancableInstances = new WeakList<IAdvancable>();
    }

    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: Shumway.Timeline.DisplaySymbol) {
      release || counter.count("DisplayObject::initializer");

      var self: DisplayObject = this;

      self._id = flash.display.DisplayObject.getNextSyncID();
      self._displayObjectFlags = DisplayObjectFlags.Visible                            |
                                 DisplayObjectFlags.InvalidLineBounds                  |
                                 DisplayObjectFlags.InvalidFillBounds                  |
                                 DisplayObjectFlags.InvalidConcatenatedMatrix          |
                                 DisplayObjectFlags.InvalidInvertedConcatenatedMatrix  |
                                 DisplayObjectFlags.DirtyGraphics                      |
                                 DisplayObjectFlags.DirtyMatrix                        |
                                 DisplayObjectFlags.DirtyColorTransform                |
                                 DisplayObjectFlags.DirtyMask                          |
                                 DisplayObjectFlags.DirtyClipDepth                     |
                                 DisplayObjectFlags.DirtyMiscellaneousProperties;

      self._root = null;
      self._stage = null;
      self._name = null;
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

      self._width = 0;
      self._height = 0;
      self._opaqueBackground = null;
      self._scrollRect = null;
      self._filters = [];
      self._blendMode = BlendMode.NORMAL;
      release || assert (self._blendMode);
      self._scale9Grid = null;
      self._loaderInfo = null;
      self._accessibilityProperties = null;

      self._fillBounds = new Bounds(0, 0, 0, 0);
      self._lineBounds = new Bounds(0, 0, 0, 0);
      self._clipDepth = -1;

      self._concatenatedMatrix = new geom.Matrix();
      self._invertedConcatenatedMatrix = new geom.Matrix();
      self._matrix = new geom.Matrix();
      self._invertedMatrix = new geom.Matrix();
      self._matrix3D = null;
      self._colorTransform = new geom.ColorTransform();
      self._concatenatedColorTransform = new geom.ColorTransform();

      self._depth = -1;
      self._ratio = 0;
      self._index = -1;
      self._maskedObject = null;

      self._mouseOver = false;
      self._mouseDown = false;

      self._symbol = null;
      self._graphics = null;
      self._children = null;

      self._referenceCount = 0;

      if (symbol) {
        if (symbol.scale9Grid) {
          // No need to take ownership: scale9Grid is never changed.
          self._scale9Grid = symbol.scale9Grid;
        }
        self._symbol = symbol;
      }
    };

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["hitTestObject", "hitTestPoint"];

    /**
     * Creates a new display object from a symbol and initializes its animated display properties.
     * Calling its constructor is optional at this point, since that can happen in a later frame
     * phase.
     */
    static createAnimatedDisplayObject(state: Shumway.Timeline.AnimationState,
                                       callConstructor: boolean): DisplayObject {
      var symbol = state.symbol;
      var symbolClass = symbol.symbolClass;
      var instance: DisplayObject;
      if (symbolClass.isSubtypeOf(flash.display.BitmapData)) {
        instance = flash.display.Bitmap.initializeFrom(symbol);
      } else {
        instance = symbolClass.initializeFrom(symbol);
      }
      instance._setFlags(DisplayObjectFlags.AnimatedByTimeline);
      instance._setFlags(DisplayObjectFlags.OwnedByTimeline);
      instance._animate(state);
      if (callConstructor) {
        symbolClass.instanceConstructorNoInitialize.call(instance);
      }
      return instance;
    }

    private static _runScripts: boolean = true;

    /**
     * Runs one full turn of the frame events cycle.
     *
     * Frame navigation methods on MovieClip can trigger nested frame events cycles. These nested
     * cycles do everything the outermost cycle does, except for broadcasting the ENTER_FRAME
     * event.
     *
     * If runScripts is true, no events are dispatched and Movieclip frame scripts are run. This
     * is true for nested cycles, too. (We keep static state for that.)
     */
    static performFrameNavigation(stage: flash.display.Stage, mainLoop: boolean,
                                  runScripts: boolean) {
      if (mainLoop) {
        var timelineData = {instances: 0};
        DisplayObject._runScripts = runScripts;
        enterTimeline("DisplayObject.performFrameNavigation", timelineData);
      } else {
        runScripts = DisplayObject._runScripts;
      }

      assert(DisplayObject._advancableInstances.length < 1024 * 16, "Too many advancable instances.");

      // Step 1: Remove timeline objects that don't exist on new frame, update existing ones with
      // new properties, and declare, but not create, new ones, update numChildren.
      // NOTE: the Order Of Operations senocular article is wrong on this: timeline objects are
      // removed from stage at the beginning of a frame, just as new objects are declared at that
      // point.
      // Also, changed properties of existing objects are updated here instead of during frame
      // construction after ENTER_FRAME.
      // Thus, all these can be done together.
      DisplayObject._advancableInstances.forEach(function (value: IAdvancable) {
        (<IAdvancable>value)._initFrame(mainLoop);
      });
      // Step 2: Dispatch ENTER_FRAME, only called in outermost invocation.
      if (mainLoop && runScripts) {
        DisplayObject._broadcastFrameEvent(events.Event.ENTER_FRAME);
      }
      // Step 3: Create new timeline objects.
      DisplayObject._advancableInstances.forEach(function (value: IAdvancable) {
        (<IAdvancable>value)._constructFrame();
      });
      // Step 4: Dispatch FRAME_CONSTRUCTED.
      if (runScripts) {
        DisplayObject._broadcastFrameEvent(events.Event.FRAME_CONSTRUCTED);
        // Step 5: Run frame scripts
        stage._enqueueFrameScripts();
        MovieClip.runFrameScripts();
        // Step 6: Dispatch EXIT_FRAME.
        DisplayObject._broadcastFrameEvent(events.Event.EXIT_FRAME);
      } else {
        MovieClip.reset();
      }
      if (mainLoop) {
        leaveTimeline();
        DisplayObject._runScripts = true;
      }
    }

    /**
     * Dispatches a frame event on all instances of DisplayObjects.
     */
    static _broadcastFrameEvent(type: string): void {
      var event: flash.events.Event;
      switch (type) {
        case events.Event.ENTER_FRAME:
        case events.Event.FRAME_CONSTRUCTED:
        case events.Event.EXIT_FRAME:
        case events.Event.RENDER:
          // TODO: Fire RENDER events only for objects on the display list.
          event = events.Event.getBroadcastInstance(type);
      }
      release || assert (event, "Invalid frame event.");
      events.EventDispatcher.broadcastEventDispatchQueue.dispatchEvent(event);
    }

    constructor () {
      false && super(undefined);
      events.EventDispatcher.instanceConstructorNoInitialize.call(this);
      this._addReference();
      this._setFlags(DisplayObjectFlags.Constructed);
    }

    _setParent(parent: DisplayObjectContainer, depth: number) {
      var oldParent = this._parent;
      this._parent = parent;
      this._depth = depth;
      if (parent) {
        this._addReference();
      }
      if (oldParent) {
        this._removeReference();
      }
    }

    _setFillAndLineBoundsFromWidthAndHeight(width: number, height: number) {
      this._fillBounds.width = width;
      this._fillBounds.height = height;
      this._lineBounds.width = width;
      this._lineBounds.height = height;
      this._removeFlags(DisplayObjectFlags.InvalidLineBounds | DisplayObjectFlags.InvalidFillBounds);
      this._invalidateParentFillAndLineBounds(true, true);
    }

    _setFillAndLineBoundsFromSymbol(symbol: Timeline.DisplaySymbol) {
      release || assert (symbol.fillBounds || symbol.lineBounds, "Fill or Line bounds are not defined in the symbol.");
      if (symbol.fillBounds) {
        this._fillBounds.copyFrom(symbol.fillBounds);
        this._removeFlags(DisplayObjectFlags.InvalidFillBounds);
      }
      if (symbol.lineBounds) {
        this._lineBounds.copyFrom(symbol.lineBounds);
        this._removeFlags(DisplayObjectFlags.InvalidLineBounds);
      }
      this._invalidateParentFillAndLineBounds(!!symbol.fillBounds, !!symbol.lineBounds);
    }

    _setFlags(flags: DisplayObjectFlags) {
      this._displayObjectFlags |= flags;
    }

    /**
     * Use this to set dirty flags so that we can also propagate the dirty child bit.
     */
    _setDirtyFlags(flags: DisplayObjectFlags) {
      this._displayObjectFlags |= flags;
      if (this._parent) {
        this._parent._propagateFlagsUp(DisplayObjectFlags.DirtyChildren);
      }
    }

    _toggleFlags(flags: DisplayObjectFlags, on: boolean) {
      if (on) {
        this._displayObjectFlags |= flags;
      } else {
        this._displayObjectFlags &= ~flags;
      }
    }

    _removeFlags(flags: DisplayObjectFlags) {
      this._displayObjectFlags &= ~flags;
    }

    _hasFlags(flags: DisplayObjectFlags): boolean {
      return (this._displayObjectFlags & flags) === flags;
    }

    _hasAnyFlags(flags: DisplayObjectFlags): boolean {
      return !!(this._displayObjectFlags & flags);
    }

    /**
     * Propagates flags up the display list. Propagation stops if all flags are already set.
     */
    _propagateFlagsUp(flags: DisplayObjectFlags) {
      if (this._hasFlags(flags)) {
        return;
      }
      this._setFlags(flags);
      var parent = this._parent;
      if (parent) {
        parent._propagateFlagsUp(flags);
      }
    }

    /**
     * Propagates flags down the display list. Non-containers just set the flags on themselves.
     *
     * Overridden in DisplayObjectContainer.
     */
    _propagateFlagsDown(flags: DisplayObjectFlags) {
      this._setFlags(flags);
    }

    // AS -> JS Bindings

    _id: number;
    private _displayObjectFlags: number;

    _root: flash.display.DisplayObject;
    _stage: flash.display.Stage;
    _name: string;
    _parent: flash.display.DisplayObjectContainer;
    _mask: flash.display.DisplayObject;

    /**
     * These are always the most up to date properties. The |_matrix| is kept in sync with
     * these values. This is only true when |_matrix3D| is null.
     */
    _scaleX: number;
    _scaleY: number;

    _z: number;
    _scaleZ: number;
    _rotation: number;

    _rotationX: number;
    _rotationY: number;
    _rotationZ: number;

    _mouseX: number;
    _mouseY: number;

    _width: number;
    _height: number;
    _opaqueBackground: ASObject;
    _scrollRect: flash.geom.Rectangle;
    _filters: any [];
    _blendMode: string;
    _scale9Grid: Bounds;
    _loaderInfo: flash.display.LoaderInfo;
    _accessibilityProperties: flash.accessibility.AccessibilityProperties;

    /**
     * Bounding box excluding strokes.
     */
    _fillBounds: Bounds;

    /**
     * Bounding box including strokes.
     */
    _lineBounds: Bounds;

    /*
     * If larger than |-1| then this object acts like a mask for all objects between |_depth + 1| and |_clipDepth| inclusive. The
     * swf experts say that Adobe tools only generate neatly nested clip segments.
     *
     * A: -------------[-------------------)---------------
     * B: -----------------[-------------)-----------------
     *    ----X----------Y--------Z-------------W----------
     *
     * X is not clipped, Y is only clipped by A, Z by both A and B and finally W is not clipped at all.
     */
    _clipDepth: number;

    /**
     * The a, b, c, d components of the matrix are only valid if the InvalidMatrix flag
     * is not set. Don't access this directly unless you can be sure that its components
     * are valid.
     */
    _matrix: flash.geom.Matrix;
    _invertedMatrix: flash.geom.Matrix;


    _concatenatedMatrix: flash.geom.Matrix;
    _invertedConcatenatedMatrix: flash.geom.Matrix;
    _colorTransform: flash.geom.ColorTransform;
    _concatenatedColorTransform: flash.geom.ColorTransform;
    _matrix3D: flash.geom.Matrix3D;
    _depth: number;
    _ratio: number;

    /**
     * Index of this display object within its container's children
     */
    _index: number;

    _isContainer: boolean;
    _maskedObject: flash.display.DisplayObject;
    _mouseOver: boolean;
    _mouseDown: boolean;

    _symbol: Shumway.Timeline.Symbol;
    _graphics: flash.display.Graphics;

    /**
     * This is only ever used in classes that can have children, like |DisplayObjectContainer| or |SimpleButton|.
     */
    _children: DisplayObject [];

    /**
     *
     */
    _referenceCount: number;

    /**
     * Finds the nearest ancestor with a given set of flags that are either turned on or off.
     */
    private _findNearestAncestor(flags: DisplayObjectFlags, on: boolean): DisplayObject {
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
    private static _getAncestors(node: DisplayObject, last: DisplayObject) {
      var path = DisplayObject._path;
      path.length = 0;
      while (node && node !== last) {
        path.push(node);
        node = node._parent;
      }
      release || assert (node === last, "Last ancestor is not an ancestor.");
      return path;
    }

    /**
     * Computes the combined transformation matrixes of this display object and all of its parents.
     * It is not the same as |transform.concatenatedMatrix|, the latter also includes the screen
     * space matrix.
     */
    _getConcatenatedMatrix(): flash.geom.Matrix {
      if (this._hasFlags(DisplayObjectFlags.InvalidConcatenatedMatrix)) {
        if (this._parent) {
          this._parent._getConcatenatedMatrix().preMultiplyInto(this._getMatrix(),
                                                                this._concatenatedMatrix);
        } else {
          this._concatenatedMatrix.copyFrom(this._getMatrix());
        }
        this._removeFlags(DisplayObjectFlags.InvalidConcatenatedMatrix);
      }
      return this._concatenatedMatrix;
    }

    _getInvertedConcatenatedMatrix(): flash.geom.Matrix {
      if (this._hasFlags(DisplayObjectFlags.InvalidInvertedConcatenatedMatrix)) {
        this._getConcatenatedMatrix().invertInto(this._invertedConcatenatedMatrix);
        this._removeFlags(DisplayObjectFlags.InvalidInvertedConcatenatedMatrix);
      }
      return this._invertedConcatenatedMatrix;
    }

    _setMatrix(matrix: flash.geom.Matrix, toTwips: boolean): void {
      if (!toTwips && this._matrix.equals(matrix)) {
        // No need to dirty the matrix if it's equal to the current matrix.
        return;
      }
      var m = this._matrix;
      m.copyFrom(matrix);
      if (toTwips) {
        m.toTwipsInPlace();
      }
      this._scaleX = m.getScaleX();
      this._scaleY = m.getScaleY();
      this._rotation = DisplayObject._clampRotation(matrix.getRotation() * 180 / Math.PI);
      this._removeFlags(DisplayObjectFlags.InvalidMatrix);
      this._setFlags(DisplayObjectFlags.InvalidInvertedMatrix);
      this._setDirtyFlags(DisplayObjectFlags.DirtyMatrix);
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

    _getInvertedMatrix() {
      if (this._hasFlags(DisplayObjectFlags.InvalidInvertedMatrix)) {
        this._getMatrix().invertInto(this._invertedMatrix);
        this._removeFlags(DisplayObjectFlags.InvalidInvertedMatrix);
      }
      return this._invertedMatrix;
    }

    /**
     * Computes the combined transformation color matrixes of this display object and all of its ancestors.
     */
    _getConcatenatedColorTransform(): flash.geom.ColorTransform {
      if (!this.stage) {
        return this._colorTransform.clone();
      }
      // Compute the concatenated color transforms for this node and all of its ancestors.
      if (this._hasFlags(DisplayObjectFlags.InvalidConcatenatedColorTransform)) {
        var ancestor = this._findNearestAncestor(DisplayObjectFlags.InvalidConcatenatedColorTransform, false);
        var path = DisplayObject._getAncestors(this, ancestor);
        var i = path.length - 1;
        if (flash.display.Stage.isType(path[i])) {
          i--;
        }
        var m = ancestor && !flash.display.Stage.isType(ancestor) ? ancestor._concatenatedColorTransform.clone()
                                                                  : new geom.ColorTransform();
        while (i >= 0) {
          ancestor = path[i--];
          release || assert (ancestor._hasFlags(DisplayObjectFlags.InvalidConcatenatedColorTransform));
          m.preMultiply(ancestor._colorTransform);
          m.convertToFixedPoint();
          ancestor._concatenatedColorTransform.copyFrom(m);
          ancestor._removeFlags(DisplayObjectFlags.InvalidConcatenatedColorTransform);
        }
      }
      return this._concatenatedColorTransform;
    }

    _setColorTransform(colorTransform: flash.geom.ColorTransform) {
      this._colorTransform.copyFrom(colorTransform);
      this._colorTransform.convertToFixedPoint();
      this._propagateFlagsDown(DisplayObjectFlags.InvalidConcatenatedColorTransform);
      this._setDirtyFlags(DisplayObjectFlags.DirtyColorTransform);
    }

    /**
     * Invalidates the fill- and lineBounds of this display object along with all of its ancestors.
     */
    _invalidateFillAndLineBounds(fill: boolean, line: boolean): void {
      /* TODO: We should only propagate this bit if the bounds are actually changed. We can do the
       * bounds computation eagerly if the number of children is low. If there are no changes in the
       * bounds we don't need to propagate the bit. */
      this._propagateFlagsUp((line ? DisplayObjectFlags.InvalidLineBounds : 0) |
                             (fill ? DisplayObjectFlags.InvalidFillBounds : 0));
    }

    _invalidateParentFillAndLineBounds(fill: boolean, line: boolean): void {
      if (this._parent) {
        this._parent._invalidateFillAndLineBounds(fill, line);
      }
    }

    /**
     * Computes the bounding box for all of this display object's content, its graphics and all of its children.
     */
    _getContentBounds(includeStrokes: boolean = true): Bounds {
      // Tobias: What about filters?
      var invalidFlag: number;
      var bounds: Bounds;
      if (includeStrokes) {
        invalidFlag = DisplayObjectFlags.InvalidLineBounds;
        bounds = this._lineBounds;
      } else {
        invalidFlag = DisplayObjectFlags.InvalidFillBounds;
        bounds = this._fillBounds;
      }
      if (this._hasFlags(invalidFlag)) {
        var graphics: Graphics = this._getGraphics();
        if (graphics) {
          bounds.copyFrom(graphics._getContentBounds(includeStrokes));
        } else {
          bounds.setEmpty();
        }
        if (DisplayObjectContainer.isType(this)) {
          var container: DisplayObjectContainer = <DisplayObjectContainer>this;
          var children = container._children;
          for (var i = 0; i < children.length; i++) {
            bounds.unionInPlace(children[i]._getTransformedBounds(this, includeStrokes));
          }
        }
        this._removeFlags(invalidFlag);
      }
      return bounds;
    }

    /**
     * Gets the bounds of this display object relative to another coordinate space. The transformation
     * matrix from the local coordinate space to the target coordinate space is computed using:
     *
     *   this.concatenatedMatrix * inverse(target.concatenatedMatrix)
     *
     * If the |targetCoordinateSpace| is |null| then assume the identity coordinate space.
     */
    private _getTransformedBounds(targetCoordinateSpace: DisplayObject,
                                  includeStroke: boolean): Bounds {
      var bounds = this._getContentBounds(includeStroke).clone();
      if (targetCoordinateSpace === this || bounds.isEmpty()) {
        return bounds;
      }
      var m;
      if (targetCoordinateSpace) {
        m = geom.Matrix.TEMP_MATRIX;
        var invertedTargetMatrix = targetCoordinateSpace._getInvertedConcatenatedMatrix();
        invertedTargetMatrix.preMultiplyInto(this._getConcatenatedMatrix(), m);
      } else {
        m = this._getConcatenatedMatrix();
      }
      m.transformBounds(bounds);
      return bounds;
    }

    /**
     * Detaches this object from being animated by the timeline. This happens whenever a display
     * property of this object is changed by user code.
     */
    private _stopTimelineAnimation() {
      this._removeFlags(DisplayObjectFlags.AnimatedByTimeline);
    }

    /**
     * Marks this object as having its matrix changed.
     *
     * Propagates flags both up- and (via invalidatePosition) downwards, so is quite costly.
     * TODO: check if we can usefully combine all upwards-propagated flags here.
     */
    private _invalidateMatrix() {
      this._setDirtyFlags(DisplayObjectFlags.DirtyMatrix);
      this._setFlags(DisplayObjectFlags.InvalidMatrix | DisplayObjectFlags.InvalidInvertedMatrix);
      this._invalidatePosition();
    }

    /**
     * Marks this object as having been moved in its parent display object.
     */
    _invalidatePosition() {
      this._propagateFlagsDown(DisplayObjectFlags.InvalidConcatenatedMatrix |
                               DisplayObjectFlags.InvalidInvertedConcatenatedMatrix);
      this._invalidateParentFillAndLineBounds(true, true);
    }

    /**
     * Animates this object's display properties.
     */
    _animate(state: Shumway.Timeline.AnimationState): void {
      if (state.matrix) {
        this._setMatrix(state.matrix, false);
      }
      if (state.colorTransform) {
        this._setColorTransform(state.colorTransform);
      }
      this._ratio = state.ratio;
      this._name = state.name;
      // TODO: Not sure what is happening here, but state.clipDepth can be -1 after
      // |this._clipDepth| is set to a value larger than zero. This shouldnt' happen.
      // Tobias?? sbemaild50.swf
      if (this._clipDepth !== state.clipDepth && state.clipDepth >= 0) {
        this._clipDepth = state.clipDepth;
        this._setDirtyFlags(DisplayObjectFlags.DirtyClipDepth);
      }
      this._filters = state.filters;
      if (state.blendMode && state.blendMode !== this._blendMode) {
        this._blendMode = state.blendMode;
        this._setDirtyFlags(DisplayObjectFlags.DirtyMiscellaneousProperties);
      }
      if (state.cacheAsBitmap) {
        this._setFlags(flash.display.DisplayObjectFlags.CacheAsBitmap);
        this._setDirtyFlags(DisplayObjectFlags.DirtyMiscellaneousProperties);
      }
      if (state.visible !== this._hasFlags(DisplayObjectFlags.Visible)) {
        this._toggleFlags(DisplayObjectFlags.Visible, state.visible);
        this._setDirtyFlags(DisplayObjectFlags.DirtyMiscellaneousProperties);
      }
      // TODO: state.events
    }

    /**
     * Dispatches an event on this object and all its descendants.
     */
    _propagateEvent(event: flash.events.Event): void {
      this.visit(function (node) {
        node.dispatchEvent(event);
        return VisitorFlags.Continue;
      }, VisitorFlags.None);
    }

    get x(): number {
      var value = this._matrix.tx;
      if (this._canHaveTextContent()) {
        var bounds = this._getContentBounds();
        value += bounds.xMin;
      }
      return value / 20;
    }

    set x(value: number) {
      value = (value * 20) | 0;
      this._stopTimelineAnimation();
      if (this._canHaveTextContent()) {
        var bounds = this._getContentBounds();
        value -= bounds.xMin;
      }
      if (value === this._matrix.tx) {
        return;
      }
      this._matrix.tx = value;
      this._invertedMatrix.tx = -value;
      this._invalidatePosition();
      this._setDirtyFlags(DisplayObjectFlags.DirtyMatrix);
    }

    get y(): number {
      return this._matrix.ty / 20;
    }

    set y(value: number) {
      value = (value * 20) | 0;
      this._stopTimelineAnimation();
      if (value === this._matrix.ty) {
        return;
      }
      this._matrix.ty = value;
      this._invertedMatrix.ty = -value;
      this._invalidatePosition();
      this._setDirtyFlags(DisplayObjectFlags.DirtyMatrix);
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
      this._invalidateMatrix();
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
      this._invalidateMatrix();
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
      this._invalidateMatrix();
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
      return bounds.width / 20;
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
      var contentBounds = this._getContentBounds(true);
      if (this._canHaveTextContent()) {
        var bounds = this._getContentBounds();
        this._setFillAndLineBoundsFromWidthAndHeight(value, contentBounds.height);
        return;
      }
      var bounds = this._getTransformedBounds(this._parent, true);
      var angle = this._rotation / 180 * Math.PI;
      var baseWidth = contentBounds.getBaseWidth(angle);
      if (!baseWidth) {
        return;
      }
      var baseHeight = contentBounds.getBaseHeight(angle);
      this._scaleY = bounds.height / baseHeight;
      this._scaleX = value / baseWidth;
      this._invalidateMatrix();
    }

    /**
     * The height of this display object in its parent coordinate space.
     */
    get height(): number {
      var bounds = this._getTransformedBounds(this._parent, true);
      return bounds.height / 20;
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
      var contentBounds = this._getContentBounds(true);
      if (this._canHaveTextContent()) {
        var bounds = this._getContentBounds();
        this._setFillAndLineBoundsFromWidthAndHeight(contentBounds.width, value);
        return;
      }
      var bounds = this._getTransformedBounds(this._parent, true);
      var angle = this._rotation / 180 * Math.PI;
      var baseHeight = contentBounds.getBaseHeight(angle);
      if (!baseHeight) {
        return;
      }
      var baseWidth = contentBounds.getBaseWidth(angle);
      this._scaleY = value / baseHeight;
      this._scaleX = bounds.width / baseWidth;
      this._invalidateMatrix();
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
      this._setDirtyFlags(DisplayObjectFlags.DirtyMask);
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
          release || assert(flash.display.Stage.isType(node));
          return <flash.display.Stage>node;
        }
        node = node._parent;
      } while (node);
      return null;
    }

    get name(): string {
      return this._name ? this._name : "";
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
      return this._colorTransform.alphaMultiplier;
    }

    set alpha(value: number) {
      this._stopTimelineAnimation();
      value = +value;
      if (value === this._colorTransform.alphaMultiplier) {
        return;
      }
      this._colorTransform.alphaMultiplier = value;
      this._colorTransform.convertToFixedPoint();
      this._propagateFlagsDown(DisplayObjectFlags.InvalidConcatenatedColorTransform);
      this._setDirtyFlags(DisplayObjectFlags.DirtyColorTransform);
    }

    get blendMode(): string {
      return this._blendMode;
    }

    set blendMode(value: string) {
      this._stopTimelineAnimation();
      value = asCoerceString(value);
      if (value === this._blendMode) {
        return;
      }
      if (BlendMode.toNumber(value) < 0) {
        throwError("ArgumentError", Errors.InvalidEnumError, "blendMode");
      }
      this._blendMode = value;
      this._setDirtyFlags(DisplayObjectFlags.DirtyMiscellaneousProperties);
    }

    get scale9Grid(): flash.geom.Rectangle {
      return this._scale9Grid ? flash.geom.Rectangle.FromBounds(this._scale9Grid) : null;
    }

    set scale9Grid(innerRectangle: flash.geom.Rectangle) {
      this._stopTimelineAnimation();
      this._scale9Grid = Bounds.FromRectangle(innerRectangle);
      this._setDirtyFlags(DisplayObjectFlags.DirtyMiscellaneousProperties);
    }

    get cacheAsBitmap(): boolean {
      return this._filters.length > 0 || this._hasFlags(DisplayObjectFlags.CacheAsBitmap);
    }

    set cacheAsBitmap(value: boolean) {
      if (this._hasFlags(DisplayObjectFlags.CacheAsBitmap)) {
        return;
      }
      this._toggleFlags(DisplayObjectFlags.CacheAsBitmap, !!value);
      this._setDirtyFlags(DisplayObjectFlags.DirtyMiscellaneousProperties);
    }

    /**
     * References to the internal |_filters| array and its BitmapFilter objects are never leaked outside of this
     * class. The get/set filters accessors always return deep clones of this array.
     */
    get filters(): flash.filters.BitmapFilter [] {
      return this._filters.map(function (x: flash.filters.BitmapFilter) {
        return x.clone();
      });
    }

    set filters(value: flash.filters.BitmapFilter []) {
      var changed = false;
      if (isNullOrUndefined(value)) {
        changed = this.filters.length > 0;
        this._filters.length = 0;
      } else {
        this._filters = value.map(function (x: flash.filters.BitmapFilter) {
          release || assert (flash.filters.BitmapFilter.isType(x));
          return x.clone();
        });
        changed = true;
      }
      if (changed) {
        this._setDirtyFlags(DisplayObjectFlags.DirtyMiscellaneousProperties);
      }
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
      this._toggleFlags(DisplayObjectFlags.Visible, value);
      this._setDirtyFlags(DisplayObjectFlags.DirtyMiscellaneousProperties);
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
      targetCoordinateSpace = targetCoordinateSpace || this;
      return geom.Rectangle.FromBounds(this._getTransformedBounds(targetCoordinateSpace, true));
    }

    getRect(targetCoordinateSpace: DisplayObject): flash.geom.Rectangle {
      targetCoordinateSpace = targetCoordinateSpace || this;
      return geom.Rectangle.FromBounds(this._getTransformedBounds(targetCoordinateSpace, false));
    }

    /**
     * Converts a point from the global coordinate space into the local coordinate space.
     */
    globalToLocal(point: flash.geom.Point): flash.geom.Point {
      var m = this._getInvertedConcatenatedMatrix();
      var p = m.transformPointInPlace(point.clone().toTwips()).round();
      return p.toPixels();
    }

    /**
     * Converts a point form the local coordinate sapce into the global coordinate space.
     */
    localToGlobal(point: flash.geom.Point): flash.geom.Point {
      var m = this._getConcatenatedMatrix();
      var p = m.transformPointInPlace(point.clone().toTwips()).round();
      return p.toPixels();
    }

    /**
     * Tree visitor that lets you skip nodes or return early.
     */
    public visit(visitor: (DisplayObject) => VisitorFlags, visitorFlags: VisitorFlags, displayObjectFlags: DisplayObjectFlags = DisplayObjectFlags.None) {
      var stack: DisplayObject [];
      var displayObject: DisplayObject;
      var displayObjectContainer: DisplayObjectContainer;
      var frontToBack = visitorFlags & VisitorFlags.FrontToBack;
      stack = [this];
      while (stack.length > 0) {
        displayObject = stack.pop();
        var flags = VisitorFlags.None;
        if (visitorFlags & VisitorFlags.Filter && !displayObject._hasAnyFlags(displayObjectFlags)) {
          flags = VisitorFlags.Skip;
        } else {
          flags = visitor(displayObject);
        }
        if (flags === VisitorFlags.Continue) {
          var children = displayObject._children;
          if (children) {
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
        release || assert(root._loaderInfo, "No LoaderInfo object found on root.");
        return root._loaderInfo;
      }
      return null;
    }

    /**
     * Only these objects can have graphics.
     */
    _canHaveGraphics(): boolean {
      return false;
    }

    /**
     * Gets the graphics object of this object. Shapes, MorphShapes, and Sprites override this.
     */
    _getGraphics(): flash.display.Graphics {
      return null;
    }

    /**
     * Only these objects can have text content.
     */
    _canHaveTextContent(): boolean {
      return false;
    }

    /**
     * Gets the text content of this object. StaticTexts and TextFields override this.
     */
    _getTextContent(): Shumway.TextContent {
      return null;
    }

    /**
     * Lazily construct a graphics object.
     */
    _ensureGraphics(): flash.display.Graphics {
      release || assert (this._canHaveGraphics());
      if (this._graphics) {
        return this._graphics;
      }
      this._graphics = new flash.display.Graphics();
      this._graphics._setParent(this);
      this._invalidateFillAndLineBounds(true, true);
      this._setDirtyFlags(DisplayObjectFlags.DirtyGraphics);
      return this._graphics;
    }

    /**
     * Sets this object's graphics or text content. Happens when an animated Shape or StaticText
     * object is initialized from a symbol or replaced by a timeline command using the same symbol
     * as this object was initialized from.
     */
    _setStaticContentFromSymbol(symbol: Shumway.Timeline.DisplaySymbol) {
      release || assert(!symbol.dynamic);
      if (this._canHaveGraphics()) {
        release || assert(symbol instanceof Shumway.Timeline.ShapeSymbol);
        this._graphics = (<Shumway.Timeline.ShapeSymbol>symbol).graphics;
        this._setDirtyFlags(DisplayObjectFlags.DirtyGraphics);
      } else if (flash.text.StaticText.isType(this)) {
        release || assert(symbol instanceof Shumway.Timeline.TextSymbol);
        var textSymbol = <Shumway.Timeline.TextSymbol>symbol;
        (<flash.text.StaticText>this)._textContent = textSymbol.textContent;
        this._setDirtyFlags(DisplayObjectFlags.DirtyTextContent);
      }
      this._setFillAndLineBoundsFromSymbol(symbol);
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
      var aBounds = a._getContentBounds(false).clone();
      var bBounds = b._getContentBounds(false).clone();
      a._getConcatenatedMatrix().transformBounds(aBounds);
      b._getConcatenatedMatrix().transformBounds(bBounds);
      return aBounds.intersects(bBounds);
    }

    /**
     * The |x| and |y| arguments are in global coordinates. The |shapeFlag| indicates whether
     * the hit test should be on the actual pixels of the object |true| or just its bounding
     * box |false|. Use the |ignoreChildren| to only test the display object's graphics and
     * not its children.
     *
     * Note: shapeFlag and ignoreChildren are optional, but the type coercion will do the right
     * thing for them, so we don't need to take the overhead from being explicit about that.
     */
    hitTestPoint(x: number, y: number, shapeFlag: boolean,
                 ignoreChildren: boolean, ignoreClipping: boolean = true): boolean {
      x = +x * 20 | 0;
      y = +y * 20 | 0;
      shapeFlag = !!shapeFlag;
      ignoreChildren = !!ignoreChildren;
      ignoreClipping = !!ignoreClipping;
      var matrix = this._getInvertedConcatenatedMatrix();
      var localX = matrix.transformX(x, y);
      var localY = matrix.transformY(x, y);
      return this._containsPoint(localX, localY, shapeFlag, ignoreChildren, ignoreClipping);
    }

    /**
     * Returns true if the given global coordinates hit the shape of this object.
     *
     * Overridden in SimpleButton.
     */
    _isUnderMouse(x: number, y: number): boolean
    {
      var matrix = this._getInvertedConcatenatedMatrix();
      var localX = matrix.transformX(x, y);
      var localY = matrix.transformY(x, y);
      return this._containsPoint(localX, localY, true, false, false);
    }

    /**
     * Same as |hitTestPoint| but the point is in local coordinate space and in twips.
     */
    _containsPoint(x: number, y: number, shapeFlag: boolean,
                   ignoreChildren: boolean, ignoreClipping: boolean): boolean
    {
      if (!this._getContentBounds().contains(x, y)) {
        return false;
      }
      if (!shapeFlag) {
        return true;
      }
      if (this._mask) {
        var matrix = this._mask._getInvertedMatrix();
        var maskX = matrix.transformX(x, y);
        var maskY = matrix.transformY(x, y);
        if (!this._mask._containsPoint(maskX, maskY, shapeFlag, ignoreChildren, ignoreClipping)) {
          return false;
        }
      }
      /* TODO: Figure out if we need to test against the graphics path first and exit early instead of
       * going down the children list. Testing the path can be more expensive sometimes, more so than
       * testing the children. */
      if (!ignoreChildren && DisplayObjectContainer.isType(this)) {
        var children = (<DisplayObjectContainer>this)._children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var matrix = child._getInvertedMatrix();
          var childX = matrix.transformX(x, y);
          var childY = matrix.transformY(x, y);
          var result = child._containsPoint(childX, childY,
                                            shapeFlag, ignoreChildren, ignoreClipping);
          if (!ignoreClipping && child._clipDepth >= 0 && child._parent) {
            if (!result) {
              i = child._parent.getClipDepthIndex(child._clipDepth);
            }
          } else if (result) {
            return true;
          }
        }
      }
      var graphics = this._getGraphics();
      if (graphics) {
        // TODO: split this up into internal and external versions.
        // The external one must include strokes, the internal shouldn't do the argument validation.
        return graphics._containsPoint(x, y, true);
      }
      return false;
    }
    get scrollRect(): flash.geom.Rectangle {
      return this._scrollRect ? this._scrollRect.clone() : null;
    }

    set scrollRect(value: flash.geom.Rectangle) {
      value = value;
      this._scrollRect = value ? value.clone() : null;
      /* TODO: Figure out how to deal with the bounds and hit testing when scroll rects are applied.
       * The Flash implementation appears to be broken. */
      notImplemented("public DisplayObject::set scrollRect");
      return;
    }

    get opaqueBackground(): any {
      return this._opaqueBackground;
    }

    /**
     * Sets the opaque background color. By default this is |null|, which indicates that no opaque color is set.
     * Otherwise this is an unsinged number.
     */
    set opaqueBackground(value: any) {
      release || assert (value === null || Shumway.isInteger(value));
      this._opaqueBackground = value;
    }

    /**
     * Finds the furthest interactive ancestor (or self) to receive pointer events for this object.
     */
    public findFurthestInteractiveAncestorOrSelf(): InteractiveObject {
      var find = InteractiveObject.isType(this) ? <InteractiveObject>this : this._parent;
      var self = this._parent;
      while (self) {
        if (!self.mouseChildren) {
          find = self;
        }
        self = self._parent;
      }
      return find;
    }

    /**
     * Returns the distance between this object and a given ancestor.
     */
    private _getDistance(ancestor: DisplayObject): number {
      var d = 0;
      var node = this;
      while (node !== ancestor) {
        d++;
        node = node._parent;
      }
      return d;
    }

    /**
     * Finds the nearest common ancestor with a given node.
     */
    findNearestCommonAncestor(node: DisplayObject): DisplayObject {
      if (!node) {
        return null;
      }
      var ancestor = this;
      var d1 = ancestor._getDistance(null);
      var d2 = node._getDistance(null);
      while (d1 > d2) {
        ancestor = ancestor._parent;
        d1--;
      }
      while (d2 > d1) {
        node = node._parent;
        d2--;
      }
      while (ancestor !== node) {
        ancestor = ancestor._parent;
        node = node._parent;
      }
      return ancestor;
    }

    get mouseX(): number {
      return this.globalToLocal(flash.ui.Mouse._currentPosition).x;
    }

    get mouseY(): number {
      return this.globalToLocal(flash.ui.Mouse._currentPosition).y;
    }

    public debugName(): string {
      return this._id + " [" + this._depth + "]: (" + this._referenceCount + ") " + this;
    }

    public debugTrace(maxDistance = 1024, name = "") {
      var self = this;
      var writer = new IndentingWriter();
      this.visit(function (node) {
        var distance = node._getDistance(self);
        if (distance > maxDistance) {
          return VisitorFlags.Skip;
        }
        var prefix = name + Shumway.StringUtilities.multiple(" ", distance);
        writer.writeLn(prefix + node.debugName());
        return VisitorFlags.Continue;
      }, VisitorFlags.None);
    }

    _addReference() {
      this._referenceCount++;
    }

    _removeReference() {
      // TODO: Uncomment this assertion once we're sure reference counting works correctly.
      // assert (this._referenceCount > 0);
      this._referenceCount--;
      if (this._referenceCount !== 0 || !this._children) {
        return;
      }
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        children[i]._removeReference();
      }
    }

    // ---------------------------------------------------------------------------------------------------------------------------------------------
    // -- Stuff below we still need to port.                                                                                                      --
    // ---------------------------------------------------------------------------------------------------------------------------------------------

    /*
    set blendShader(value: flash.display.Shader) {
      value = value;
      notImplemented("public DisplayObject::set blendShader"); return;
      // this._blendShader = value;
    }

     get accessibilityProperties(): flash.accessibility.AccessibilityProperties {
     return this._accessibilityProperties;
     }

     set accessibilityProperties(value: flash.accessibility.AccessibilityProperties) {
     value = value;
     notImplemented("public DisplayObject::set accessibilityProperties"); return;
     // this._accessibilityProperties = value;
     }
   */
  }
}
