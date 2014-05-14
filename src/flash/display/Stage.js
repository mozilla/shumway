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
/*global QuadTree, RegionCluster, ShapePath, sortByZindex */

var StageDefinition = (function () {
  return {
    // ()
    __class__: "flash.display.Stage",
    initialize: function () {
      this._frameRate = 24;
      this._scaleMode = 'showAll';
      this._align = '';
      this._stageWidth = 0;
      this._stageHeight = 0;
      this._quality = 'high';
      this._color = 0xFFFFFFFF;
      this._stage = this;
      this._deferRenderEvent = false;
      this._focus = null;
      this._showDefaultContextMenu = true;
      this._displayState = "normal";
      this._colorCorrection = "default";
      this._stageFocusRect = true;
      this._fullScreenSourceRect = null;
      this._wmodeGPU = false;
      this._root = null;
      this._qtree = null;
      this._invalidRegions = new RegionCluster();
      this._mouseMoved = false;
      this._mouseTarget = this;
      this._mouseEvents = [];
      this._cursor = 'auto';
      this._stageVideos = [];

      this._concatenatedTransform.invalid = false;
    },

    _setup: function setup(ctx, options) {
      this._qtree = new QuadTree(0, 0, this._stageWidth, this._stageHeight,
                                 null);
      this._invalid = true;
    },

    _addToStage: function addToStage(displayObject) {
      displayObject._stage = this;

      var parent = displayObject._parent;
      displayObject._level = parent._level + 1;

      displayObject._invalid = true;

      var children = displayObject._children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child._stage === null) {
          this._addToStage(child);
        }
      }

      displayObject._dispatchEvent('addedToStage');
    },
    _removeFromStage: function removeFromStage(displayObject) {
      var children = displayObject._children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child._stage) {
          this._removeFromStage(children[i]);
        }
      }

      displayObject._dispatchEvent('removedFromStage');

      displayObject._stage = null;
      displayObject._level = -1;

      if (displayObject._region) {
        this._qtree.remove(displayObject._region);
        this._invalidRegions.insert(displayObject._region);
        displayObject._region = null;
      }
    },

    _processInvalidations: function processInvalidations(refreshStage) {
      var qtree = this._qtree;
      var invalidRegions = this._invalidRegions;
      var stack = [];
      var zindex = 0;

      var children = this._children;
      var i = children.length;
      while (i--) {
        var child = children[i];
        if (refreshStage) {
          child._invalid = true;
        }
        child._invisible = !child._visible;
        stack.push(child);
      }

      while (stack.length) {
        var node = stack.pop();

        var m = node._concatenatedTransform;

        var children = node._children;
        var i = children.length;
        while (i--) {
          var child = children[i];

          if (!flash.display.DisplayObject.class.isInstanceOf(child)) {
            continue;
          }

          if (node._invalid) {
            child._invalid = true;
          }
          if (m.invalid) {
            child._concatenatedTransform.invalid = true;
          }
          child._invisible = node._invisible || !child._visible;
          stack.push(child);
        }

        if (node._level && m.invalid) {
          var m2 = node._currentTransform;
          var m3 = node._parent._concatenatedTransform;
          m.a = m2.a * m3.a + m2.b * m3.c;
          m.b = m2.a * m3.b + m2.b * m3.d;
          m.c = m2.c * m3.a + m2.d * m3.c;
          m.d = m2.d * m3.d + m2.c * m3.b;
          m.tx = m2.tx * m3.a + m3.tx + m2.ty * m3.c;
          m.ty = m2.ty * m3.d + m3.ty + m2.tx * m3.b;
          m.invalid = false;
        }

        var invalidRegion = node._region;
        var currentRegion = node._getRegion(m);

        var hidden = node._invisible ||
                     !currentRegion ||
                     currentRegion.xMax - currentRegion.xMin === 0 ||
                     currentRegion.yMax - currentRegion.yMin === 0 ||
                     currentRegion.xMax <= 0 ||
                     currentRegion.xMin >= this._stageWidth ||
                     currentRegion.yMax <= 0 ||
                     currentRegion.yMin >= this._stageHeight;

        if (node._invalid) {
          if (invalidRegion) {
            invalidRegions.insert(invalidRegion);
          }

          if (!hidden && (!invalidRegion ||
                          currentRegion.xMin !== invalidRegion.xMin ||
                          currentRegion.yMin !== invalidRegion.yMin ||
                          currentRegion.xMax !== invalidRegion.xMax ||
                          currentRegion.yMax !== invalidRegion.yMax))
          {
            invalidRegions.insert(currentRegion);
          }
        }

        if (hidden) {
          if (invalidRegion) {
            qtree.remove(invalidRegion);
            node._region = null;
          }
        } else if (invalidRegion) {
          invalidRegion.xMin = currentRegion.xMin;
          invalidRegion.xMax = currentRegion.xMax;
          invalidRegion.yMin = currentRegion.yMin;
          invalidRegion.yMax = currentRegion.yMax;
          qtree.update(invalidRegion);
        } else {
          currentRegion.obj = node;
          qtree.insert(currentRegion);

          node._region = currentRegion;
        }

        node._zindex = zindex++;
      }

      var invalidPath = new ShapePath();
      if (refreshStage) {
        invalidPath.rect(0, 0, this._stageWidth, this._stageHeight);
        invalidRegions.reset();
        return invalidPath;
      }

      var redrawRegions = invalidRegions.retrieve();

      for (var i = 0; i < redrawRegions.length; i++) {
        var region = redrawRegions[i];
        var xMin = region.xMin - region.xMin % 20 - 40;
        var yMin = region.yMin - region.yMin % 20 - 40;
        var xMax = region.xMax - region.xMax % 20 + 80;
        var yMax = region.yMax - region.yMax % 20 + 80;

        var intersectees = qtree.retrieve(xMin, xMax, yMin, yMax);
        for (var j = 0; j < intersectees.length; j++) {
          var item = intersectees[j];
          item.obj._invalid = true;
        }

        invalidPath.rect(xMin, yMin, xMax - xMin, yMax - yMin);
      }

      invalidRegions.reset();

      return invalidPath;
    },

    _handleMouseButtons: function () {
      if (this._mouseEvents.length === 0) {
        return;
      }
      var eventType = this._mouseEvents.shift();
      switch (eventType) {
      case 'mousedown':
        if (this._mouseTarget._buttonMode) {
          this._mouseTarget._gotoButtonState('down');
        }
        this._mouseTarget._dispatchEvent('mouseDown');
        break;
      case 'mouseup':
        if (this._mouseTarget._buttonMode) {
          this._mouseTarget._gotoButtonState('over');
        }
        this._mouseTarget._dispatchEvent('mouseUp');
        break;
      }
    },

    _handleMouse: function handleMouse() {
      var mouseX = this._mouseX;
      var mouseY = this._mouseY;

      var candidates = this._qtree.retrieve(mouseX, mouseX, mouseY, mouseY);
      var objectsUnderMouse = [];

      for (var i = 0; i < candidates.length; i++) {
        var item = candidates[i];
        var displayObject = item.obj;
        var isUnderMouse = false;
        if (flash.display.SimpleButton.class.isInstanceOf(displayObject)) {
          if (!displayObject._enabled) {
            continue;
          }

          var hitArea = displayObject._hitTestState;

          hitArea._parent = displayObject;
          isUnderMouse = hitArea._hitTest(true, mouseX, mouseY, true);
          hitArea._parent = null;
        } else {
          isUnderMouse = displayObject._hitTest(true, mouseX, mouseY, true);
        }
        if (isUnderMouse) {
          // skipping mouse disabled objects
          var currentNode = displayObject;
          var lastEnabled = null;
          if (!flash.display.InteractiveObject.class.isInstanceOf(currentNode)) {
            lastEnabled = currentNode;
            currentNode = currentNode._parent;
          }
          do {
            if (!currentNode._mouseEnabled) {
              lastEnabled = null;
            } else if (lastEnabled === null) {
              lastEnabled = currentNode;
            }
            currentNode = currentNode._parent;
          } while (currentNode);
          objectsUnderMouse.push(lastEnabled);
        }
      }

      var target;

      if (objectsUnderMouse.length) {
        objectsUnderMouse.sort(sortByZindex);

        var i = objectsUnderMouse.length;
        while (i--) {
          target = null;

          var currentNode = objectsUnderMouse[i];

          if (!flash.display.InteractiveObject.class.isInstanceOf(currentNode)) {
            var j = i;
            while (j--) {
              if (objectsUnderMouse[j]._parent === currentNode._parent &&
                  flash.display.InteractiveObject.class.isInstanceOf(objectsUnderMouse[j])) {
                currentNode = objectsUnderMouse[j];
                i = j;
              }
            }
          }

          do {
            if (flash.display.InteractiveObject.class.isInstanceOf(currentNode)) {
              if ((!target || !currentNode._mouseChildren) && !currentNode._hitArea) {
                target = currentNode;
              }
            }
            currentNode = currentNode._parent;
          } while (currentNode);

          if (target !== objectsUnderMouse[i] &&
              flash.display.SimpleButton.class.isInstanceOf(target))
          {
            continue;
          }

          break;
        }
      }

      if (!target) {
        target = this;
      } else if (target._hitTarget) {
        target = target._hitTarget;
      }

      if (target === this._mouseTarget) {
        target._dispatchEvent('mouseMove');
      } else {
        if (this._mouseTarget._buttonMode) {
          this._mouseTarget._gotoButtonState('up');
        }

        this._mouseTarget._dispatchEvent('mouseOut');

        var nodeLeft = this._mouseTarget;
        var containerLeft = nodeLeft._parent;
        var nodeEntered = target;
        var containerEntered = nodeEntered._parent;
        var cursor = 'auto';

        while (nodeLeft._level >= 0 && nodeLeft !== containerEntered) {
          if (nodeLeft._hasEventListener('rollOut')) {
            nodeLeft._dispatchEvent('rollOut');
          }

          nodeLeft = nodeLeft._parent;
        }

        while (nodeEntered._level >= 0 && nodeEntered !== containerLeft) {
          if (nodeEntered._hasEventListener('rollOver')) {
            nodeEntered._dispatchEvent('rollOver');
          }

          if (nodeEntered._buttonMode && nodeEntered._useHandCursor) {
            cursor = 'pointer';
          }

          nodeEntered = nodeEntered._parent;
        }

        if (target._buttonMode) {
          target._gotoButtonState('over');
        }

        target._dispatchEvent('mouseOver');

        this._mouseTarget = target;
        this._cursor = cursor;
      }
    },

    _as2SetLevel: function (level, loader) {
      somewhatImplemented('Stage._as2SetLevel');
      this.addChild(loader);
    },

    __glue__: {
      native: {
        instance: {
          invalidate: function invalidate() { // (void) -> void
            this._invalid = true;
            this._deferRenderEvent = true;
          },
          isFocusInaccessible: function isFocusInaccessible() { // (void) -> Boolean
            notImplemented("Stage.isFocusInaccessible");
          },
          set_displayState: function set_displayState(value) { // (value:String) -> void
            somewhatImplemented("Stage.set_displayState");
            this._displayState = value;
          },
          get_simulatedFullScreenWidth: function get_simulatedFullScreenWidth() { // (void) -> uint
            notImplemented("Stage.get_simulatedFullScreenWidth");
          },
          get_simulatedFullScreenHeight: function get_simulatedFullScreenHeight() { // (void) -> uint
            notImplemented("Stage.get_simulatedFullScreenHeight");
          },
          removeChildAt: function removeChildAt(index) { // (index:int) -> DisplayObject
            notImplemented("Stage.removeChildAt");
          },
          swapChildrenAt: function swapChildrenAt(index1, index2) { // (index1:int, index2:int) -> void
            notImplemented("Stage.swapChildrenAt");
          },
          requireOwnerPermissions: function requireOwnerPermissions() { // (void) -> void
            somewhatImplemented("Stage.requireOwnerPermissions");
          },
          frameRate: {
            get: function frameRate() { // (void) -> Number
              return this._frameRate;
            },
            set: function frameRate(value) { // (value:Number) -> void
              this._frameRate = value;
            }
          },
          scaleMode: {
            get: function scaleMode() { // (void) -> String
              return this._scaleMode;
            },
            set: function scaleMode(value) { // (value:String) -> void
              this._scaleMode = value;
              this._invalid = true;
            }
          },
          align: {
            get: function align() { // (void) -> String
              return this._align;
            },
            set: function align(value) { // (value:String) -> void
              this._align = value;
              this._invalid = true;
            }
          },
          stageWidth: {
            get: function stageWidth() { // (void) -> int
              return this._stageWidth / 20;
            },
            set: function stageWidth(value) { // (value:int) -> void
              notImplemented("Stage.stageWidth");
              this._stageWidth = value * 20|0;
            }
          },
          stageHeight: {
            get: function stageHeight() { // (void) -> int
              return this._stageHeight / 20;
            },
            set: function stageHeight(value) { // (value:int) -> void
              notImplemented("Stage.stageHeight");
              this._stageHeight = value * 20|0;
            }
          },
          showDefaultContextMenu: {
            get: function showDefaultContextMenu() { // (void) -> Boolean
              return this._showDefaultContextMenu;
            },
            set: function showDefaultContextMenu(value) { // (value:Boolean) -> void
              somewhatImplemented("Stage.showDefaultContextMenu");
              this._showDefaultContextMenu = value;
            }
          },
          focus: {
            get: function focus() { // (void) -> InteractiveObject
              return this._focus;
            },
            set: function focus(newFocus) { // (newFocus:InteractiveObject) -> void
              somewhatImplemented("Stage.focus");
              this._focus = newFocus;
            }
          },
          colorCorrection: {
            get: function colorCorrection() { // (void) -> String
              return this._colorCorrection;
            },
            set: function colorCorrection(value) { // (value:String) -> void
              notImplemented("Stage.colorCorrection");
              this._colorCorrection = value;
            }
          },
          colorCorrectionSupport: {
            get: function colorCorrectionSupport() { // (void) -> String
              return false;
            }
          },
          stageFocusRect: {
            get: function stageFocusRect() { // (void) -> Boolean
              return this._stageFocusRect;
            },
            set: function stageFocusRect(on) { // (on:Boolean) -> void
              somewhatImplemented("Stage.stageFocusRect");
              this._stageFocusRect = on;
            }
          },
          quality: {
            get: function quality() { // (void) -> String
              return this._quality;
            },
            set: function quality(value) { // (value:String) -> void
              somewhatImplemented("Stage.stageFocusRect");
              this._quality = value;
            }
          },
          displayState: {
            get: function displayState() { // (void) -> String
              return this._displayState;
            },
            set: function displayState(value) { // (value:String) -> void
              this._displayState = value;
            }
          },
          simulatedDisplayState: {
            get: function simulatedDisplayState() { // (void) -> String
              notImplemented("Stage.simulatedDisplayState");
              return this._simulatedDisplayState;
            },
            set: function simulatedDisplayState(value) { // (value:String) -> void
              notImplemented("Stage.simulatedDisplayState");
              this._simulatedDisplayState = value;
            }
          },
          fullScreenSourceRect: {
            get: function fullScreenSourceRect() { // (void) -> Rectangle
              return this._fullScreenSourceRect;
            },
            set: function fullScreenSourceRect(value) { // (value:Rectangle) -> void
              notImplemented("Stage.fullScreenSourceRect");
              this._fullScreenSourceRect = value;
            }
          },
          simulatedFullScreenSourceRect: {
            get: function simulatedFullScreenSourceRect() { // (void) -> Rectangle
              notImplemented("Stage.simulatedFullScreenSourceRect");
              return this._simulatedFullScreenSourceRect;
            },
            set: function simulatedFullScreenSourceRect(value) { // (value:Rectangle) -> void
              notImplemented("Stage.simulatedFullScreenSourceRect");
              this._simulatedFullScreenSourceRect = value;
            }
          },
          stageVideos: {
            get: function stageVideos() { // (void) -> Vector
              somewhatImplemented("Stage.stageVideos");
              return this._stageVideos;
            }
          },
          stage3Ds: {
            get: function stage3Ds() { // (void) -> Vector
              notImplemented("Stage.stage3Ds");
              return this._stage3Ds;
            }
          },
          color: {
            get: function color() { // (void) -> uint
              return this._color;
            },
            set: function color(color) { // (color:uint) -> void
              this._color = color;
              this._invalid = true;
            }
          },
          fullScreenWidth: {
            get: function fullScreenWidth() { // (void) -> uint
              notImplemented("Stage.fullScreenWidth");
              return this._fullScreenWidth;
            }
          },
          fullScreenHeight: {
            get: function fullScreenHeight() { // (void) -> uint
              notImplemented("Stage.fullScreenHeight");
              return this._fullScreenHeight;
            }
          },
          wmodeGPU: {
            get: function wmodeGPU() { // (void) -> Boolean
              somewhatImplemented("Stage.wmodeGPU");
              return this._wmodeGPU;
            }
          },
          softKeyboardRect: {
            get: function softKeyboardRect() { // (void) -> Rectangle
              notImplemented("Stage.softKeyboardRect");
              return this._softKeyboardRect;
            }
          },
          allowsFullScreen: {
            get: function allowsFullScreen() { // (void) -> Boolean
              return false;
            }
          },
          displayContextInfo: {
            get: function displayContextInfo() { // (void) -> String
              notImplemented("Stage.displayContextInfo");
              return this._displayContextInfo;
            }
          }
        }
      }
    }
  };
}).call(this);
