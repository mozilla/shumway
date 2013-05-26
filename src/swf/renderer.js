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

function renderDisplayObject(child, ctx, transform, cxform, clip) {
  var m = transform;
  if (m.a * m.d == m.b * m.c) {
    // Workaround for bug 844184 -- the object is invisible
    ctx.closePath();
    ctx.rect(0, 0, 0, 0);
    ctx.clip();
  } else {
    ctx.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
  }

  if (cxform) {
    // We only support alpha channel transformation for now
    ctx.globalAlpha = (ctx.globalAlpha * cxform.alphaMultiplier + cxform.alphaOffset) / 256;
  }
  if (child._alpha !== 1) {
    ctx.globalAlpha *= child._alpha;
  }

  if (child._graphics) {
    var graphics = child._graphics;

    if (graphics._bitmap) {
      ctx.translate(child._bbox.left, child._bbox.top);
      ctx.drawImage(graphics._bitmap, 0, 0);
    } else {
      var scale = graphics._scale;
      if (scale !== 1)
        ctx.scale(scale, scale);

      var subpaths = graphics._subpaths;
      for (var j = 0, o = subpaths.length; j < o; j++) {
        var path = subpaths[j];

        ctx.currentPath = path;

        if (clip) {
          ctx.closePath();
        } else {
          if (path.fillStyle) {
            ctx.fillStyle = path.fillStyle;

            var m = path.fillStyle.currentTransform;
            if (m) {
              ctx.save();
              ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
              ctx.fill();
              ctx.restore();
            } else {
              ctx.fill();
            }
          }
          if (path.strokeStyle) {
            ctx.strokeStyle = path.strokeStyle;
            var drawingStyles = path.drawingStyles;
            for (var prop in drawingStyles)
              ctx[prop] = drawingStyles[prop];
            ctx.stroke();
          }
        }
      }
    }
  }

  if (child.draw)
    child.draw(ctx, child.ratio);
}

var renderingTerminated = false;

function renderStage(stage, ctx, events) {
  var frameWidth, frameHeight;
  var refreshStage;

  function updateRenderTransform() {
    refreshStage = true;
    frameWidth = ctx.canvas.width;
    frameHeight = ctx.canvas.height;

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
      var pixelRatio = ctx.canvas._pixelRatio || 1;
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

    ctx.setTransform(scaleX, 0, 0, scaleY, offsetX, offsetY);

    stage._canvasState = {
      canvas: ctx.canvas,
      scaleX: scaleX,
      scaleY: scaleY,
      offsetX: offsetX,
      offsetY: offsetY
    };
    stage._invalidate = false;
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
      if (child && (child._visible || visitor.ignoreVisibleAttribute)) {
        var isContainer = ContainerClass.isInstanceOf(child) ||
                          SimpleButtonClass.isInstanceOf(child);

        visitor.visit(child, isContainer);

        if (isContainer)
          visitContainer(child, visitor);

        if (child._dirtyArea)
          dirty = true;
      }
    }

    visitor.childrenEnd(container);

    if (dirty)
      container._bounds = null;
  }

  function PreVisitor(ctx) {
    this.ctx = ctx;
  }
  PreVisitor.prototype = {
    ignoreVisibleAttribute: true,
    childrenStart: function() {},
    childrenEnd: function() {},
    visit: function (child, isContainer) {
      if (child._dirtyArea) {
        var b1 = roundForClipping(child._dirtyArea);
        var b2 = roundForClipping(child.getBounds());
        this.ctx.rect(b1.x, b1.y, b1.width, b1.height);
        this.ctx.rect(b2.x, b2.y, b2.width, b2.height);
      } else if (child._graphics && (child._graphics._revision !== child._revision)) {
        child._revision = child._graphics._revision;
        child._markAsDirty();
        // redraw entire stage till we calculate bounding boxes for dynamic graphics
        this.ctx.rect(0, 0, frameWidth, frameHeight);
      }
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
    visit: function (child, isContainer) {
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
      child._applyCurrentInverseTransform(pt, parent);

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
      }
    }
  };

  function RenderVisitor(ctx) {
    this.ctx = ctx;
    this.depth = 0;

    this.clipDepth = null;
    this.clipStack = null;
  }
  RenderVisitor.prototype = {
    ignoreVisibleAttribute: false,
    childrenStart: function(parent) {
      if (this.depth == 0) {
        var ctx = this.ctx;

        ctx.save();

        if (refreshStage) {
          refreshStage = false;
        } else {
          ctx.clip();
        }

        var bgcolor = stage._color;
        if (bgcolor.alpha < 255) {
          ctx.clearRect(0, 0, frameWidth, frameHeight);
        }
        if (bgcolor.alpha > 0) {
          ctx.fillStyle = toStringRgba(bgcolor);
          ctx.fill();
        }

        ctx.mozFillRule = 'evenodd';
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
          this.ctx.restore();
        }
        this.clipDepth = null;
      }
      // checking if we saved the parent clipping state
      if (this.clipStack && this.clipStack.depth === this.depth) {
        this.clipDepth = this.clipStack.clip;
        this.clipStack = this.clipStack.next;
      }

      this.depth--;
      this.ctx.restore();
    },
    visit: function (child, isContainer) {
      var ctx = this.ctx;

      var clippingMask = false;
      // removing clipping if the required character depth is achived
      while (this.clipDepth && this.clipDepth.length > 0 &&
          child._depth > this.clipDepth[0]) {
        this.clipDepth.shift();
        ctx.restore();
      }
      // TODO: handle container as a clipping mask
      if (child._clipDepth && !isContainer) {
        if (!this.clipDepth) {
          this.clipDepth = [];
        }
        clippingMask = true;
        // saving clipping until certain character depth
        this.clipDepth.unshift(child._clipDepth);
        ctx.save();
      }

      ctx.save();

      renderDisplayObject(child, ctx, child._currentTransform, child._cxform, clippingMask);

      if (!isContainer) {
        // letting the container to restore transforms after all children are painted
        ctx.restore();
      }

      if (clippingMask) {
        ctx.clip();
      }

      if (stage._showRedrawRegions && child._dirtyArea) {
        var b = child._dirtyArea;
        ctx.save();
        ctx.strokeStyle = '#f00';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.width, b.height);
        ctx.restore();
      }

      child._dirtyArea = null;
    }
  };

  var frameTime = 0;
  var maxDelay = 1000 / stage.frameRate;
  var nextRenderAt = Date.now();

  var requestAnimationFrame = window.requestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.oRequestAnimationFrame ||
                              window.msRequestAnimationFrame ||
                              window.setTimeout;

  var renderDummyBalls;

  var dummyBalls;
  if (typeof FirefoxCom !== 'undefined' &&
    FirefoxCom.requestSync('getBoolPref', {pref: 'shumway.dummyMode', def: false})) {
    var radius = 10;
    var speed = 1;
    dummyBalls = [];
    for (var i = 0; i < 10; i++) {
      dummyBalls.push({
        position: {
          x: radius + Math.random() * ((ctx.canvas.width - 2 * radius) / scale),
          y: radius + Math.random() * ((ctx.canvas.height - 2 * radius) / scale)
        },
        velocity: {x: speed * (Math.random() - 0.5), y: speed * (Math.random() - 0.5)}
      });
    }
    ctx.fillStyle = "black";
    ctx.lineWidth = 2;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    renderDummyBalls = function () {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.strokeStyle = "green";
      dummyBalls.forEach(function (ball) {
        var position = ball.position;
        var velocity = ball.velocity;
        ctx.beginPath();
        ctx.arc(position.x, position.y, radius, 0, Math.PI * 2, true);
        ctx.stroke();
        var x = (position.x + velocity.x);
        var y = (position.y + velocity.y);
        if (x < radius || x > ctx.canvas.width / scale - radius) {
          velocity.x *= -1;
        }
        if (y < radius || y > ctx.canvas.height / scale - radius) {
          velocity.y *= -1;
        }
        position.x += velocity.x;
        position.y += velocity.y;
      });
    }
  }

  console.timeEnd("Initialize Renderer");
  console.timeEnd("Total");

  (function draw() {
    var now = Date.now();
    var renderFrame;
    var renderFrame = now >= nextRenderAt;
    if (renderFrame && events.onBeforeFrame) {
      var e = { cancel: false };
      events.onBeforeFrame(e);
      renderFrame = !e.cancel;
    }
    if (renderFrame) {
      if (stage._invalidate) {
        updateRenderTransform();
      }

      frameTime = now;
      nextRenderAt = frameTime + maxDelay;

      if (renderDummyBalls) {
        renderDummyBalls();
      } else {
        visitContainer(stage, new MouseVisitor());

        stage._flushPendingScripts();

        avm2.systemDomain.broadcastMessage(new flash.events.Event("constructFrame"));
        avm2.systemDomain.broadcastMessage(new flash.events.Event("frameConstructed"));

        stage._flushPendingScripts();

        avm2.systemDomain.broadcastMessage(new flash.events.Event("enterFrame"));

        ctx.beginPath();
        visitContainer(stage, new PreVisitor(ctx));
        visitContainer(stage, new RenderVisitor(ctx));

        avm2.systemDomain.broadcastMessage(new flash.events.Event("exitFrame"));

        stage._syncCursor();

        if (events.onAfterFrame) {
          events.onAfterFrame();
        }
      }
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
