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
/*global rgbaObjToStr, FirefoxCom, Timer, FrameCounter, metrics, coreOptions, OptionSet, Option, appendToFrameTerminal, frameWriter, randomStyle*/

var rendererOptions = coreOptions.register(new OptionSet("Renderer Options"));
var traceRenderer = rendererOptions.register(new Option("tr", "traceRenderer", "number", 0, "trace renderer execution"));
var disablePreVisitor = rendererOptions.register(new Option("dpv", "disablePreVisitor", "boolean", false, "disable pre visitor"));
var disableRenderVisitor = rendererOptions.register(new Option("drv", "disableRenderVisitor", "boolean", false, "disable render visitor"));
var disableMouseVisitor = rendererOptions.register(new Option("dmv", "disableMouseVisitor", "boolean", false, "disable mouse visitor"));
var showRedrawRegions = rendererOptions.register(new Option("rr", "showRedrawRegions", "boolean", false, "show redraw regions"));
var renderAsWireframe = rendererOptions.register(new Option("raw", "renderAsWireframe", "boolean", false, "render as wireframe"));
var showQuadTree = rendererOptions.register(new Option("qt", "showQuadTree", "boolean", false, "show quad tree"));
var turboMode = rendererOptions.register(new Option("", "turbo", "boolean", false, "turbo mode"));


var enableConstructChildren = rendererOptions.register(new Option("", "constructChildren", "boolean", true, "Construct Children"));
var enableEnterFrame = rendererOptions.register(new Option("", "enterFrame", "boolean", true, "Enter Frame"));
var enableAdvanceFrame = rendererOptions.register(new Option("", "advanceFrame", "boolean", true, "Advance Frame"));

if (typeof FirefoxCom !== 'undefined') {
  turboMode.value = FirefoxCom.requestSync('getBoolPref', {pref: 'shumway.turboMode', def: false});
}

var CanvasCache = {
  cache: [],
  getCanvas: function getCanvas(protoCanvas) {
    var tempCanvas = this.cache.shift();
    if (!tempCanvas) {
      tempCanvas = {
        canvas: document.createElement('canvas')
      };
      tempCanvas.ctx = tempCanvas.canvas.getContext('2d');
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
      visitor.visit(child, visitContainer, context);
    }
  }

  visitor.childrenEnd(container);
}

var BlendModeNameMap = {
  "normal": 'normal',
  "multiply": 'multiply',
  "screen": 'screen',
  "lighten": 'lighten',
  "darken": 'darken',
  "difference": 'difference',
  "overlay": 'overlay',
  "hardlight": 'hard-light'
};

function getBlendModeName(blendMode) {
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

  return BlendModeNameMap[blendMode] || 'normal';
}

function RenderVisitor(root, ctx, invalidPath, refreshStage) {
  this.root = root;
  this.ctx = ctx;
  this.depth = 0;
  this.invalidPath = invalidPath;
  this.refreshStage = refreshStage;

  this.clipDepth = null;
  this.clipStack = null;
}
RenderVisitor.prototype = {
  ignoreVisibleAttribute: false,
  start: function () {
    visitContainer(this.root, this,
                   new RenderingContext(this.refreshStage, this.invalidPath));
  },
  startFragment: function(matrix) {
    var root = this.root;
    // HACK: temporarily set the root DisplayObject's currentTransform
    //       to the matrix passed in via BitmapData.draw(), to make masks
    //       work properly which rely on _getConcatenatedTransform to set
    //       the initial transformation on the temporary canvases.
    var currentTransform = root._currentTransform;
    var t = currentTransform;
    if (matrix) {
      t = root._currentTransform = {
        a: matrix.a,
        b: matrix.b,
        c: matrix.c,
        d: matrix.d,
        tx: matrix.tx * 20|0,
        ty: matrix.ty * 20|0
      };
      root._invalidateTransform();
    }
    // HACK compensate for visit()/renderDisplayObject() transform
    var inverse;
    if (t) {
      inverse = new flash.geom.Matrix(t.a, t.b, t.c, t.d, t.tx / 20, t.ty / 20);
      inverse.invert();
      this.ctx.save();
      this.ctx.transform(inverse.a, inverse.b, inverse.c, inverse.d,
                         inverse.tx, inverse.ty);
    }

    this.visit(root, visitContainer, new RenderingContext(this.refreshStage, this.invalidPath));

    if (t) {
      this.ctx.restore();
    }
    if (matrix) {
      root._currentTransform = currentTransform;
      root._invalidateTransform();
    }
  },
  childrenStart: function(parent) {
    if (this.depth === 0) {
      var ctx = this.ctx;

      ctx.save();

      if (this.invalidPath && !this.refreshStage && !renderAsWireframe.value) {
        this.invalidPath.draw(ctx);
        ctx.clip();
      }

      var bgcolor = this.root._color;
      if (bgcolor) {
        if (bgcolor.alpha < 255) {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
        if (bgcolor.alpha > 0) {
          ctx.fillStyle = rgbaObjToStr(bgcolor);
          if (this.invalidPath && !this.refreshStage && !renderAsWireframe.value) {
            ctx.fill();
          } else {
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
        var clipDepthInfo = this.clipDepth.pop();
        // blend mask/maskee canvases and draw result into original
        this.clipEnd(clipDepthInfo);
        // restore original context
        this.ctx = clipDepthInfo.ctx;
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
      this.invalidPath = null;
    }
  },
  visit: function (child, visitContainer, context) {
    var ctx = this.ctx;

    var parentHasClippingMask = context.isClippingMask;
    var parentColorTransform = context.colorTransform;

    var clippingMask = (parentHasClippingMask === true);

    if (child._cxform) {
      context.colorTransform = parentColorTransform.applyCXForm(child._cxform);
    }

    if (!clippingMask) {
      // remove clipping if the required character depth is achieved
      while (this.clipDepth && this.clipDepth.length > 0 &&
          child._depth > this.clipDepth[0].clipDepth)
      {
        var clipDepthInfo = this.clipDepth.shift();
        // blend mask/maskee canvases and draw result into original
        this.clipEnd(clipDepthInfo);
        // restore original context
        ctx = this.ctx = clipDepthInfo.ctx;
      }
      if (child._clipDepth) {
        // child is a clipping mask
        context.isClippingMask = clippingMask = true;
        // create temporary mask/maskee canvases
        var clipDepthInfo = this.clipStart(child);
        // save clipping until certain character depth
        if (!this.clipDepth) {
          this.clipDepth = [clipDepthInfo];
        } else {
          this.clipDepth.unshift(clipDepthInfo);
        }
        // use mask canvas
        ctx = this.ctx = clipDepthInfo.mask.ctx;
      } else {
        // child is not a clipping mask. check if it is masked by one
        if (this.clipDepth && this.clipDepth.length > 0 &&
            child._depth <= this.clipDepth[0].clipDepth)
        {
          // use maskee canvas
          ctx = this.ctx = this.clipDepth[0].maskee.ctx;
        }
      }
    }

    if (clippingMask && child._isContainer) {
      ctx.save();
      renderDisplayObject(child, ctx, context);
      for (var i = 0, n = child._children.length; i < n; i++) {
        var child1 = child._children[i];
        if (!child1) {
          continue;
        }
        if (this.ignoreVisibleAttribute || (child1._visible && !child1._maskedObject)) {
          this.visit(child1, visitContainer, context);
        }
      }
      ctx.restore();
      ctx.fill();
      context.isClippingMask = parentHasClippingMask;
      context.colorTransform = parentColorTransform;
      return;
    }

    ctx.save();

    ctx.globalCompositeOperation = getBlendModeName(child._blendMode);

    if (child._mask) {
      var clipInfo = this.clipStart(child);
      var mask = clipInfo.mask;
      var maskee = clipInfo.maskee;

      var savedClipDepth = this.clipDepth;
      this.clipDepth = null;
      this.ctx = mask.ctx;
      this.visit(child._mask, visitContainer, new RenderingContext(this.refreshStage));
      this.ctx = ctx;
      this.clipDepth = savedClipDepth;

      renderDisplayObject(child, maskee.ctx, context);

      if (child._isContainer) {
        this.ctx = maskee.ctx;
        visitContainer(child, this, context);
        this.ctx = ctx;
      }

      this.clipEnd(clipInfo);
    } else {
      renderDisplayObject(child, ctx, context);

      if (child._isContainer) {
        visitContainer(child, this, context);
      }
    }

    ctx.restore();

    if (clippingMask) {
      ctx.fill();
    }
    context.isClippingMask = parentHasClippingMask;
    context.colorTransform = parentColorTransform;
  },

  clipStart: function(child) {
    var m = child._parent._getConcatenatedTransform(true);
    var tx = m.tx / 20;
    var ty = m.ty / 20;

    // TODO create canvas small enough to fit the object and
    // TODO cache the results when cacheAsBitmap is set

    var mask = CanvasCache.getCanvas(this.ctx.canvas);
    mask.ctx.setTransform(m.a, m.b, m.c, m.d, tx, ty);

    var maskee = CanvasCache.getCanvas(this.ctx.canvas);
    maskee.ctx.setTransform(m.a, m.b, m.c, m.d, tx, ty);

    var clipInfo = {
      ctx: this.ctx,
      mask: mask,
      maskee: maskee,
      clipDepth: child._clipDepth
    };

    return clipInfo;
  },
  clipEnd: function(clipInfo) {
    var ctx = clipInfo.ctx;
    var mask = clipInfo.mask;
    var maskee = clipInfo.maskee;

    maskee.ctx.globalCompositeOperation = 'destination-in';
    maskee.ctx.setTransform(1, 0, 0, 1, 0, 0);
    maskee.ctx.drawImage(mask.canvas, 0, 0);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(maskee.canvas, 0, 0);
    ctx.restore();

    CanvasCache.releaseCanvas(mask);
    CanvasCache.releaseCanvas(maskee);
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
      style = typeof style === 'function' ? style(ctx, this) : this.convertColor(style);
    } else if (typeof style === 'number') {
      style = this.convertNumericColor(style);
    } else if (typeof style === 'function') {
      style = style.defaultFillStyle;
    }
    ctx.fillStyle = style;
  },
  setStrokeStyle: function (ctx, style) {
    if (this.mode === 'complex') {
      style = typeof style === 'function' ? style(ctx, this) : this.convertColor(style);
    } else if (typeof style === 'number') {
      style = this.convertNumericColor(style);
    } else if (typeof style === 'function') {
      style = style.defaultFillStyle;
    }
    ctx.strokeStyle = style;
  },
  addGradientColorStop: function (gradient, ratio, style) {
    if (this.mode === 'complex') {
      style = this.convertColor(style);
    } else if (typeof style === 'number') {
      style = this.convertNumericColor(style);
    }
    gradient.addColorStop(ratio, style);
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
      return style;
    }

    var r = Math.min(255, Math.max(0, m[1] * t[0] + t[4])) | 0;
    var g = Math.min(255, Math.max(0, m[2] * t[1] + t[5])) | 0;
    var b = Math.min(255, Math.max(0, m[3] * t[2] + t[6])) | 0;
    var a = Math.min(1, Math.max(0, m[4] * t[3] + (t[7] / 256)));
    return "rgba(" + r + ',' + g + ',' + b + ',' + a + ')';
  },
  getTransformFingerprint: function () {
    return this.transform.join('|');
  }
};

function RenderingContext(refreshStage, invalidPath) {
  this.refreshStage = refreshStage === true;
  this.invalidPath = invalidPath;
  this.isClippingMask = false;
  this.colorTransform = new RenderingColorTransform();
}

function renderDisplayObject(child, ctx, context) {
  var m = child._currentTransform;
  if (m) {
    if (m.a * m.d == m.b * m.c) {
      // Workaround for bug 844184 -- the object is invisible
      ctx.closePath();
      ctx.rect(0, 0, 0, 0);
      ctx.clip();
    } else {
      ctx.transform(m.a, m.b, m.c, m.d, m.tx/20, m.ty/20);
    }
  }

  if (!renderAsWireframe.value) {

    if (child._alpha !== 1) {
      ctx.globalAlpha *= child._alpha;
    }

    if (context.invalidPath && !child._invalid && !context.refreshStage) {
      return;
    }

    // TODO: move into Graphics class
    if (child._graphics) {
      var graphics = child._graphics;

      if (graphics._bitmap) {
        ctx.save();
        ctx.translate(child._bbox.xMin/20, child._bbox.yMin/20);
        context.colorTransform.setAlpha(ctx, true);
        ctx.drawImage(graphics._bitmap, 0, 0);
        ctx.restore();
      } else {
        graphics.draw(ctx, context.isClippingMask, child.ratio,
                      context.colorTransform);
      }
    }

    if (child.draw) {
      child.draw(ctx, child.ratio, context.colorTransform);
    }

  } else {

    if (!child._invalid && !context.refreshStage) {
      return;
    }

    if (child.getBounds) {
      var b = child.getBounds(null);
      if (b && b.xMax - b.xMin > 0 && b.yMax - b.yMin > 0) {
        if (!child._wireframeStrokeStyle) {
          child._wireframeStrokeStyle = randomStyle();
        }
        ctx.save();
        ctx.strokeStyle = child._wireframeStrokeStyle;
        var x = b.xMin / 20;
        var y = b.yMin / 20;
        ctx.strokeRect(x + 0.5, y + 0.5, b.xMax/20 - x - 1, b.yMax/20 - y - 1);
        ctx.restore();
      }
    }

  }

  child._invalid = false;
}

function renderQuadTree(ctx, qtree) {
  ctx.strokeRect(qtree.x/20, qtree.y/20, qtree.width/20, qtree.height/20);
  var nodes = qtree.nodes;
  for (var i = 0; i < nodes.length; i++) {
    renderQuadTree(ctx, nodes[i]);
  }
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

var timeline;

function timelineEnter(name) {
  timeline && timeline.enter(name);
}

function timelineLeave(name) {
  timeline && timeline.leave(name);
}

function timelineWrapBroadcastMessage(domain, message) {
  timelineEnter(message);
  domain.broadcastMessage(message);
  timelineLeave(message);
}

function renderStage(stage, ctx, events) {
  var frameWidth, frameHeight;

  function updateRenderTransform() {
    frameWidth = ctx.canvas.width;
    frameHeight = ctx.canvas.height;

    var scaleX = frameWidth / stage._stageWidth * 20;
    var scaleY = frameHeight / stage._stageHeight * 20;

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
      offsetX = frameWidth - scaleX * stage._stageWidth / 20;
    } else {
      offsetX = (frameWidth - scaleX * stage._stageWidth / 20) / 2;
    }
    if (align.indexOf('T') >= 0) {
      offsetY = 0;
    } else if (align.indexOf('B') >= 0) {
      offsetY = frameHeight - scaleY * stage._stageHeight / 20;
    } else {
      offsetY = (frameHeight - scaleY * stage._stageHeight / 20) / 2;
    }

    ctx.setTransform(scaleX, 0, 0, scaleY, offsetX, offsetY);

    var m = stage._concatenatedTransform;
    m.a = scaleX;
    m.d = scaleY;
    m.tx = offsetX * 20;
    m.ty = offsetY * 20;
  }

  updateRenderTransform();

  var frameTime = 0;
  var maxDelay = 1000 / stage._frameRate;
  var nextRenderAt = performance.now();

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
    var m = stage._concatenatedTransform;
    var scaleX = m.a, scaleY = m.d;
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

    var now = performance.now();
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
    } else {
      stage._handleMouseButtons();
    }

    if (renderFrame || refreshStage || mouseMoved) {
      FrameCounter.clear();
      var frameStartTime = performance.now();
      traceRenderer.value && appendToFrameTerminal("Begin Frame #" + (frameCount++), "purple");

      var domain = avm2.systemDomain;

      if (renderFrame) {
        frameTime = now;
        maxDelay = 1000 / stage._frameRate;
        if (!turboMode.value) {
          while (nextRenderAt < now) {
            nextRenderAt += maxDelay;
          }
        }
        timelineEnter("EVENTS");
        if (firstRun) {
          // Initial display list is already constructed, skip frame construction phase.
          firstRun = false;
        } else {
          enableAdvanceFrame.value && timelineWrapBroadcastMessage(domain, "advanceFrame");
          enableEnterFrame.value && timelineWrapBroadcastMessage(domain, "enterFrame");
          enableConstructChildren.value && timelineWrapBroadcastMessage(domain, "constructChildren");
        }

        timelineWrapBroadcastMessage(domain, "frameConstructed");
        timelineWrapBroadcastMessage(domain, "executeFrame");
        timelineWrapBroadcastMessage(domain, "exitFrame");
        timelineLeave("EVENTS");
      }

      if (stage._deferRenderEvent) {
        stage._deferRenderEvent = false;
        domain.broadcastMessage("render", "render");
      }

      if (isCanvasVisible(ctx.canvas) && (refreshStage || renderFrame)) {

        var invalidPath = null;

        if (!disablePreVisitor.value) {
          traceRenderer.value && frameWriter.enter("> Pre Visitor");
          timelineEnter("PRE");
          invalidPath = stage._processInvalidRegions(true);
          timelineLeave("PRE");
          traceRenderer.value && frameWriter.leave("< Pre Visitor");
        } else {
          stage._processInvalidRegions(false);
        }

        if (!disableRenderVisitor.value) {
          timelineEnter("RENDER");
          traceRenderer.value && frameWriter.enter("> Render Visitor");
          (new RenderVisitor(stage, ctx, invalidPath, refreshStage)).start();
          traceRenderer.value && frameWriter.leave("< Render Visitor");
          timelineLeave("RENDER");
        }

        if (showQuadTree.value) {
          ctx.strokeStyle = 'green';
          renderQuadTree(ctx, stage._qtree);
        }

        if (invalidPath && !refreshStage && showRedrawRegions.value) {
          ctx.strokeStyle = 'red';
          invalidPath.draw(ctx);
          ctx.stroke();
        }
      }

      if (mouseMoved && !disableMouseVisitor.value) {
        renderFrame && timelineEnter("MOUSE");
        traceRenderer.value && frameWriter.enter("> Mouse Visitor");
        stage._handleMouse();
        traceRenderer.value && frameWriter.leave("< Mouse Visitor");
        renderFrame && timelineLeave("MOUSE");

        ctx.canvas.style.cursor = stage._cursor;
      }

      if (renderFrame && events.onAfterFrame) {
        events.onAfterFrame();
      }

      if (traceRenderer.value) {
        frameWriter.enter("> Frame Counters");
        for (var name in FrameCounter.counts) {
          frameWriter.writeLn(name + ": " + FrameCounter.counts[name]);
        }
        frameWriter.leave("< Frame Counters");
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
