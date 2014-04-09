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

  export class DisplayObjectContainer extends flash.display.InteractiveObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function () {
      var self: DisplayObjectContainer = this;

      self._tabChildren = true;
      self._mouseChildren = true;

      self._children = [];
    };
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.DisplayObjectContainer");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings

    _tabChildren: boolean;
    _mouseChildren: boolean;

    _children: flash.display.DisplayObject [];

    get numChildren(): number /*int*/ {
      return this._children.length;
    }
    get textSnapshot(): flash.text.TextSnapshot {
      notImplemented("public flash.display.DisplayObjectContainer::get textSnapshot"); return;
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
    addChild(child: flash.display.DisplayObject): flash.display.DisplayObject {
      return this.addChildAt(child, this._children.length);
    }
    addChildAt(child: flash.display.DisplayObject, index: number /*int*/): flash.display.DisplayObject {
      //child = child;
      index = index | 0;

      if (child === this) {
        throwError('ArgumentError', Errors.CantAddSelfError);
      }
      if (child instanceof DisplayObjectContainer && (<DisplayObjectContainer>child).contains(this)) {
        throwError('ArgumentError', Errors.CantAddParentError);
      }
      // Tobias: I forgot, what happens if we have larger cycles?
      if (child._parent === this) {
        this.setChildIndex(child, index);
        return child;
      }

      var children = this._children;

      if (index < 0 || index > children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }

      if (child._parent) {
        child._parent.removeChild(child);
      }

      for (var i = children.length; i && i > index; i--) {
        children[i - 1]._index++;
      }
      children.splice(index, 0, child);

      child._index = index;
      child._removeFlags(DisplayObjectFlags.OwnedByTimeline); ;
      child._parent = this;
      child._stage = this._stage;
      child._invalidateTransform();
      child.dispatchEvent(new Event(Event.ADDED, true));
      return child;
    }
    removeChild(child: flash.display.DisplayObject): flash.display.DisplayObject {
      //child = child
      return this.removeChildAt(this.getChildIndex(child));
    }
    removeChildAt(index: number /*int*/): flash.display.DisplayObject {
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
      // Tobias: How come we have to invalidate the transform if we just remove the object from the list?
      // I can see that the concatenated matrix would be different, but the transform?
      child._invalidateTransform();
      return child;
    }
    getChildIndex(child: flash.display.DisplayObject): number /*int*/ {
      //child = child

      if (child._parent !== this) {
        throwError('ArgumentError', Errors.NotAChildError);
      }
      return child._index;
    }
    setChildIndex(child: flash.display.DisplayObject, index: number /*int*/): void {
      //child = child;
      index = index | 0;

      var currentIndex = this.getChildIndex(child);

      if (currentIndex === index) {
        return;
      }

      var children = this._children;

      if (index < 0 || index > children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }

      children.splice(currentIndex, 1);
      children.splice(index, 0, child);

      var i = currentIndex < index ? currentIndex : index;
      while (i < children.length) {
        children[i]._index = i++;
      }

      child._removeFlags(DisplayObjectFlags.OwnedByTimeline);
      child._invalidate();
    }
    getChildAt(index: number /*int*/): flash.display.DisplayObject {
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
    getChildByName(name: string): flash.display.DisplayObject {
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
    getObjectsUnderPoint(point: flash.geom.Point): flash.display.DisplayObject [] {
      //point = point;

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
      notImplemented("public flash.display.DisplayObjectContainer::areInaccessibleObjectsUnderPoint"); return;
    }
    contains(child: flash.display.DisplayObject): boolean {
      //child = child

      var currentNode = this;
      do {
        if (currentNode === child) {
          return true;
        }
        currentNode = currentNode._parent;
      } while (currentNode);
    }
    swapChildrenAt(index1: number /*int*/, index2: number /*int*/): void {
      index1 = index1 | 0; index2 = index2 | 0;

      var children = this._children;
      var numChildren = children.length;

      if (index1 < 0 || index1 > numChildren ||
          index2 < 0 || index2 > numChildren)
      {
        throwError('RangeError', Errors.ParamRangeError);
      }

      if (index1 === index2) {
        return;
      }

      var child1 = children[index1];
      var child2 = children[index2];
      children[index2] = child1;
      child1._index = index2;
      child1._removeFlags(DisplayObjectFlags.OwnedByTimeline); ;
      child1._invalidate();
      children[index1] = child2;
      child2._index = index1;
      child2._removeFlags(DisplayObjectFlags.OwnedByTimeline); ;
      child2._invalidate();
    }
    swapChildren(child1: flash.display.DisplayObject, child2: flash.display.DisplayObject): void {
      //child1 = child1; child2 = child2;
      this.swapChildrenAt(this.getChildIndex(child1), this.getChildIndex(child2));
    }
    removeChildren(beginIndex: number /*int*/ = 0, endIndex: number /*int*/ = 2147483647): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;

      if (beginIndex < 0 ||
          endIndex < 0 ||
          endIndex < beginIndex ||
          endIndex > this.numChildren - 1)
      {
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