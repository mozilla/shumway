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

/* global Errors, throwError */

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
      return this.addChildAt(child, this._children.length);
    },
    addChildAt: function (child, index) {
      if (child === this) {
        throwError('ArgumentError', Errors.CantAddSelfError);
      }

      if (child._parent === this) {
        return this.setChildIndex(child, index);
      }

      var children = this._children;

      if (index < 0 || index > children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }

      if (child._index > -1) {
        var LoaderClass = avm2.systemDomain.getClass('flash.display.Loader');
        if (LoaderClass.isInstanceOf(child._parent)) {
          def.removeChild.call(child._parent, child);
        } else {
          child._parent.removeChild(child);
        }
      }

      if (!this._sparse) {
        for (var i = children.length; i && i > index; i--) {
          children[i - 1]._index++;
        }
      }
      children.splice(index, 0, child);

      child._owned = false;
      child._parent = this;
      child._stage = this._stage;
      child._index = index;
      child._invalidateTransform();

      this._invalidateBounds();

      child._dispatchEvent("added", undefined, true);
      if (this._stage) {
        this._stage._addToStage(child);
      }

      return child;
    },
    areInaccessibleObjectsUnderPoint: function (pt) {
      notImplemented();
    },
    contains: function (child) {
      return child._parent === this;
    },
    getChildAt: function (index) {
      var children = this._children;

      if (index < 0 || index > children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }

      var child = children[index];

      if (!flash.display.DisplayObject.class.isInstanceOf(child)) {
        return null;
      }

      return child;
    },
    getChildByName: function (name) {
      var children = this._children;
      for (var i = 0, n = children.length; i < n; i++) {
        var child = children[i];
        if (child.name === name) {
          return this.getChildAt(i);
        }
      }
      return null;
    },
    getChildIndex: function (child) {
      if (child._parent !== this) {
        throwError('ArgumentError', Errors.NotAChildError);
      }

      return this._sparse ? this._children.indexOf(child) : child._index;
    },
    getObjectsUnderPoint: function (pt) {
      notImplemented();
    },
    removeChild: function (child) {
      if (child._parent !== this) {
        throwError('ArgumentError', Errors.NotAChildError);
      }

      return this.removeChildAt(this.getChildIndex(child));
    },
    removeChildAt: function (index) {
      var children = this._children;

      if (index < 0 || index >= children.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }

      var child = children[index];

      child._dispatchEvent("removed", undefined, true);
      if (this._stage) {
        this._stage._removeFromStage(child);
      }

      if (!this._sparse) {
        for (var i = children.length; i && i > index; i--) {
          children[i - 1]._index--;
        }
      }
      children.splice(index, 1);

      child._owned = false;
      child._parent = null;
      child._index = -1;
      child._invalidateTransform();

      this._invalidateBounds();

      return child;
    },
    setChildIndex: function (child, index) {
      if (child._parent !== this) {
        throwError('ArgumentError', Errors.NotAChildError);
      }

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

      if (!this._sparse) {
        var i = currentIndex < index ? currentIndex : index;
        while (i < children.length) {
          children[i]._index = i++;
        }
      }

      child._owned = false;

      child._invalidate();

      return child;
    },
    removeChildren: function (beginIndex, endIndex) { // (beginIndex:int = 0, endIndex:int = 2147483647) -> void
      beginIndex = arguments.length < 1 ? 0 : beginIndex | 0;
      endIndex   = arguments.length < 2 ? 2147483647 : endIndex | 0;
      var numChildren = this._children.length;
      if (beginIndex < 0 || endIndex < 0 || endIndex < beginIndex) {
        throwError('RangeError', Errors.ParamRangeError);
      }
      if (numChildren === 0) {
        return;
      }
      if (endIndex > numChildren - 1) {
        endIndex = numChildren - 1;
      }
      var count = endIndex - beginIndex + 1;
      assert (count > 0);
      while (count --) {
        this.removeChildAt(beginIndex);
      }
    },
    swapChildren: function (child1, child2) {
      if (child1._parent !== this || child2._parent !== this) {
        throwError('ArgumentError', Errors.NotAChildError);
      }

      this.swapChildrenAt(this.getChildIndex(child1),
                          this.getChildIndex(child2));
    },
    swapChildrenAt: function (index1, index2) {
      var children = this._children;
      var numChildren = children.length;

      if (index1 < 0 || index1 > numChildren ||
          index2 < 0 || index2 > numChildren)
      {
        throwError('RangeError', Errors.ParamRangeError);
      }

      var child1 = children[index1];
      var child2 = children[index2];

      children[index1] = child2;
      children[index2] = child1;

      child1._index = index2;
      child2._index = index1;
      child1._owned = false;
      child2._owned = false;

      child1._invalidate();
      child2._invalidate();
    },
    destroy: function () {
      if (this._destroyed) {
        return;
      }
      this._destroyed = true;
      this._children.forEach(function (child) {
        if (child.destroy) {
          child.destroy();
        }
      });
      this.cleanupBroadcastListeners();
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.initialize = function () {
    this._mouseChildren = true;
    this._tabChildren = true;
    this._sparse = false;
    this._isContainer = true;
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
