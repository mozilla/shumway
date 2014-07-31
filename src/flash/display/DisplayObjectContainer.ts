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
module Shumway.AVM2.AS.flash.display {
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import clamp = Shumway.NumberUtilities.clamp;
  import Multiname = Shumway.AVM2.ABC.Multiname;

  import events = flash.events;
  import VisitorFlags = flash.display.VisitorFlags;

  export class DisplayObjectContainer extends flash.display.InteractiveObject {
    static bindings: string [] = null;
    static classSymbols: string [] = null;
    static classInitializer: any = null;

    static initializer: any = function () {
      var self: DisplayObjectContainer = this;
      self._tabChildren = true;
      self._mouseChildren = true;
      self._children = [];
    };

    constructor () {
      false && super();
      InteractiveObject.instanceConstructorNoInitialize.call(this);
      this._setDirtyFlags(DisplayObjectFlags.DirtyChildren);
    }

    private _tabChildren: boolean;
    private _mouseChildren: boolean;

    /**
     * This object's children have changed.
     */
    private _invalidateChildren() {
      this._setDirtyFlags(DisplayObjectFlags.DirtyChildren);
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
        child.class.instanceConstructorNoInitialize.call(child);
        child._removeReference();
        if (child._name) {
          this[Multiname.getPublicQualifiedName(child._name)] = child;
          //child._addReference();
        }
        child._setFlags(DisplayObjectFlags.Constructed);

        //if (!loader._isAvm2Enabled) {
        //  this._initAvm1Bindings(instance, name, displayListItem.events,
        //    's' + props.symbolId + 'c');
        //  instance._dispatchEvent("init");
        //  instance._dispatchEvent("construct");
        //  instance._needLoadEvent = true;
        //} else {
        //  instance._dispatchEvent("load");
        //}

        child.dispatchEvent(events.Event.getInstance(events.Event.ADDED, true));
        if (child.stage) {
          child.dispatchEvent(events.Event.getInstance(events.Event.ADDED_TO_STAGE));
        }
      }
    }

    _enqueueFrameScripts() {
      if (this._hasFlags(DisplayObjectFlags.ContainsFrameScriptPendingChildren)) {
        this._removeFlags(DisplayObjectFlags.ContainsFrameScriptPendingChildren);
        var children = this._children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (DisplayObjectContainer.isType(child)) {
            (<DisplayObjectContainer>child)._enqueueFrameScripts();
          }
        }
      }
    }

    get numChildren(): number {
      return this._children.length;
    }

    get textSnapshot(): flash.text.TextSnapshot {
      notImplemented("public DisplayObjectContainer::get textSnapshot"); return;
      // return this._textSnapshot;
    }

    get tabChildren(): boolean {
      return this._tabChildren;
    }

    set tabChildren(enable: boolean) {
      enable = !!enable;

      var old = this._tabChildren;
      this._tabChildren = enable;
      if (old !== enable) {
        this.dispatchEvent(events.Event.getInstance(events.Event.TAB_CHILDREN_CHANGE, true));
      }
    }

    get mouseChildren(): boolean {
      return this._mouseChildren;
    }

    set mouseChildren(enable: boolean) {
      this._mouseChildren = !!enable;
    }

    addChild(child: DisplayObject): DisplayObject {
      return this.addChildAt(child, this._children.length);
    }

    addChildAt(child: DisplayObject, index: number /*int*/): DisplayObject {
      release || counter.count("DisplayObjectContainer::addChildAt");

      index = index | 0;

      release || assert (child._hasFlags(DisplayObjectFlags.Constructed), "Child is not fully constructed.");
      if (child === this) {
        throwError('ArgumentError', Errors.CantAddSelfError);
      }
      if (DisplayObjectContainer.isType(child) && (<DisplayObjectContainer>child).contains(this)) {
        throwError('ArgumentError', Errors.CantAddParentError);
      }
      var children = this._children;
      if (index < 0 || index > children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }

      if (child._parent === this) {
        this.setChildIndex(child, index);
        return child;
      }

      if (child._parent) {
        child._parent.removeChild(child);
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
      child.dispatchEvent(events.Event.getInstance(events.Event.ADDED, true));
      // ADDED event handlers may remove the child from the stage, in such cases
      // we should not dispatch the ADDED_TO_STAGE event.
      if (child.stage) {
        child._propagateEvent(events.Event.getInstance(events.Event.ADDED_TO_STAGE));
      }
      this._invalidateChildren();
      child._addReference();
      return child;
    }

    /**
     * Adds a timeline object to this container. The new child is added after the last object that
     * exists at a smaller depth, or before the first object that exists at a greater depth. If no
     * other timeline object is found, the new child is added to the front(top) of all other children.
     */
    addChildAtDepth(child: flash.display.DisplayObject, depth: number /*int*/) {
      release || counter.count("DisplayObjectContainer::addChildAtDepth");

      depth = depth | 0;

      var children = this._children;
      var maxIndex = children.length - 1;
      var index = maxIndex + 1;
      for (var i = maxIndex; i >= 0; i--) {
        var current = children[i];
        if (current._depth) {
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
      return this.removeChildAt(this.getChildIndex(child));
    }

    removeChildAt(index: number): DisplayObject {
      release || counter.count("DisplayObjectContainer::removeChildAt");

      index = index | 0;

      var children = this._children;
      if (index < 0 || index >= children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }

      var child = children[index];
      if (child._hasFlags(DisplayObjectFlags.Constructed)) {
        child.dispatchEvent(events.Event.getInstance(events.Event.REMOVED, true));
        if (this.stage) {
          child._propagateEvent(events.Event.getInstance(events.Event.REMOVED_FROM_STAGE));
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
      if (child._parent !== this) {
        throwError('ArgumentError', Errors.NotAChildError);
      }
      return child._index;
    }

    setChildIndex(child: DisplayObject, index: number /*int*/): void {
      index = index | 0;

      var children = this._children;
      if (index < 0 || index > children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }
      child._depth = -1;
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
        throwError('RangeError', Errors.ParamRangeError);
      }

      var child = children[index];
      if (!child._hasFlags(DisplayObjectFlags.Constructed)) {
        return null;
      }

      child._addReference();
      return child;
    }

    /**
     * Returns the timeline object that exists at the specified depth.
     */
    getChildAtDepth(depth: number /*int*/): flash.display.DisplayObject {
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
      name = asCoerceString(name);

      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (!child._hasFlags(DisplayObjectFlags.Constructed)) {
          continue;
        }
        if (child.name === name) {
          child._addReference();
          return child;
        }
      }

      return null;
    }

    /**
     * Gets the objects under the specified point by walking the children of this display list. If a child's
     * bounds doesn't include the given point then we skip it and all of its children.
     */
    getObjectsUnderPoint(globalPoint: flash.geom.Point): DisplayObject [] {
      release || counter.count("DisplayObjectContainer::getObjectsUnderPoint");

      var objectsUnderPoint: DisplayObject [] = [];
      this.visit(function (displayObject: DisplayObject): VisitorFlags {
        if (displayObject.hitTestPoint(globalPoint.x, globalPoint.y, false, true)) {
          // Only include the objects whose shape is under the specified point.
          if (displayObject.hitTestPoint(globalPoint.x, globalPoint.y, true, true)) {
            objectsUnderPoint.push(displayObject);
            displayObject._addReference();
          }
        } else {
          // TODO: Exclude inaccessible objects, not sure what these are.
          return VisitorFlags.Skip;
        }
        return VisitorFlags.Continue;
      }, VisitorFlags.None);
      return objectsUnderPoint;
    }

    areInaccessibleObjectsUnderPoint(point: flash.geom.Point): boolean {
      point = point;
      notImplemented("public DisplayObjectContainer::areInaccessibleObjectsUnderPoint"); return;
    }

    contains(child: DisplayObject): boolean {
      return this._isAncestor(child);
    }

    swapChildrenAt(index1: number /*int*/, index2: number /*int*/): void {
      index1 = index1 | 0; index2 = index2 | 0;

      var children = this._children;
      if (index1 < 0 || index1 >= children.length ||
          index2 < 0 || index2 >= children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }

      if (index1 === index2) {
        return;
      }

      this._swapChildrenAt(index1, index2);
      this._invalidateChildren();
    }

    private _swapChildrenAt(index1: number, index2: number) {
      var children = this._children;
      var child1 = children[index1];
      var child2 = children[index2];
      children[index2] = child1;
      child1._depth = -1;
      child1._index = index2;
      children[index1] = child2;
      child2._depth = -1;
      child2._index = index1;
    }

    swapChildren(child1: DisplayObject, child2: DisplayObject): void {
      this.swapChildrenAt(this.getChildIndex(child1), this.getChildIndex(child2));
    }

    removeChildren(beginIndex: number = 0, endIndex: number = 2147483647): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;

      if (beginIndex < 0 || endIndex < 0 || endIndex < beginIndex || endIndex >= this._children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }

      var count = endIndex - beginIndex + 1;
      if (count > 0) {
        while (count--) {
          this.removeChildAt(beginIndex);
        }
      }
    }
  }
}
