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
/*global rgbaObjToStr, FirefoxCom, Timer, FrameCounter, metrics, coreOptions, OptionSet, Option, appendToFrameTerminal, frameWriter*/

var rendererOptions = coreOptions.register(new OptionSet("Renderer Options"));
var traceRenderer = rendererOptions.register(new Option("tr", "traceRenderer", "number", 0, "trace renderer execution"));
var disablePreVisitor = rendererOptions.register(new Option("dpv", "disablePreVisitor", "boolean", false, "disable pre visitor"));
var disableRenderVisitor = rendererOptions.register(new Option("drv", "disableRenderVisitor", "boolean", false, "disable render visitor"));
var disableMouseVisitor = rendererOptions.register(new Option("dmv", "disableMouseVisitor", "boolean", false, "disable mouse visitor"));
var showRedrawRegions = rendererOptions.register(new Option("rr", "showRedrawRegions", "boolean", false, "show redraw regions"));
var renderAsWireframe = rendererOptions.register(new Option("raw", "renderAsWireframe", "boolean", false, "render as wireframe"));
var showQuadTree = rendererOptions.register(new Option("qt", "showQuadTree", "boolean", false, "show quad tree"));

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

function visitContainer(container, visitor, context) {
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

      visitor.visit(child, isContainer, visitContainer, context);
    }
  }

  visitor.childrenEnd(container);
}

function getBlendModeName(blendMode) {
  var blendModeCanvas;
  var blendModeClass = flash.display.BlendMode.class;
  if (blendMode !== blendModeClass.NORMAL) {

    // TODO:

    // These Flash blend modes have no canvas equivalent:
    // - blendModeClass.SUBTRACT
    // - blendModeClass.INVERT
    // - blendModeClass.SHADER
    // - blendModeClass.ADD

    // These blend modes are actually Porter-Duff compositing operators.
    // The backdrop is the nearest parent with blendMode set to LAYER.
    // When there is no LAYER parent, they are ignored (treated as NORMAL).
    // - blendModeClass.ALPHA (destination-in)
    // - blendModeClass.ERASE (destination-out)
    // - blendModeClass.LAYER [defines backdrop]

    var blendModeCanvas;
    switch (blendMode) {
      case blendModeClass.MULTIPLY:   blendModeCanvas = "multiply";        break;
      case blendModeClass.SCREEN:     blendModeCanvas = "screen";          break;
      case blendModeClass.LIGHTEN:    blendModeCanvas = "lighten";         break;
      case blendModeClass.DARKEN:     blendModeCanvas = "darken";          break;
      case blendModeClass.DIFFERENCE: blendModeCanvas = "difference";      break;
      case blendModeClass.OVERLAY:    blendModeCanvas = "overlay";         break;
      case blendModeClass.HARDLIGHT:  blendModeCanvas = "hard-light";      break;
    }
  }
  return (blendModeCanvas !== undefined) ? blendModeCanvas : "normal";
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
    visitContainer(this.root, this, new RenderingContext(this.refreshStage));
  },
  startFragment: function() {
    var isContainer = flash.display.DisplayObjectContainer.class.isInstanceOf(this.root) ||
                      flash.display.SimpleButton.class.isInstanceOf(this.root);

    // HACK compensate for visit()/renderDisplayObject() transform
    var t = this.root._currentTransform, inverse;
    if (t) {
      inverse = new flash.geom.Matrix(t.a, t.b, t.c, t.d, t.tx, t.ty);
      inverse.invert();
    } else {
      inverse = new flash.geom.Matrix();
    }
    this.ctx.save();
    this.ctx.transform(inverse.a, inverse.b, inverse.c, inverse.d, inverse.tx, inverse.ty);

    this.visit(this.root, isContainer, visitContainer, new RenderingContext(this.refreshStage));

    this.ctx.restore();
  },
  childrenStart: function(parent) {
    if (this.depth === 0) {
      var ctx = this.ctx;

      ctx.save();

      if (!this.refreshStage && !renderAsWireframe.value) {
        ctx.clip();
      }

      var bgcolor = this.root._color;
      if (bgcolor) {
        if (bgcolor.alpha < 255) {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
        if (bgcolor.alpha > 0) {
          ctx.fillStyle = rgbaObjToStr(bgcolor);
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
  visit: function (child, isContainer, visitContainer, context) {
    var ctx = this.ctx;

    var parentHasClippingMask = context.isClippingMask;
    var parentColorTransform = context.colorTransform;

    var clippingMask = parentHasClippingMask === true;
    if (child._cxform) {
      context.colorTransform = parentColorTransform.applyCXForm(child._cxform);
    }

    if (!clippingMask) {
      // removing clipping if the required character depth is achived
      while (this.clipDepth && this.clipDepth.length > 0 &&
          child._depth > this.clipDepth[0]) {
        this.clipDepth.shift();
        ctx.restore();
      }
      if (child._clipDepth) {
        if (!this.clipDepth) {
          this.clipDepth = [];
        }
        context.isClippingMask = clippingMask = true;
        // saving clipping until certain character depth
        this.clipDepth.unshift(child._clipDepth);
        ctx.save();
      }
    }

    if (clippingMask && isContainer) {
      ctx.save();
      renderDisplayObject(child, ctx, child._currentTransform, context);
      for (var i = 0, n = child._children.length; i < n; i++) {
        var child1 = child._children[i];
        if (!child1) {
          continue;
        }
        if (this.ignoreVisibleAttribute || (child1._visible && !child1._maskedObject)) {
          var isContainer = flash.display.DisplayObjectContainer.class.isInstanceOf(child1) ||
                            flash.display.SimpleButton.class.isInstanceOf(child1);
          this.visit(child1, isContainer, visitContainer, context);
        }
      }
      ctx.restore();
      ctx.clip();
      context.isClippingMask = parentHasClippingMask;
      context.colorTransform = parentColorTransform;
      return;
    }

    ctx.save();

    ctx.globalCompositeOperation = getBlendModeName(child._blendMode);

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
      this.visit(child._mask, isMaskContainer, visitContainer, new RenderingContext(this.refreshStage));
      this.ctx = ctx;

      tempCanvas = CanvasCache.getCanvas(ctx.canvas);
      tempCtx = tempCanvas.ctx;
      tempCtx.currentTransform = ctx.currentTransform;
      renderDisplayObject(child, tempCtx, child._currentTransform, context);

      if (isContainer) {
        this.ctx = tempCtx;
        visitContainer(child, this, context);
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
      renderDisplayObject(child, ctx, child._currentTransform, context);

      if (isContainer) {
        visitContainer(child, this, context);
      }
    }

    ctx.restore();

    if (clippingMask) {
      ctx.clip();
    }
    context.isClippingMask = parentHasClippingMask;
    context.colorTransform = parentColorTransform;
  }
};

function RenderingColorTransform() {
  this.mode = null;
  this.transform = [1, 1, 1, 1, 0, 0, 0, 0];
}
RenderingColorTransform.prototype = {
  applyCXForm: function (cxform) {
    var t = this.transform;
    t = [
      t[0] * cxform.redMultiplier / 256,
      t[1] * cxform.greenMultiplier / 256,
      t[2] * cxform.blueMultiplier / 256,
      t[3] * cxform.alphaMultiplier / 256,
      t[4] * cxform.redMultiplier / 256 + cxform.redOffset,
      t[5] * cxform.greenMultiplier / 256 + cxform.greenOffset,
      t[6] * cxform.blueMultiplier / 256 + cxform.blueOffset,
      t[7] * cxform.alphaMultiplier / 256 + cxform.alphaOffset
    ];

    var mode;
    var PRECISION = 1e-4;
    if (Math.abs(t[0] - 1) < PRECISION && Math.abs(t[1] - 1) < PRECISION &&
        Math.abs(t[2] - 1) < PRECISION && t[3] >= 0 &&
        Math.abs(t[4]) < PRECISION && Math.abs(t[5]) < PRECISION &&
        Math.abs(t[6]) < PRECISION && Math.abs(t[7]) < PRECISION) {
      mode = Math.abs(t[3] - 1) < PRECISION ? null : 'simple';
    } else {
      mode = 'complex';
    }
    var clone = Object.create(RenderingColorTransform.prototype);
    clone.mode = mode;
    clone.transform = t;
    return clone;
  },
  setFillStyle: function (ctx, style) {
    if (this.mode === 'complex') {
      style = this.convertColor(style);
    } else if (typeof style === 'number') {
      style = this.convertNumericColor(style);
    }
    ctx.fillStyle = style;
  },
  setStrokeStyle: function (ctx, style) {
    if (this.mode === 'complex') {
      style = this.convertColor(style);
    } else if (typeof style === 'number') {
      style = this.convertNumericColor(style);
    }
    ctx.strokeStyle = style;
  },
  setAlpha: function (ctx, force) {
    if (this.mode === 'simple' || force) {
      var t = this.transform;
      ctx.globalAlpha = Math.min(1, Math.max(0, ctx.globalAlpha * t[3]));
    }
  },
  convertNumericColor: function (num) {
    return '#' + (num | 0x1000000).toString(16).substr(1);
  },
  convertColor: function (style) {
    var t = this.transform;
    var m;
    switch (typeof style) {
    case 'string':
      if (style[0] === '#') {
        m = [undefined, parseInt(style.substr(1, 2), 16),
          parseInt(style.substr(3, 2), 16), parseInt(style.substr(5, 2), 16), 1.0];
      }
      m = m || /rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/.exec(style);
      if (!m) { // unknown string color
        return style;
      }
      break;
    case 'number':
      m = [style, style >> 16 & 0xff, style >> 8 & 0xff, style & 0xff, 1.0];
      break;
    default:
      // TODO gradient
      return style;
    }

    var r = Math.min(255, Math.max(0, m[1] * t[0] + t[4])) | 0;
    var g = Math.min(255, Math.max(0, m[2] * t[1] + t[5])) | 0;
    var b = Math.min(255, Math.max(0, m[3] * t[2] + t[6])) | 0;
    var a = Math.min(1, Math.max(0, m[4] * t[3] + (t[7] / 256)));
    return "rgba(" + r + ',' + g + ',' + b + ',' + a + ')';
  }
};

function RenderingContext(refreshStage) {
  this.refreshStage = refreshStage === true;
  this.isClippingMask = false;
  this.colorTransform = new RenderingColorTransform();
}

function renderDisplayObject(child, ctx, transform, context) {
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

  child._wireframeStrokeStyle = null;

  if (!renderAsWireframe.value) {

    if (child._alpha !== 1) {
      ctx.globalAlpha *= child._alpha;
    }

    if (!context.refreshStage && !child._invalid) {
      return;
    }

    // TODO: move into Graphics class
    if (child._graphics) {
      var graphics = child._graphics;

      if (graphics._bitmap) {
        ctx.save();
        ctx.translate(child._bbox.xMin, child._bbox.yMin);
        context.colorTransform.setAlpha(ctx, true);
        ctx.drawImage(graphics._bitmap, 0, 0);
        ctx.restore();
      } else {
        graphics.draw(ctx, context.isClippingMask, child.ratio, context.colorTransform);
      }
    }

    if (child.draw) {
      child.draw(ctx, child.ratio, context.colorTransform);
    }

  } else {

    if (!context.refreshStage && !child._invalid) {
      return;
    }

    if (child.getBounds) {
      var b = child.getBounds(child);
      if (b && b.xMax - b.xMin > 0 && b.yMax - b.yMin > 0) {
        child._wireframeStrokeStyle = randomStyle();
        ctx.save();
        ctx.strokeStyle = child._wireframeStrokeStyle;
        ctx.strokeRect(b.xMin + 0.5, b.yMin + 0.5, b.xMax - b.xMin - 1,
                       b.yMax - b.yMin - 1);
        ctx.restore();
      }
    }

  }

  child._invalid = false;
}

var fps;

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

  var firstRun = true;
  var frameCount = 0;
  var frameFPSAverage = new metrics.Average(120);

  (function draw() {

    var now = Date.now();
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

      var domain = avm2.systemDomain;

      if (renderFrame) {
        frameTime = now;
        maxDelay = 1000 / stage._frameRate;
        while (nextRenderAt < now) {
          nextRenderAt += maxDelay;
        }
        fps && fps.enter("EVENTS");
        if (firstRun) {
          // Initial display list is already constructed, skip frame construction phase.
          firstRun = false;
        } else {

          domain.broadcastMessage("advanceFrame");
          domain.broadcastMessage("enterFrame");
          domain.broadcastMessage("constructChildren");

        }

        domain.broadcastMessage("frameConstructed");
        domain.broadcastMessage("executeFrame");
        domain.broadcastMessage("exitFrame");
        fps && fps.leave("EVENTS");
      }

      if (stage._deferRenderEvent) {
        stage._deferRenderEvent = false;
        domain.broadcastMessage("render", "render");
      }

      if (isCanvasVisible(ctx.canvas) && (refreshStage || renderFrame)) {
        if (!disablePreVisitor.value) {
          ctx.beginPath();
          stage._showRedrawRegions(showRedrawRegions.value);

          traceRenderer.value && frameWriter.enter("> Pre Visitor");
          fps && fps.enter("PRE");
          stage._processInvalidRegions(ctx);
          fps && fps.leave("PRE");
          traceRenderer.value && frameWriter.leave("< Pre Visitor");
        }


        if (!disableRenderVisitor.value) {
          fps && fps.enter("RENDER");
          traceRenderer.value && frameWriter.enter("> Render Visitor");
          (new RenderVisitor(stage, ctx, refreshStage)).start();
          traceRenderer.value && frameWriter.leave("< Render Visitor");
          fps && fps.leave("RENDER");
        }

        if (showQuadTree.value) {
          ctx.save();
          ctx.strokeStyle = 'green';
          (function renderQuadTree(tree) {
            ctx.strokeRect(tree.x, tree.y, tree.width, tree.height);
            var nodes = tree.nodes;
            for (var i = 0; i < nodes.length; i++) {
              renderQuadTree(nodes[i]);
            }
          })(stage._qtree);
          ctx.restore();
        }
      }

      if (mouseMoved && !disableMouseVisitor.value) {
        fps && fps.enter("MOUSE");
        traceRenderer.value && frameWriter.enter("> Mouse Visitor");
        stage._handleMouse();
        traceRenderer.value && frameWriter.leave("< Mouse Visitor");
        fps && fps.leave("MOUSE");

        stage._syncCursor();
      }

      if (renderFrame && events.onAfterFrame) {
        events.onAfterFrame();
      }

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
