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

///<reference path='../references.ts' />
module Shumway.AVMX.AS.flash.display {
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import mixHash = Shumway.HashUtilities.mixHash;
  import checkParameterType = Shumway.AVMX.checkParameterType;
  import clamp = Shumway.NumberUtilities.clamp;
  import Multiname = Shumway.AVMX.Multiname;

  import events = flash.events;
  import VisitorFlags = flash.display.VisitorFlags;

  export const enum LookupChildOptions {
    DEFAULT = 0,
    IGNORE_CASE = 1,
    INCLUDE_NON_INITIALIZED = 2
  }

  export class DisplayObjectContainer extends flash.display.InteractiveObject {
    static bindings: string [] = null;
    static classSymbols: string [] = null;
    static classInitializer: any = null;


    constructor () {
      super();
      if (!this._fieldsInitialized) {
        this._initializeFields();
      }
      this._setDirtyFlags(DisplayObjectDirtyFlags.DirtyChildren);
    }

    protected _initializeFields() {
      super._initializeFields();
      this._tabChildren = true;
      this._mouseChildren = true;
      // Might already have been initialized from a symbol.
      this._children = this._children || [];
    }

    private _tabChildren: boolean;
    private _mouseChildren: boolean;

    /**
     * This object's children have changed.
     */
    private _invalidateChildren() {
      this._setDirtyFlags(DisplayObjectDirtyFlags.DirtyChildren);
      this._invalidateFillAndLineBounds(true, true);
    }

    /**
     * Propagates flags down the display list. Propagation stops if all flags are already set.
     */
    _propagateFlagsDown(flags: DisplayObjectFlags) {
      if (this._hasFlags(flags)) {
        return;
      }
      this._setFlags(flags);
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        children[i]._propagateFlagsDown(flags);
      }
    }

    /**
     * Calls the constructors of new children placed by timeline commands.
     */
    _constructChildren(): void {
      release || counter.count("DisplayObjectContainer::_constructChildren");

      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child._hasFlags(DisplayObjectFlags.Constructed)) {
          continue;
        }
        (<any>child).axInitializer();
        //child.class.instanceConstructorNoInitialize.call(child);
        child._removeReference();
        if (child._name) {
          this.axSetPublicProperty(child._name, child);
          //child._addReference();
        }
        child._setFlags(DisplayObjectFlags.Constructed);

        var eventClass = this.sec.flash.events.Event.axClass;
        if (child._hasFlags(DisplayObjectFlags.HasPlaceObjectInitPending)) {
          child._removeFlags(DisplayObjectFlags.HasPlaceObjectInitPending);

          var avm1Context = child._symbol.avm1Context;
          Shumway.AVM1.Lib.initializeAVM1Object(child, avm1Context, child._placeObjectTag);

          try {
            child.dispatchEvent(eventClass.getInstance(events.Event.AVM1_INIT));
          } catch (e) {
            Debug.warning('caught error under DisplayObjectContainer AVM1_INIT event: ', e);
          }
          try {
            child.dispatchEvent(eventClass.getInstance(events.Event.AVM1_CONSTRUCT));
          } catch (e) {
            Debug.warning('caught error under DisplayObjectContainer AVM1_CONSTRUCT event: ', e);
          }
          if (child.hasEventListener(events.Event.AVM1_LOAD)) {
            child._setFlags(DisplayObjectFlags.NeedsLoadEvent);
            this._propagateFlagsUp(DisplayObjectFlags.ContainsFrameScriptPendingChildren);
          }
        }

        try {
          child.dispatchEvent(eventClass.getInstance(events.Event.ADDED, true));
        } catch (e) {
          Debug.warning('caught error under DisplayObject ADDED event: ', e);
        }
        if (child.stage) {
          try {
            child.dispatchEvent(eventClass.getInstance(events.Event.ADDED_TO_STAGE));
          } catch (e) {
            Debug.warning('caught error under DisplayObject ADDED_TO_STAGE event: ', e);
          }
        }
      }
    }

    _enqueueFrameScripts() {
      if (this._hasFlags(DisplayObjectFlags.ContainsFrameScriptPendingChildren)) {
        this._removeFlags(DisplayObjectFlags.ContainsFrameScriptPendingChildren);
        var children = this._children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (this.sec.flash.display.DisplayObjectContainer.axIsType(child) ||
              this.sec.flash.display.AVM1Movie.axIsType(child)) {
            (<DisplayObjectContainer>child)._enqueueFrameScripts();
          }
        }
      }
    }

    get numChildren(): number {
      return this._getNumChildren();
    }
    // `get numChildren` is overridden in `Stage` and has to be able to call this.
    _getNumChildren(): number {
      return this._children.length;
    }

    get textSnapshot(): flash.text.TextSnapshot {
      notImplemented("public DisplayObjectContainer::get textSnapshot"); return;
      // return this._textSnapshot;
    }

    get tabChildren(): boolean {
      return this._getTabChildren();
    }
    // `get tabChildren` is overridden in `Stage` and has to be able to call this.
    _getTabChildren(): boolean {
      return this._tabChildren;
    }

    set tabChildren(enable: boolean) {
      this._setTabChildren(enable);
    }
    // `set tabChildren` is overridden in `Stage` and has to be able to call this.
    _setTabChildren(enable: boolean) {
      enable = !!enable;

      var old = this._tabChildren;
      this._tabChildren = enable;
      if (old !== enable) {
        this.dispatchEvent(this.sec.flash.events.Event.axClass.getInstance(events.Event.TAB_CHILDREN_CHANGE, true));
      }
    }

    get mouseChildren(): boolean {
      return this._getMouseChildren();
    }
    // `get mouseChildren` is overridden in `Stage` and has to be able to call this.
    _getMouseChildren(): boolean {
      return this._mouseChildren;
    }

    set mouseChildren(enable: boolean) {
      this._setMouseChildren(enable);
    }
    // `set mouseChildren` is overridden in `Stage` and has to be able to call this.
    _setMouseChildren(enable: boolean) {
      this._mouseChildren = !!enable;
    }

    addChild(child: DisplayObject): DisplayObject {
      return this.addChildAt(child, this._children.length);
    }

    /**
     * Adds a child at a given index. The index must be within the range [0 ... children.length].
     * Note that this is different than the range setChildIndex expects.
     */
    addChildAt(child: DisplayObject, index: number /*int*/): DisplayObject {
      checkParameterType(child, "child", this.sec.flash.display.DisplayObject.axClass);
      release || counter.count("DisplayObjectContainer::addChildAt");

      index = index | 0;

      release || assert (child._hasFlags(DisplayObjectFlags.Constructed), "Child is not fully constructed.");
      if (child === this) {
        this.sec.throwError('ArgumentError', Errors.CantAddSelfError);
      }
      if (this.sec.flash.display.DisplayObjectContainer.axIsType(child) &&
          (<DisplayObjectContainer>child).contains(this)) {
        this.sec.throwError('ArgumentError', Errors.CantAddParentError);
      }
      var children = this._children;
      if (index < 0 || index > children.length) {
        this.sec.throwError('RangeError', Errors.ParamRangeError);
      }

      if (child._parent === this) {
        this.setChildIndex(child, clamp(index, 0, children.length - 1));
        return child;
      }

      // TODO: check what happens if a listener for REMOVE throws an error. Does the element get
      // reparented nevertheless?
      if (child._parent) {
        // Loader overrides removeChildAt to throw an exception. We still want to use it, so we
        // always call the original version here.
        DisplayObjectContainer.prototype.removeChildAt.call(child._parent,
                                                            child._parent.getChildIndex(child));
        // The children list could have been mutated as a result of |removeChild|.
        index = clamp(index, 0, children.length);
      }
      for (var i = children.length - 1; i >= index; i--) {
        children[i]._index++;
      }
      children.splice(index, 0, child);
      child._setParent(this, -1);
      child._index = index;
      child._invalidatePosition();
      this._invalidateChildren();
      child._addReference();
      child.dispatchEvent(this.sec.flash.events.Event.axClass.getInstance(events.Event.ADDED, true));
      // ADDED event handlers may remove the child from the stage, in such cases
      // we should not dispatch the ADDED_TO_STAGE event.
      if (child.stage) {
        child._propagateEvent(this.sec.flash.events.Event.axClass.getInstance(events.Event.ADDED_TO_STAGE));
      }
      return child;
    }

    /**
     * Adds a timeline object to this container. The new child is added after the last object that
     * exists at a smaller depth, or before the first object that exists at a greater depth. If no
     * other timeline object is found, the new child is added to the front(top) of all other
     * children.
     *
     * Note that this differs from `addChildAt` in that the depth isn't an index in the `children`
     * array, and doesn't have to be in the dense range [0..children.length].
     */
    addTimelineObjectAtDepth(child: flash.display.DisplayObject, depth: number /*int*/) {
      release || counter.count("DisplayObjectContainer::addTimelineObjectAtDepth");

      depth = depth | 0;

      var children = this._children;
      var maxIndex = children.length - 1;
      var index = maxIndex + 1;
      for (var i = maxIndex; i >= 0; i--) {
        var current = children[i];
        if (current._depth > -1) {
          if (current._depth < depth) {
            index = i + 1;
            break;
          }
          index = i;
        }
      }

      if (index > maxIndex) {
        children.push(child);
        child._index = index;
      } else {
        children.splice(index, 0, child);
        for (var i = index; i < children.length; i++) {
          children[i]._index = i;
        }
      }
      child._setParent(this, depth);
      child._invalidatePosition();
      this._invalidateChildren();
    }

    removeChild(child: DisplayObject): DisplayObject {
      checkParameterType(child, "child", this.sec.flash.display.DisplayObject.axClass);
      return this.removeChildAt(this.getChildIndex(child));
    }

    removeChildAt(index: number): DisplayObject {
      release || counter.count("DisplayObjectContainer::removeChildAt");

      index = index | 0;

      var children = this._children;
      if (index < 0 || index >= children.length) {
        this.sec.throwError('RangeError', Errors.ParamRangeError);
      }

      var child = children[index];
      if (child._hasFlags(DisplayObjectFlags.Constructed)) {
        child.dispatchEvent(this.sec.flash.events.Event.axClass.getInstance(events.Event.REMOVED, true));
        if (this.stage) {
          child._propagateEvent(this.sec.flash.events.Event.axClass.getInstance(events.Event.REMOVED_FROM_STAGE));
        }
        // Children list might have been mutated by the REMOVED or REMOVED_FROM_STAGE event,
        // we may need to operate on the new index of the child.
        index = this.getChildIndex(child);
      }

      children.splice(index, 1);
      for (var i = children.length - 1; i >= index; i--) {
        children[i]._index--;
      }
      child._setParent(null, -1);
      child._index = -1;
      child._invalidatePosition();
      this._invalidateChildren();
      return child;
    }

    getChildIndex(child: DisplayObject): number /*int*/ {
      checkParameterType(child, "child", this.sec.flash.display.DisplayObject.axClass);
      if (child._parent !== this) {
        this.sec.throwError('ArgumentError', Errors.NotAChildError);
      }
      return child._index;
    }

    /**
     * Sets the index of a child. The index must be within the range [0 ... children.length - 1].
     */
    setChildIndex(child: DisplayObject, index: number /*int*/): void {
      index = index | 0;
      checkParameterType(child, "child", this.sec.flash.display.DisplayObject.axClass);
      var children = this._children;
      if (index < 0 || index >= children.length) {
        this.sec.throwError('RangeError', Errors.ParamRangeError);
      }
      if (child._parent !== this) {
        this.sec.throwError('ArgumentError', Errors.NotAChildError);
      }
      child._setDepth(-1);
      var currentIndex = this.getChildIndex(child);
      if (children.length === 1 || currentIndex === index) {
        return;
      }
      if (index === currentIndex + 1 || index === currentIndex - 1) {
        // We can't call |swapChildrenAt| here because we don't want to affect the depth value.
        this._swapChildrenAt(currentIndex, index);
      } else {
        children.splice(currentIndex, 1);
        children.splice(index, 0, child);
        var i = currentIndex < index ? currentIndex : index;
        while (i < children.length) {
          children[i]._index = i++;
        }
      }
      this._invalidateChildren();
    }

    getChildAt(index: number): DisplayObject {
      index = index | 0;

      var children = this._children;
      if (index < 0 || index >= children.length) {
        this.sec.throwError('RangeError', Errors.ParamRangeError);
      }

      var child = this._lookupChildByIndex(index, LookupChildOptions.DEFAULT);
      if (!child) {
        return null;
      }

      child._addReference();
      return child;
    }

    /**
     * Returns the timeline object that exists at the specified depth.
     */
    getTimelineObjectAtDepth(depth: number /*int*/): flash.display.DisplayObject {
      depth = depth | 0;
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child._depth > depth) {
          break;
        }
        if (child._depth === depth) {
          return child;
        }
      }
      return null;
    }

    /**
     * Returns the last child index that is covered by the clip depth.
     */
    getClipDepthIndex(depth: number): number {
      depth = depth | 0;
      var children = this._children;
      var index = this._children.length - 1;
      var first = true;
      for (var i = index; i >= 0; i--) {
        var child = children[i];
        // Ignore children that don't have a depth value.
        if (child._depth < 0) {
          continue;
        } 
        // Usually we return the index of the first child that has a depth value less than or
        // equal to the specified depth. However, Flash seems to clip all remaining children,
        // including those that don't have a depth value if the clip appears at the end.
        if (child._depth <= depth) {
          return first ? index : i;
        }
        first = false;
      }
      return 0;
    }

    getChildByName(name: string): DisplayObject {
      name = axCoerceString(name);

      var child = this._lookupChildByName(name, LookupChildOptions.DEFAULT);
      if (child) {
        child._addReference();
        return child;
      }

      return null;
    }

    /**
     * Returns the child display object instance that exists at given index without creating a
     * reference nor taking ownership.
     */
    _lookupChildByIndex(index: number, options: LookupChildOptions): DisplayObject {
      var child = this._children[index];
      if (child && (child._hasFlags(DisplayObjectFlags.Constructed) ||
                    options & LookupChildOptions.INCLUDE_NON_INITIALIZED)) {
        return child;
      }
      return null;
    }

    /**
     * Returns the child display object that exists with given name without creating a reference
     * nor taking ownership.
     */
    _lookupChildByName(name: string, options: LookupChildOptions): DisplayObject {
      var children = this._children;
      if (children.length === 0) {
        return null;
      }

      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (!child._hasFlags(DisplayObjectFlags.Constructed) &&
            !(options & LookupChildOptions.INCLUDE_NON_INITIALIZED)) {
          continue;
        }
        if (child._name === name) {
          return child;
        }
      }

      if (!(options & LookupChildOptions.IGNORE_CASE)) {
        return null;
      }

      // Trying again in non-case sensitive mode (mostly for AVM1).
      name = name.toLowerCase();
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (!child._hasFlags(DisplayObjectFlags.Constructed) &&
          !(options & LookupChildOptions.INCLUDE_NON_INITIALIZED)) {
          continue;
        }
        if (child._name.toLowerCase() === name) {
          return child;
        }
      }
      return null;
    }

    /**
     * Override of DisplayObject#_containsPoint that takes children into consideration.
     */
    _containsPoint(globalX: number, globalY: number, localX: number, localY: number,
                   testingType: HitTestingType, objects: DisplayObject[]): HitTestingResult {
      return this._containsPointImpl(globalX, globalY, localX, localY, testingType, objects, false);
    }

    _containsPointImpl(globalX: number, globalY: number, localX: number, localY: number,
                               testingType: HitTestingType, objects: DisplayObject[],
                               skipBoundsCheck: boolean): HitTestingResult {
      var result: HitTestingResult;
      if (!skipBoundsCheck) {
        result = this._boundsAndMaskContainPoint(globalX, globalY, localX, localY, testingType);
        // Same as in the DisplayObject base case, we're done if we don't have a hit or are only
        // looking for bounds + mask checks.
        if (result === HitTestingResult.None || testingType < HitTestingType.HitTestShape) {
          return result;
        }
      }

      var anyChildHit = false;
      var children = this._getUnclippedChildren(testingType, globalX, globalY);
      for (var i = children ? children.length : 0; i--; ) {
        var child = children[i];
        if (child._maskedObject) {
          continue;
        }
        result = child._containsGlobalPoint(globalX, globalY, testingType, objects);
        if (result !== HitTestingResult.Shape) {
          continue;
        }
        // For hit testing, a single match suffices.
        if (testingType < HitTestingType.Mouse) {
          return result;
        }
        anyChildHit = true;
        if (testingType >= HitTestingType.ObjectsUnderPoint) {
          continue;
        }
        release || assert(testingType === HitTestingType.Mouse);
        release || assert(objects.length <= 1);
        // If this object itself is mouse-disabled, we have to ensure that no nested object is
        // returned as a result.
        if (!this._mouseEnabled) {
          objects.length = 0;
          return result;
        }
        // If this container disables mouseChildren, any matched child establish the container as
        // the match.
        if (!this._mouseChildren) {
          objects[0] = this;
        }
        if (objects.length !== 0) {
          release || assert(this.sec.flash.display.InteractiveObject.axIsType(objects[0]));
          return HitTestingResult.Shape;
        }
      }
      // We need to always test the container itself for getObjectsUnderPoint or when looking for a
      // drop target. Otherwise, it's only required if no child (interactive or not) was hit.
      if (anyChildHit && testingType < HitTestingType.ObjectsUnderPoint) {
        if (testingType === HitTestingType.Mouse && objects.length === 0) {
          objects[0] = this;
        }
        return HitTestingResult.Shape;
      }
      var selfHit = this._containsPointDirectly(localX, localY, globalX, globalY);
      if (selfHit) {
        if (testingType === HitTestingType.Drop) {
          // For Drop, replace previous hit with current one.
          objects[0] = this;
        } else if (testingType === HitTestingType.ObjectsUnderPoint || objects && this._mouseEnabled) {
          objects.push(this);
        }
      }
      return anyChildHit || selfHit ? HitTestingResult.Shape : HitTestingResult.None;
    }

    private _getUnclippedChildren(testingType, globalX, globalY) {
      // Clipping masks complicate hit testing: for mouse target finding, where performance is
      // most important, we want to test highest children first, then go down. OTOH, we want to
      // test clipping masks before the elements they clip, potentially saving costly tests against
      // lots of elements. However, clipping masks affect siblings with higher child indices, so
      // by going top-to-bottom, we discover them after the clipped content. To get around that,
      // we iterate over the children once and detect any clipping masks. If we find at least one,
      // we copy all the non-clipped elements into a new array, over which we then iterate without
      // having to test clipping.
      // Note: if speed is an issue, we could set a flag on containers that have at least one
      // clipping mask and do this step only if that flag is set.
      var children = this._children;
      if (!children) {
        return null;
      }
      var unclippedChildren: DisplayObject[]; // Lazily created.
      for (var i = 0; children && i < children.length; i++) {
        var child = children[i];
        if (child._clipDepth !== -1) {
          if (!unclippedChildren) {
            unclippedChildren = children.slice(0, i);
          }
          // Clipping masks are simply ignored for HitTestPoint purposes.
          if (testingType === HitTestingType.HitTestShape) {
            continue;
          }
          release || assert(testingType >= HitTestingType.Mouse);
          // If the point isn't contained in the clipping mask, we can skip all the clipped objects.
          // We pass HitTestShape here because we never want to collect hit objects, which the
          // higher testing types would attempt to do.
          var containsPoint = child._containsGlobalPoint(globalX, globalY,
                                                         HitTestingType.HitTestShape, null);
          if (!containsPoint) {
            i = this.getClipDepthIndex(child._clipDepth);
          }
          continue;
        }
        if (unclippedChildren) {
          unclippedChildren.push(child);
        }
      }
      return unclippedChildren || children;
    }

    /**
     * Override of DisplayObject#_getChildBounds that union all childrens's
     * bounds into the bounds.
     */
    _getChildBounds(bounds: Bounds, includeStrokes: boolean) {
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        bounds.unionInPlace(children[i]._getTransformedBounds(this, includeStrokes));
      }
    }

    /**
     * Returns an array of all leaf objects under the given point in global coordinates.
     * A leaf node in this context is an object that itself contains visual content, so it can be
     * any of Shape, Sprite, MovieClip, Bitmap, Video, and TextField.
     * Note that, while the Flash documentation makes it sound like it doesn't, the result also
     * contains the receiver object if that matches the criteria above.
     */
    getObjectsUnderPoint(globalPoint: flash.geom.Point): ASArray {
      release || counter.count("DisplayObjectContainer::getObjectsUnderPoint");

      var globalX = globalPoint.x * 20 | 0;
      var globalY = globalPoint.y * 20 | 0;
      var objects = [];
      this._containsGlobalPoint(globalX, globalY, HitTestingType.ObjectsUnderPoint, objects);
      // getObjectsUnderPoint returns results in exactly the opposite order we collect them in.
      return this.sec.createArrayUnsafe(objects.reverse());
    }

    areInaccessibleObjectsUnderPoint(point: flash.geom.Point): boolean {
      point = point;
      notImplemented("public DisplayObjectContainer::areInaccessibleObjectsUnderPoint"); return;
    }

    contains(child: DisplayObject): boolean {
      checkParameterType(child, "child", this.sec.flash.display.DisplayObject.axClass);
      return this._isAncestor(child);
    }

    swapChildrenAt(index1: number /*int*/, index2: number /*int*/): void {
      index1 = index1 | 0; index2 = index2 | 0;

      var children = this._children;
      if (index1 < 0 || index1 >= children.length ||
          index2 < 0 || index2 >= children.length) {
        this.sec.throwError('RangeError', Errors.ParamRangeError);
      }

      // Always call _swapChildrenAt to make sure _setDepth(-1) is called on both children.
      this._swapChildrenAt(index1, index2);

      if (index1 !== index2) {
        this._invalidateChildren();
      }
    }

    private _swapChildrenAt(index1: number, index2: number) {
      var children = this._children;
      var child1 = children[index1];
      var child2 = children[index2];
      children[index2] = child1;
      child1._setDepth(-1);
      child1._index = index2;
      children[index1] = child2;
      child2._setDepth(-1);
      child2._index = index1;
    }

    swapChildren(child1: DisplayObject, child2: DisplayObject): void {
      // Flash prints out 'child' for both non-null |child1| and |child2|.
      checkParameterType(child1, "child", this.sec.flash.display.DisplayObject.axClass);
      checkParameterType(child2, "child", this.sec.flash.display.DisplayObject.axClass);
      this.swapChildrenAt(this.getChildIndex(child1), this.getChildIndex(child2));
    }

    removeChildren(beginIndex: number = 0, endIndex: number = 2147483647): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;

      if (beginIndex < 0 || endIndex < 0 || endIndex < beginIndex || endIndex >= this._children.length) {
        this.sec.throwError('RangeError', Errors.ParamRangeError);
      }

      var count = endIndex - beginIndex + 1;
      if (count > 0) {
        while (count--) {
          this.removeChildAt(beginIndex);
        }
      }
    }

    public hashCode(): number {
      var hash = 0;
      for (var i = 0; i < this.numChildren; i++) {
        var child = this.getChildAt(i);
        if (child) {
          hash = mixHash(hash, this.getChildAt(i).hashCode());
        }
      }
      return mixHash(hash, this.getBounds(null).hashCode());
    }

    /**
     * This is a very slow recursive function that should not be used in performance critical code.
     */
    public getAncestorCount(): number {
      var count = 0;
      for (var i = 0; i < this.numChildren; i++) {
        var child = this.getChildAt(i);
        if (child) {
          count += 1 + this.getChildAt(i).getAncestorCount();
        }
      }
      return count;
    }
  }
}
