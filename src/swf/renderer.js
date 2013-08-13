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
/*global toStringRgba, FirefoxCom, TRACE_SYMBOLS_INFO, Timer, FrameCounter, metrics, coreOptions, OptionSet, Option, appendToFrameTerminal, frameWriter*/

var rendererOptions = coreOptions.register(new OptionSet("Renderer Options"));
var traceRenderer = rendererOptions.register(new Option("tr", "traceRenderer", "number", 0, "trace renderer execution"));
var disablePreVisitor = rendererOptions.register(new Option("dpv", "disablePreVisitor", "boolean", false, "disable pre visitor"));
var disableRenderVisitor = rendererOptions.register(new Option("drv", "disableRenderVisitor", "boolean", false, "disable render visitor"));
var disableMouseVisitor = rendererOptions.register(new Option("dmv", "disableMouseVisitor", "boolean", false, "disable mouse visitor"));
var showRedrawRegions = rendererOptions.register(new Option("rr", "showRedrawRegions", "boolean", false, "show redraw regions"));

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

function isCanvasVisible(canvas) {
  if (canvas.ownerDocument.hidden) { // Page Visibility API
    return false;
  }
  if (canvas.mozVisible === false) { // HACK Canvas Visibility API
    return false;
  }
  return true;
}

function visitContainer(container, visitor) {
  var children = container._children;

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
    }
  }

  visitor.childrenEnd(container);
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
          if (this.refreshStage) {
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          } else {
            ctx.fill();
          }
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
  var frameFPSAverage = new metrics.Average(120);
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
      mouseMoved = stage._mouseOver;
    }

    if (renderFrame || refreshStage || mouseMoved) {
      FrameCounter.clear();
      var frameStartTime = performance.now();
      traceRenderer.value && appendToFrameTerminal("Begin Frame #" + (frameCount++), "purple");
      if (!disableMouseVisitor.value) {
        traceRenderer.value && frameWriter.enter("> Mouse Visitor");
        stage._handleMouse();
        traceRenderer.value && frameWriter.leave("< Mouse Visitor");
      }

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
        var canvasVisible = isCanvasVisible(ctx.canvas);
        ctx.beginPath();
        if (canvasVisible && !disablePreVisitor.value) {
          stage._showRedrawRegions(showRedrawRegions.value);
          traceRenderer.value && frameWriter.enter("> Pre Visitor");
          stage._prepareInvalidRegions(ctx);
          traceRenderer.value && frameWriter.leave("< Pre Visitor");
        }
        if (canvasVisible && !disableRenderVisitor.value) {
          traceRenderer.value && frameWriter.enter("> Render Visitor");
          (new RenderVisitor(stage, ctx, refreshStage)).start();
          traceRenderer.value && frameWriter.leave("< Render Visitor");
        }
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
        var frameElapsedTime = performance.now() - frameStartTime;
        var frameFPS = 1000 / frameElapsedTime;
        frameFPSAverage.push(frameFPS);
        traceRenderer.value && appendToFrameTerminal("End Frame Time: " + frameElapsedTime.toFixed(2) + " (" + frameFPS.toFixed(2) + " fps, " + frameFPSAverage.average().toFixed(2) + " average fps)", "purple");

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
