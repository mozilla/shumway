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
// Class: DisplayObjectContainer
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  import Event = flash.events.Event;
  // import DisplayObject = DisplayObject;

  export class DisplayObjectContainer extends flash.display.InteractiveObject {
    static bindings: string [] = null;
    static staticBindings: string [] = null;
    static classInitializer: any = null;
    static initializer: any = null;

    _tabChildren: boolean;
    _mouseChildren: boolean;
    _children: DisplayObject [];

    constructor () {
      false && super();
      this._tabChildren = true;
      this._mouseChildren = true;
      this._children = [];
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
        this.dispatchEvent(new Event(Event.TAB_CHILDREN_CHANGE, true));
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
      index = index | 0;
      if (child === this) {
        throwError('ArgumentError', Errors.CantAddSelfError);
      }
      if (child instanceof DisplayObjectContainer && (<DisplayObjectContainer>child).contains(this)) {
        throwError('ArgumentError', Errors.CantAddParentError);
      }
      var children = this._children;
      if (index < 0 || index > children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }

      // Tobias: I forgot, what happens if we have larger cycles?
      if (child._parent === this) {
        this.setChildIndex(child, index);
        return child;
      }

      if (child._parent) {
        child._parent.removeChild(child);
      }
      for (var i = children.length; i && i > index; i--) {
        children[i - 1]._index++;
      }
      children.splice(index, 0, child);
      child._index = index;
      child._removeFlags(DisplayObjectFlags.OwnedByTimeline);
      child._parent = this;
      child._stage = this._stage;
      child._invalidatePosition();
      child.dispatchEvent(new Event(Event.ADDED, true));
      return child;
    }
    removeChild(child: DisplayObject): DisplayObject {
      return this.removeChildAt(this.getChildIndex(child));
    }
    removeChildAt(index: number): DisplayObject {
      index = index | 0;
      var children = this._children;
      if (index < 0 || index >= children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }

      var child = children[index];
      child.dispatchEvent(new Event(Event.REMOVED, true));
      for (var i = children.length; i && i > index; i--) {
        children[i - 1]._index--;
      }
      children.splice(index, 1);
      child._index = -1;
      child._removeFlags(DisplayObjectFlags.OwnedByTimeline); ;
      child._parent = null;
      child._stage = null;
      child._invalidatePosition();
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
      var currentIndex = this.getChildIndex(child);
      if (currentIndex === index) {
        return;
      }

      children.splice(currentIndex, 1);
      children.splice(index, 0, child);
      var i = currentIndex < index ? currentIndex : index;
      while (i < children.length) {
        children[i]._index = i++;
      }
      child._removeFlags(DisplayObjectFlags.OwnedByTimeline);
      child._invalidatePosition();
    }
    getChildAt(index: number): DisplayObject {
      index = index | 0;
      var children = this._children;
      if (index < 0 || index > children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }

      var child = children[index];
      if (!child._hasFlags(DisplayObjectFlags.Constructed)) {
        return null;
      }
      return child;
    }
    getChildByName(name: string): DisplayObject {
      name = asCoerceString(name);
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.name === name) {
          return child;
        }
      }
      return null;
    }
    getObjectsUnderPoint(point: flash.geom.Point): DisplayObject [] {
      var children = this._children;
      var objectsUnderPoint = [];
      for (var i = 0; i < children.length; i++) {
        var child = children[0];
        if (child._hitTest(true, point.x, point.y, true, null)) {
          objectsUnderPoint.push(child);
        }
        if (child instanceof DisplayObjectContainer) {
          objectsUnderPoint = objectsUnderPoint.concat(
            (<DisplayObjectContainer>child).getObjectsUnderPoint(point)
          );
        }
      }
      return objectsUnderPoint;
    }

    areInaccessibleObjectsUnderPoint(point: flash.geom.Point): boolean {
      point = point;
      notImplemented("public DisplayObjectContainer::areInaccessibleObjectsUnderPoint"); return;
    }
    contains(child: DisplayObject): boolean {
      var node = this;
      do {
        if (node === child) {
          return true;
        }
        node = node._parent;
      } while (node);
    }

    swapChildrenAt(index1: number /*int*/, index2: number /*int*/): void {
      index1 = index1 | 0; index2 = index2 | 0;
      var children = this._children;
      if (index1 < 0 || index1 > children.length ||
          index2 < 0 || index2 > children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }

      // Tobias: Do we need to remove timeline ownership here?
      if (index1 === index2) {
        return;
      }

      var child1 = children[index1];
      var child2 = children[index2];
      children[index2] = child1;
      child1._index = index2;
      child1._removeFlags(DisplayObjectFlags.OwnedByTimeline); ;
      child1._invalidatePosition();
      children[index1] = child2;
      child2._index = index1;
      child2._removeFlags(DisplayObjectFlags.OwnedByTimeline); ;
      child2._invalidatePosition();
    }
    swapChildren(child1: DisplayObject, child2: DisplayObject): void {
      this.swapChildrenAt(this.getChildIndex(child1), this.getChildIndex(child2));
    }
    removeChildren(beginIndex: number = 0, endIndex: number = 2147483647): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;

      if (beginIndex < 0 || endIndex < 0 || endIndex < beginIndex || endIndex > this._children.length - 1) {
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