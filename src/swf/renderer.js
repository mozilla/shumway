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
/*global toStringRgba, FirefoxCom, TRACE_SYMBOLS_INFO, Timer, FrameCounter, coreOptions, OptionSet, Option, appendToFrameTerminal, frameWriter*/

var rendererOptions = coreOptions.register(new OptionSet("Renderer Options"));
var traceRenderer = rendererOptions.register(new Option("tr", "traceRenderer", "number", 0, "trace renderer execution"));

var CanvasCache = {
  cache: [],
  getCanvas: function getCanvas(protoCanvas) {
    var tempCanvas = this.cache.shift();
    if (!tempCanvas) {
      tempCanvas = {
        canvas: document.createElement('canvas')
      };
      tempCanvas.ctx = tempCanvas.canvas.getContext('kanvas-2d');
    }
    tempCanvas.canvas.width = protoCanvas.width;
    tempCanvas.canvas.height = protoCanvas.height;
    tempCanvas.ctx.save();
    return tempCanvas;
  },
  releaseCanvas: function releaseCanvas(tempCanvas) {
    tempCanvas.ctx.restore();
    this.cache.push(tempCanvas);
  }
};

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
      var isContainer = flash.display.DisplayObjectContainer.class.isInstanceOf(child) ||
                        flash.display.SimpleButton.class.isInstanceOf(child);

      visitor.visit(child, isContainer, visitContainer);

      if (child._dirtyArea)
        dirty = true;
    }
  }

  visitor.childrenEnd(container);

  if (dirty)
    container._bounds = null;
}

function RenderVisitor(root, ctx, refreshStage) {
  this.root = root;
  this.ctx = ctx;
  this.depth = 0;
  this.refreshStage = refreshStage;

  this.clipDepth = null;
  this.clipStack = null;
}
RenderVisitor.prototype = {
  ignoreVisibleAttribute: false,
  start: function () {
    visitContainer(this.root, this);
  },
  childrenStart: function(parent) {
    if (this.depth === 0) {
      var ctx = this.ctx;

      ctx.save();

      if (!this.refreshStage) {
        ctx.clip();
      }

      var bgcolor = this.root._color;
      if (bgcolor) {
        if (bgcolor.alpha < 255) {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
        if (bgcolor.alpha > 0) {
          ctx.fillStyle = toStringRgba(bgcolor);
          ctx.fill();
        }
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
    if (this.depth === 0) {
      this.ctx.restore();
    }
  },
  visit: function (child, isContainer, visitContainer) {
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

    if (child._mask) {
      // TODO create canvas small enough to fit the object and
      // TODO cache the results when cacheAsBitmap is set
      var tempCanvas, tempCtx, maskCanvas, maskCtx;
      maskCanvas = CanvasCache.getCanvas(ctx.canvas);
      maskCtx = maskCanvas.ctx;
      maskCtx.currentTransform = ctx.currentTransform;
      var isMaskContainer = flash.display.DisplayObjectContainer.class.isInstanceOf(child._mask) ||
                            flash.display.SimpleButton.class.isInstanceOf(child._mask);
      this.ctx = maskCtx;
      this.visit(child._mask, isMaskContainer, visitContainer);
      this.ctx = ctx;

      tempCanvas = CanvasCache.getCanvas(ctx.canvas);
      tempCtx = tempCanvas.ctx;
      tempCtx.currentTransform = ctx.currentTransform;
      renderDisplayObject(child, tempCtx, child._currentTransform, child._cxform, clippingMask);

      if (isContainer) {
        this.ctx = tempCtx;
        visitContainer(child, this);
        this.ctx = ctx;
      }

      tempCtx.globalCompositeOperation = 'destination-in';
      tempCtx.setTransform(1, 0, 0, 1, 0, 0);
      tempCtx.drawImage(maskCanvas.canvas, 0, 0);

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(tempCanvas.canvas, 0, 0);
      ctx.restore();

      CanvasCache.releaseCanvas(tempCanvas);
      CanvasCache.releaseCanvas(maskCanvas);
    } else {
      renderDisplayObject(child, ctx, child._currentTransform, child._cxform, clippingMask);

      if (isContainer) {
        visitContainer(child, this);
      }
    }

    ctx.restore();

    if (clippingMask) {
      ctx.clip();
    }

    child._dirtyArea = null;
  }
};

function renderDisplayObject(child, ctx, transform, cxform, clip) {
  if (transform) {
    var m = transform;
    if (m.a * m.d == m.b * m.c) {
      // Workaround for bug 844184 -- the object is invisible
      ctx.closePath();
      ctx.rect(0, 0, 0, 0);
      ctx.clip();
    } else {
      ctx.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    }
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

var samplesLeftPlusOne = 0;

function triggerSampling(count) {
  assert (count > 0);
  samplesLeftPlusOne = -count - 1;
}

function sampleStart() {
  if (!samplesLeftPlusOne) {
    return;
  }
  if (samplesLeftPlusOne < 0) {
    console.profile("Sample");
    samplesLeftPlusOne *= -1;
  }
  if (samplesLeftPlusOne > 0) {
    console.info("Sampling Frame: " + (samplesLeftPlusOne - 1));
  }
}

function sampleEnd() {
  if (!samplesLeftPlusOne) {
    return;
  }
  samplesLeftPlusOne --;
  if (samplesLeftPlusOne === 1) {
    console.profileEnd("Sample");
  }
}

function renderStage(stage, ctx, events) {
  var frameWidth, frameHeight;

  function updateRenderTransform() {
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
  }

  updateRenderTransform();

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

  function PreVisitor(root, ctx) {
    this.root = root;
    this.ctx = ctx;
  }
  PreVisitor.prototype = {
    ignoreVisibleAttribute: true,
    start: function () {
      visitContainer(this.root, this);
    },
    childrenStart: function() {},
    childrenEnd: function() {},
    visit: function (child, isContainer, visitContainer) {
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
      if (isContainer) {
        visitContainer(child, this);
      }
    }
  };

  function MouseVisitor(root) {
    this.root = root;
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
    start: function () {
      this.mouseMoveEvt._stageX = stage._mouseX;
      this.mouseMoveEvt._stageY = stage._mouseY;

      visitContainer(this.root, this);
    },
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
      if (flash.display.InteractiveObject.class.isInstanceOf(child) && child._mouseEnabled &&
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
          this.mouseMoveEvt._localX = interactiveParent._mouseX;
          this.mouseMoveEvt._localY = interactiveParent._mouseY;

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

  var frameTime = 0;
  var maxDelay = 1000 / stage._frameRate;
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
    var canvasState = stage._canvasState;
    var scaleX = canvasState.scaleX, scaleY = canvasState.scaleY;
    dummyBalls = [];
    for (var i = 0; i < 10; i++) {
      dummyBalls.push({
        position: {
          x: radius + Math.random() * ((ctx.canvas.width - 2 * radius) / scaleX),
          y: radius + Math.random() * ((ctx.canvas.height - 2 * radius) / scaleY)
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
        if (x < radius || x > ctx.canvas.width / scaleX - radius) {
          velocity.x *= -1;
        }
        if (y < radius || y > ctx.canvas.height / scaleY - radius) {
          velocity.y *= -1;
        }
        position.x += velocity.x;
        position.y += velocity.y;
      });
    };
  }

  console.timeEnd("Initialize Renderer");
  console.timeEnd("Total");

  var frameCount = 0;

  (function draw() {
    var now = Date.now();
    var renderFrame;
    var renderFrame = now >= nextRenderAt;
    if (renderFrame && events.onBeforeFrame) {
      var e = { cancel: false };
      events.onBeforeFrame(e);
      renderFrame = !e.cancel;
    }

    if (renderFrame && renderDummyBalls) {
      frameTime = now;
      nextRenderAt = frameTime + maxDelay;

      renderDummyBalls();

      requestAnimationFrame(draw);
      return;
    }

    sampleStart();

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
      FrameCounter.clear();
      traceRenderer.value && appendToFrameTerminal("Begin Frame #" + (frameCount++), "purple");
      traceRenderer.value && frameWriter.enter("> Mouse Visitor");
      (new MouseVisitor(stage)).start();
      traceRenderer.value && frameWriter.leave("< Mouse Visitor");

      var domain = avm2.systemDomain;

      if (renderFrame) {
        frameTime = now;
        nextRenderAt = frameTime + maxDelay;

        domain.broadcastMessage("constructFrame",
                                new flash.events.Event("constructFrame"));
        domain.broadcastMessage("frameConstructed",
                                new flash.events.Event("frameConstructed"));
        domain.broadcastMessage("enterFrame",
                                new flash.events.Event("enterFrame"));
      }

      if (stage._deferRenderEvent) {
        stage._deferRenderEvent = false;
        domain.broadcastMessage("render", new flash.events.Event("render"));
      }

      if (refreshStage || renderFrame) {
        ctx.beginPath();
        traceRenderer.value && frameWriter.enter("> Pre Visitor");
        (new PreVisitor(stage, ctx)).start();
        (new RenderVisitor(stage, ctx, refreshStage)).start();
        traceRenderer.value && frameWriter.leave("< Pre Visitor");
      }

      if (renderFrame) {
        domain.broadcastMessage("exitFrame",
                                new flash.events.Event("exitFrame"));

        if (events.onAfterFrame) {
          events.onAfterFrame();
        }
      }

      stage._syncCursor();

      if (traceRenderer.value) {
        for (var name in FrameCounter.counts) {
          appendToFrameTerminal(name + ": " + FrameCounter.counts[name], "gray");
        }
      }
    } else {
      traceRenderer.value && appendToFrameTerminal("Skip Frame", "black");
    }

    sampleEnd();

    if (renderingTerminated) {
      if (events.onTerminated) {
        events.onTerminated();
      }
      return;
    }

    requestAnimationFrame(draw);
  })();
}
