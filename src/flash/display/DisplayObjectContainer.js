/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var DisplayObjectContainerDefinition = (function () {
  var def = {
    get mouseChildren() {
      return this._mouseChildren;
    },
    set mouseChildren(val) {
      this._mouseChildren = val;
    },
    get numChildren() {
      return this._children.length;
    },
    get tabChildren() {
      return this._tabChildren;
    },
    set tabChildren(val) {
      this._tabChildren = val;
    },
    get textSnapshot() {
      notImplemented();
    },

    addChild: function (child) {
      if (child === this)
        throw ArgumentError();

      return this.addChildAt(child, this._children.length);
    },
    addChildAt: function (child, index) {
      if (child === this)
        throw ArgumentError();

      var children = this._children;

      if (index < 0 || index > children.length)
        throw RangeError();

      if (child._parent) {
        var LoaderClass = avm2.systemDomain.getClass('flash.display.Loader');
        if (LoaderClass.isInstanceOf(child._parent)) {
          def.removeChild.call(child._parent, child);
        } else {
          child._parent.removeChild(child);
        }
      }

      children.splice(index, 0, child);
      child._owned = false;
      child._parent = this;

      this._control.appendChild(child._control);

      child._dispatchEvent(new flash.events.Event("added"));
      if (child.stage)
        child._addedToStage(new flash.events.Event("addedToStage"));

      this._markAsDirty();

      return child;
    },
    areInaccessibleObjectsUnderPoint: function (pt) {
      notImplemented();
    },
    contains: function (child) {
      return this._children.indexOf(child) > -1;
    },
    getChildAt: function (index) {
      var children = this._children;

      if (index < 0 || index > children.length)
        throw RangeError();

      return children[index];
    },
    getChildByName: function (name) {
      var children = this._children;
      for (var i = 0, n = children.length; i < n; i++) {
        var child = children[i];
        if (child.name === name)
          return child;
      }
      return null;
    },
    getChildIndex: function (child) {
      var index = this._children.indexOf(child);

      if (index < 0)
        throw ArgumentError();

      return index;
    },
    getObjectsUnderPoint: function (pt) {
      notImplemented();
    },
    removeChild: function (child) {
      var children = this._children;
      var index = children.indexOf(child);

      if (index < 0)
        throw ArgumentError();

      return this.removeChildAt(index);
    },
    removeChildAt: function (index) {
      var children = this._children;

      if (index < 0 || index >= children.length)
        throw RangeError();

      var child = children[index];

      child._dispatchEvent(new flash.events.Event("removed"));
      if (child.stage)
        child._removedFromStage(new flash.events.Event("removedFromStage"));

      children.splice(index, 1);
      child._parent = null;

      this._control.removeChild(child._control);

      this._markAsDirty();

      return child;
    },
    setChildIndex: function (child, index) {
      var children = this._children;

      if (index < 0 || index > children.length)
        throw RangeError();

      var currentIndex = children.indexOf(child);

      if (currentIndex < 0)
        throw ArgumentError();

      children.splice(currentIndex, 1);
      children.splice(index, 0, child);
      child._owned = false;

      this._markAsDirty();

      return child;
    },
    removeChildren: function (begin, end) {
      var children = this._children;
      var numChildren = children.length;

      if (begin < 0 || begin > numChildren || end < 0 || end < begin || end > numChildren)
        throw RangeError();

      for (var i = begin; i < end; i++)
        this.removeChildAt(i);
    },
    swapChildren: function (child1, child2) {
      var children = this._children;
      var index1 = children.indexOf(child1);
      var index2 = children.indexOf(child1);

      if (index1 < 0 || index2 < 0)
        throw ArgumentError();

      this.swapChildrenAt(index1, index2);
    },
    swapChildrenAt: function (index1, index2) {
      var children = this._children;
      var numChildren = children.length;

      if (index1 < 0 || index1 > numChildren || index2 < 0 || index2 > numChildren)
        throw RangeError();

      var child1 = children[index1];
      var child2 = children[index2];
      children[index1] = child2;
      children[index2] = child1;
      child1._owned = false;
      child2._owned = false;

      this._markAsDirty();
    },
    destroy: function () {
      if (this._destroyed) {
        return;
      }
      this._destroyed = true;
      this._children.forEach(function (child) {
        child.destroy();
      });
      this.cleanupBroadcastListeners();
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.initialize = function () {
    this._tabChildren = true;
  };

  def.__glue__ = {
    native: {
      instance: {
        numChildren: desc(def, "numChildren"),
        tabChildren: desc(def, "tabChildren"),
        mouseChildren: desc(def, "mouseChildren"),
        textSnapshot: desc(def, "textSnapshot"),
        addChild: def.addChild,
        addChildAt: def.addChildAt,
        removeChild: def.removeChild,
        removeChildAt: def.removeChildAt,
        getChildIndex: def.getChildIndex,
        setChildIndex: def.setChildIndex,
        getChildAt: def.getChildAt,
        getChildByName: def.getChildByName,
        contains: def.contains,
        swapChildrenAt: def.swapChildrenAt,
        swapChildren: def.swapChildren,
        removeChildren: def.removeChildren
      }
    }
  };

  return def;
}).call(this);
