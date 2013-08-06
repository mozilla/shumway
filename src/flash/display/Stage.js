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
      this._invalidObjects = [];
      this._mouseMoved = false;
      this._clickTarget = null;
    },

    _setup: function setup(ctx, options) {
      this._qtree = new QuadTree(0, 0, this._stageWidth, this._stageHeight);
      this._invalid = true;
    },

    _addToStage: function addToStage(displayObject) {
      this._invalidateOnStage(displayObject);

      var children = displayObject._children;
      for (var i = 0; i < children.length; i++) {
        this._addToStage(children[i]);
      }
      displayObject._dispatchEvent(new flash.events.Event('addedToStage'));
    },
    _removeFromStage: function removeFromStage(displayObject) {
      this._invalidateOnStage(displayObject);

      var children = displayObject._children;
      for (var i = 0; i < children.length; i++) {
        this._removeFromStage(children[i]);
      }
      displayObject._dispatchEvent(new flash.events.Event('removedFromStage'));
    },

    _invalidateOnStage: function invalidateOnStage(displayObject) {
      if (displayObject._invalid) {
        return;
      }

      if (displayObject._qtree) {
        var qtree = displayObject._qtree;
        var list = qtree.children;
        var index = list.indexOf(displayObject);
        if (index < 0) {
          list = qtree.stuckChildren;
          index = list.indexOf(displayObject);
        }
        if (index > -1) {
          list.splice(index, 1);
        }
      }

      displayObject._invalid = true;
      displayObject._invalidRegion = displayObject._getDrawRegion();

      this._invalidObjects.push(displayObject);
    },

    _clipInvalidRegions: function clipInvalidRegions(ctx) {
      var objects = this._invalidObjects;

      while (objects.length) {
        var displayObject = objects.shift();

        if (!displayObject._invalid) {
          continue;
        }

        var invalidRegion = displayObject._invalidRegion;
        if (invalidRegion.width && invalidRegion.height) {
          this._clipRegion(ctx, invalidRegion);
        }

        var drawRegion = this._roundForClipping(displayObject._getDrawRegion());

        if (drawRegion.width &&
            drawRegion.height &&
            (drawRegion.x !== drawRegion.x ||
             drawRegion.y !== drawRegion.y ||
             drawRegion.width !== drawRegion.width ||
             drawRegion.height !== drawRegion.height)) {
          this._clipRegion(ctx, drawRegion);
        }

        if (displayObject.stage) {
          this._qtree.insert(drawRegion);
        }

        displayObject._invalid = false;
        displayObject._invalidRegion = null;
      }
    },
    _clipRegion: function clipRegion(ctx, region) {
      var scaleX = this._canvasState.scaleX;
      var scaleY = this._canvasState.scaleY;
      var offsetX = this._canvasState.offsetX;
      var offsetY = this._canvasState.offsetY;

      var left = (~~(region.x * scaleX + offsetX) - offsetX) / scaleX;
      var top = (~~(region.y * scaleY + offsetY) - offsetY) / scaleY;
      var right = (~~((region.x + region.width) * scaleX + offsetX + 0.5) - offsetX) / scaleX;
      var bottom = (~~((region.y + region.height) * scaleY + offsetY + 0.5) - offsetY) / scaleY;

      ctx.rect(left, top, right - left, bottom - top);
    },

    _handleMouse: function handleMouse() {
      var x = this._mouseX;
      var y = this._mouseY;

      var targets = [];
      var candidates = this._qtree.retrieve({ x: x, y: y, width: 1, height: 1 });
      for (var i = 0; i < candidates.length; i++) {
        var item = candidates[i];
        var displayObject = item.obj;
        if (displayObject._visible &&
            !displayObject._hitArea &&
            x >= item.x &&
            x <= item.x + item.width &&
            y >= item.y &&
            y <= item.y + item.height &&
            displayObject._hitTest(true, x, y, true, null, true)) {
          targets.push(displayObject);
        }
      }

      var target;
      if (targets.length) {
        targets.sort(sortByDepth);
        target = targets.pop();

        if (target._hitTarget) {
          target = target._hitTarget;
        } else {
          var interactiveObject;
          var currentNode = target;
          while (currentNode !== this) {
            if (flash.display.InteractiveObject.class.isInstanceOf(currentNode) &&
                currentNode._mouseEnabled) {
              if (!interactiveObject || !currentNode._mouseChildren) {
                interactiveObject = currentNode;
              }
            }
            currentNode = currentNode._parent;
          }
          target = interactiveObject;
        }
      }

      if (!target) {
        target = this;
      }

      if (target === this._clickTarget) {
        target._dispatchEvent(new flash.events.MouseEvent('mouseMove'));
      } else {
        if (this._clickTarget) {
          this._clickTarget._dispatchEvent(new flash.events.MouseEvent('mouseOut'));

          if (TRACE_SYMBOLS_INFO && target._control) {
            delete target._control.dataset.mouseOver;
          }
        }

        target._dispatchEvent(new flash.events.MouseEvent('mouseOver'));

        if (TRACE_SYMBOLS_INFO && target._control) {
          target._control.dataset.mouseOver = true;
        }

        this._clickTarget = target;
      }
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
              return this._stageWidth;
            },
            set: function stageWidth(value) { // (value:int) -> void
              notImplemented("Stage.stageWidth");
              this._stageWidth = value;
            }
          },
          stageHeight: {
            get: function stageHeight() { // (void) -> int
              return this._stageHeight;
            },
            set: function stageHeight(value) { // (value:int) -> void
              notImplemented("Stage.stageHeight");
              this._stageHeight = value;
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
              notImplemented("Stage.stageVideos");
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
