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
/*global toStringRgba, FirefoxCom, TRACE_SYMBOLS_INFO */

function renderDisplayObject(child, transform, cxform, clip) {
  var control = child._control;
  release || assert(control, "All display object must have _controls");
  var style = control.style;

  var m = transform;
  var cssTransform = 'matrix('+m.a+','+m.b+','+m.c+','+m.d+','+m.tx+','+m.ty+')';
  style.transform = cssTransform;
  style.WebkitTransform = cssTransform;

  var opacity = child._alpha || 1;
  if (cxform) {
    // We only support alpha channel transformation for now
    opacity *= (cxform.alphaMultiplier + cxform.alphaOffset) / 256;
  }
  style.opacity = opacity;

  var graphics = child._graphics;
  if (graphics) {
    graphics.draw(clip);
    var canvas = graphics._canvas;
    if (canvas && canvas.parentNode !== control) {
      if (control.firstChild) {
        control.insertBefore(canvas, control.firstChild);
      } else {
        control.appendChild(canvas);
      }
    }
  }

  if (child._dirty) {
    child.draw && child.draw(null, child.ratio);
    child._dirty = false;
  }
}

var renderingTerminated = false;

function renderStage(stage, events) {
  var frameWidth, frameHeight;

  function updateRenderTransform() {
    frameWidth = stage._frameWidth;
    frameHeight = stage._frameHeight;

    var scaleX = frameWidth / stage._stageWidth;
    var scaleY = frameHeight / stage._stageHeight;

    switch (stage._scaleMode) {
    case 'exactFit':
      break;
    case 'noBorder':
      if (scaleX > scaleY) {
        scaleY = scaleX;
      } else {
        scaleX = scaleY;
      }
      break;
    case 'noScale':
      //TODO: re-add support for pixelRatio
      var pixelRatio = 1;
      scaleX = pixelRatio;
      scaleY = pixelRatio;
      break;
    case 'showAll':
      if (scaleX < scaleY) {
        scaleY = scaleX;
      } else {
        scaleX = scaleY;
      }
      break;
    }

    var align = stage._align;
    var offsetX, offsetY;
    if (align.indexOf('L') >= 0) {
      offsetX = 0;
    } else if (align.indexOf('R') >= 0) {
      offsetX = frameWidth - scaleX * stage._stageWidth;
    } else {
      offsetX = (frameWidth - scaleX * stage._stageWidth) / 2;
    }
    if (align.indexOf('T') >= 0) {
      offsetY = 0;
    } else if (align.indexOf('B') >= 0) {
      offsetY = frameHeight - scaleY * stage._stageHeight;
    } else {
      offsetY = (frameHeight - scaleY * stage._stageHeight) / 2;
    }

    stage._control.style.transform = 'offset(' + offsetX + ', ' + offsetY +
                                     ' scale(' + scaleX + ', ' + scaleY + ');';

    stage._canvasState = {
      scaleX: scaleX,
      scaleY: scaleY,
      offsetX: offsetX,
      offsetY: offsetY
    };
  }

  updateRenderTransform();

  // All the visitors close over this class to do instance testing.
  var MovieClipClass = avm2.systemDomain.getClass("flash.display.MovieClip");
  var ContainerClass = avm2.systemDomain.getClass("flash.display.DisplayObjectContainer");
  var SimpleButtonClass = avm2.systemDomain.getClass("flash.display.SimpleButton");
  var InteractiveClass = avm2.systemDomain.getClass("flash.display.InteractiveObject");

  function roundForClipping(bounds) {
    var scaleX = stage._canvasState.scaleX;
    var scaleY = stage._canvasState.scaleY;
    var offsetX = stage._canvasState.offsetX;
    var offsetY = stage._canvasState.offsetY;

    var x = (Math.floor(bounds.x * scaleX + offsetX) - offsetX) / scaleX;
    var y = (Math.floor(bounds.y * scaleY + offsetY) - offsetY) / scaleY;
    var x2 = (Math.ceil((bounds.x + bounds.width) * scaleX + offsetX) - offsetX) / scaleX;
    var y2 = (Math.ceil((bounds.y + bounds.height) * scaleY + offsetY) - offsetY) / scaleY;
    return { x: x, y: y, width: x2 - x, height: y2 - y };
  }

  function visitContainer(container, visitor) {
    var children = container._children;
    var dirty = false;

    visitor.childrenStart(container);

    for (var i = 0, n = children.length; i < n; i++) {
      var child = children[i];
      if (!child) {
        continue;
      }

      if (visitor.ignoreVisibleAttribute || (child._visible && !child._maskedObject)) {
        var isContainer = ContainerClass.isInstanceOf(child) ||
                          SimpleButtonClass.isInstanceOf(child);

        visitor.visit(child, isContainer, visitContainer);

        if (child._dirtyArea)
          dirty = true;
      }
    }

    visitor.childrenEnd(container);

    if (dirty)
      container._bounds = null;
  }

  function PreVisitor() {
  }
  PreVisitor.prototype = {
    ignoreVisibleAttribute: true,
    childrenStart: function() {},
    childrenEnd: function() {},
    visit: function (child, isContainer, visitContainer) {
    }
  };

  function MouseVisitor() {
    this.interactiveParent = stage;
    this.parentsStack = [stage];
    this.mouseOverEvt = new flash.events.MouseEvent("mouseOver");
    this.mouseOutEvt = new flash.events.MouseEvent("mouseOut");
    this.mouseMoveEvt = new flash.events.MouseEvent("mouseMove");

    this.mouseOverTargets = [stage._mouseOver ? stage : null];
    this.oldMouseOverTargets = [];
    if (stage._mouseJustLeft) {
      this.oldMouseOverTargets.push(stage);
      stage._mouseJustLeft = false;
    }
  }
  MouseVisitor.prototype = {
    ignoreVisibleAttribute: false,
    childrenStart: function() {},
    childrenEnd: function(container) {
      this.interactiveParent = this.parentsStack.pop();

      if (container === stage) {
        var newMouseOverTargets = [];
        var oldMouseOverTargets = this.oldMouseOverTargets;
        var target = this.mouseOverTargets.pop();
        stage._clickTarget = target;
        if (target) {
          // removing duplicates from this.mouseOverTargets and removing symbols
          // from this.oldMouseOverTargets if they are in "mouseOver" state
          do {
            var i = oldMouseOverTargets.indexOf(target);
            if (i >= 0) {
              oldMouseOverTargets[i] = null;
            }
            if (!target._mouseOver) {
              newMouseOverTargets.push(target);
            }
            var prev = target;
            do {
              target = this.mouseOverTargets.pop();
            } while (prev === target);
          } while(target);
        }
        // generating mouseOut events for non-processed oldMouseOverTargets
        while (oldMouseOverTargets.length > 0) {
          target = oldMouseOverTargets.pop();
          if (!target) {
            continue;
          }
          target._mouseOver = false;
          target._dispatchEvent(this.mouseOutEvt);

          if (TRACE_SYMBOLS_INFO && target._control) {
            delete target._control.dataset.mouseOver;
          }
        }
        // generating mouseOver events for new "mouseOver" symbols
        while (newMouseOverTargets.length > 0) {
          target = newMouseOverTargets.pop();
          target._mouseOver = true;
          target._dispatchEvent(this.mouseOverEvt);

          if (TRACE_SYMBOLS_INFO && target._control) {
            target._control.dataset.mouseOver = true;
          }
        }
      }
    },
    visit: function (child, isContainer, visitContainer) {
      var interactiveParent = this.interactiveParent;
      if (InteractiveClass.isInstanceOf(child) && child._mouseEnabled &&
          interactiveParent._mouseChildren) {
        interactiveParent = child;
      }

      if (child._mouseOver) {
        // remembering all symbols in "mouseOver" state
        this.oldMouseOverTargets.push(child);
      }

      var mouseMoved = false;

      var parent = child._parent;
      var pt = { x: parent._mouseX, y: parent._mouseY };
      child._applyCurrentInverseTransform(pt, true);

      if (pt.x !== child._mouseX || pt.y !== child._mouseY) {
        mouseMoved = true;
      }

      child._mouseX = pt.x;
      child._mouseY = pt.y;

      var hitArea = child._hitArea || child;
      if (stage._mouseOver &&
          hitArea._hitTest(true, stage._mouseX, stage._mouseY, true, null, true)) {
        if (mouseMoved) {
          interactiveParent._dispatchEvent(this.mouseMoveEvt);
        }
        // saving the current interactive symbol and whole stack of
        // its parents (including duplicates)
        this.mouseOverTargets = this.parentsStack.concat([interactiveParent]);
      }

      if (isContainer) {
        this.parentsStack.push(this.interactiveParent);
        this.interactiveParent = interactiveParent;

        visitContainer(child, this);
      }
    }
  };

  function RenderVisitor(refreshStage) {
    this.depth = 0;
    this.refreshStage = refreshStage;

    this.clipDepth = null;
    this.clipStack = null;
  }
  RenderVisitor.prototype = {
    ignoreVisibleAttribute: false,
    childrenStart: function(parent) {
      if (this.depth === 0) {

        // TODO: find out what to do with this
        if (this.refreshStage) {
          this.refreshStage = false;
        }

        var bgcolor = stage._color;
        stage._control.style.backgroundColor = toStringRgba(bgcolor);
      }
      this.depth++;

      if (this.clipDepth && this.clipDepth.length > 0) {
        // saving the parent clipping state
        this.clipStack = {
          depth: this.depth,
          clip: this.clipDepth,
          next: this.clipStack
        };
        this.clipDepth = null;
      }
    },
    childrenEnd: function(parent) {
      if (this.clipDepth) {
        // removing existing clippings
        while (this.clipDepth.length > 0) {
          this.clipDepth.pop();
        }
        this.clipDepth = null;
      }
      // checking if we saved the parent clipping state
      if (this.clipStack && this.clipStack.depth === this.depth) {
        this.clipDepth = this.clipStack.clip;
        this.clipStack = this.clipStack.next;
      }

      this.depth--;
    },
    visit: function (child, isContainer, visitContainer) {

      var clippingMask = false;
      // removing clipping if the required character depth is achived
      while (this.clipDepth && this.clipDepth.length > 0 &&
          child._depth > this.clipDepth[0])
      {
        this.clipDepth.shift();
      }
      // TODO: handle container as a clipping mask
      if (child._clipDepth && !isContainer) {
        if (!this.clipDepth) {
          this.clipDepth = [];
        }
        clippingMask = true;
        // saving clipping until certain character depth
        this.clipDepth.unshift(child._clipDepth);
      }

      renderDisplayObject(child, child._currentTransform, child._cxform, clippingMask);

      //TODO: restore masking
//      if (child._mask) {
//        // TODO create canvas small enough to fit the object and
//        // TODO cache the results when cacheAsBitmap is set
//        var tempCanvas, tempCtx, maskCanvas, maskCtx;
//        maskCanvas = CanvasCache.getCanvas(ctx.canvas);
//        maskCtx = maskCanvas.ctx;
//        maskCtx.currentTransform = ctx.currentTransform;
//        var isMaskContainer = ContainerClass.isInstanceOf(child._mask) ||
//                              SimpleButtonClass.isInstanceOf(child._mask);
//        this.ctx = maskCtx;
//        this.visit(child._mask, isMaskContainer, visitContainer);
//        this.ctx = ctx;
//
//        tempCanvas = CanvasCache.getCanvas(ctx.canvas);
//        tempCtx = tempCanvas.ctx;
//        tempCtx.currentTransform = ctx.currentTransform;
//        renderDisplayObject(child, tempCtx, child._currentTransform, child._cxform, clippingMask);
//
//        if (isContainer) {
//          this.ctx = tempCtx;
//          visitContainer(child, this);
//          this.ctx = ctx;
//        }
//
//        tempCtx.globalCompositeOperation = 'destination-in';
//        tempCtx.setTransform(1, 0, 0, 1, 0, 0);
//        tempCtx.drawImage(maskCanvas.canvas, 0, 0);
//
//        ctx.save();
//        ctx.setTransform(1, 0, 0, 1, 0, 0);
//        ctx.drawImage(tempCanvas.canvas, 0, 0);
//        ctx.restore();
//
//        CanvasCache.releaseCanvas(tempCanvas);
//        CanvasCache.releaseCanvas(maskCanvas);
//      } else {
//        renderDisplayObject(child, ctx, child._currentTransform, child._cxform, clippingMask);
//
//        if (isContainer) {
//          visitContainer(child, this);
//        }
//      }

//      ctx.restore();

//      if (clippingMask) {
//        ctx.clip();
//      }

        if (isContainer) {
          visitContainer(child, this);
        }

      child._dirtyArea = null;
    }
  };

  var frameTime = 0;
  var maxDelay = 1000 / stage._frameRate;
  var nextRenderAt = Date.now();

  var requestAnimationFrame = window.requestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.oRequestAnimationFrame ||
                              window.msRequestAnimationFrame ||
                              window.setTimeout;

  console.timeEnd("Initialize Renderer");
  console.timeEnd("Total");

  (function draw() {
    var now = Date.now();
    var renderFrame = now >= nextRenderAt;
    if (renderFrame && events.onBeforeFrame) {
      var e = { cancel: false };
      events.onBeforeFrame(e);
      renderFrame = !e.cancel;
    }

    var refreshStage = false;
    if (stage._invalid) {
      updateRenderTransform();
      stage._invalid = false;
      refreshStage = true;
    }

    var mouseMoved = false;
    if (stage._mouseMoved) {
      stage._mouseMoved = false;
      mouseMoved = true;
    }

    if (renderFrame || refreshStage || mouseMoved) {
      visitContainer(stage, new MouseVisitor());

      if (renderFrame) {
        frameTime = now;
        nextRenderAt = frameTime + maxDelay;

        avm2.systemDomain.broadcastMessage(new flash.events.Event("constructFrame"));
        avm2.systemDomain.broadcastMessage(new flash.events.Event("frameConstructed"));
        avm2.systemDomain.broadcastMessage(new flash.events.Event("enterFrame"));
      }

      if (stage._deferRenderEvent) {
        stage._deferRenderEvent = false;
        avm2.systemDomain.broadcastMessage(new flash.events.Event("render"));
      }

      if (refreshStage || renderFrame) {
        visitContainer(stage, new PreVisitor());
        visitContainer(stage, new RenderVisitor(refreshStage));
      }

      if (renderFrame) {
        avm2.systemDomain.broadcastMessage(new flash.events.Event("exitFrame"));

        if (events.onAfterFrame) {
          events.onAfterFrame();
        }
      }

      stage._syncCursor();
    }

    if (renderingTerminated) {
      if (events.onTerminated) {
        events.onTerminated();
      }
      return;
    }

    requestAnimationFrame(draw);
  })();
}
