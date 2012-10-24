/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

//function renderShadowCanvas(child) {
//  var cache = child.hitTestCache;
//
//  var bounds = child.getBounds();
//  var offsetX = Math.floor(bounds.x / 20);
//  var offsetY = Math.floor(bounds.y / 20);
//  var sizeX = Math.ceil(bounds.width / 20);
//  var sizeY = Math.ceil(bounds.height / 20);
//
//  var canvas = cache.canvas;
//  if (!canvas) {
//    cache.canvas = canvas = document.createElement('canvas');
//    cache.isPixelPainted = function(x, y) {
//      x = 0 | (x - offsetX);
//      y = 0 | (y - offsetY);
//      if (x < 0 || y < 0 || x >= sizeX || y >= sizeY)
//        return false;
//      var data = cache.imageData.data;
//      var result = data[(x + sizeX * y) * 4 + 3];
//      return !!result;
//    };
//  }
//
//  if (sizeX <= 0 || sizeY <= 0)
//    return;
//
//  canvas.width = sizeX;
//  canvas.height = sizeY;
//
//  var ctx = canvas.getContext('2d');
//  ctx.save();
//  ctx.mozFillRule = 'evenodd';
//  ctx.clearRect(0, 0, sizeX, sizeY);
//  ctx.translate(-offsetX, -offsetY);
//  ctx.scale(0.05, 0.05);
//
//  if (child.draw)
//    child.draw(ctx, child.ratio);
//  else if (child.nextFrame) {
//    var renderContext = {
//      isHitTestRendering: true,
//      beginDrawing: function() { return ctx; },
//      endDrawing: function() {}
//    };
//    child.renderNextFrame(renderContext);
//  }
//
//  ctx.restore();
//
//  cache.ratio = child.ratio;
//  cache.imageData = ctx.getImageData(0, 0, sizeX, sizeY);
//}

function renderStage(stage, ctx) {
  // All the visitors close over this class to do instance testing.
  const MovieClipClass = avm2.systemDomain.getClass("flash.display.MovieClip");

  function visitContainer(container, visitor) {
    var children = container._children;
    visitor.childrenStart(container);
    for (var i = 0, n = children.length; i < n; i++) {
      var child = children[i];
      if (child) {
        var isContainer = MovieClipClass.isInstanceOf(child);
        visitor.visit(child, isContainer);
        if (isContainer) {
          visitContainer(child, visitor);
        }
      }
    }
    visitor.childrenEnd(container);
  }

  function EnterFrameVisitor() {
  }
  EnterFrameVisitor.prototype = {
    childrenStart: function() {},
    childrenEnd: function() {},
    visit: function (obj) {
      if (MovieClipClass.isInstanceOf(obj)) {
        if (obj.isPlaying()) {
          obj.nextFrame();
        }
        obj.dispatchEvent(new flash.events.Event("enterFrame"));
      }
    }
  };

  function ExitFrameVisitor() {
  }
  ExitFrameVisitor.prototype = {
    childrenStart: function() {},
    childrenEnd: function() {},
    visit: function (obj) {
      if (MovieClipClass.isInstanceOf(obj)) {
        obj.dispatchEvent(new flash.events.Event("exitFrame"));
      }
    }
  };

  function RenderVisitor(ctx) {
    this.depth = 0;
    this.ctx = ctx;
  }
  RenderVisitor.prototype = {
    childrenStart: function(parent) {
      if (this.depth == 0) {
        var ctx = this.ctx;
        var stage = parent;
        var frameWidth = ctx.canvas.width;
        var frameHeight = ctx.canvas.height;

        var scaleX = frameWidth / stage.stageWidth;
        var scaleY = frameHeight / stage.stageHeight;
        var scale = Math.min(scaleX, scaleY);
        var offsetX = (frameWidth - scale * stage.stageWidth) / 2;
        var offsetY = (frameHeight - scale * stage.stageHeight) / 2;

        ctx.clearRect(0, 0, frameWidth, frameHeight);
        ctx.save();
        ctx.translate(offsetX, offsetY);

        ctx.canvas.currentTransform = {
          scale: scale,
          offsetX: offsetX,
          offsetY: offsetY
        };
      }
      this.depth++;

      // TODO move into separate visitor?
      if (MovieClipClass.isInstanceOf(parent) && parent._scriptExecutionPending) {
        parent.callFrame(parent.currentFrame);
        parent._scriptExecutionPending = false;
      }
    },
    childrenEnd: function(parent) {
      this.depth--;
      this.ctx.restore();
    },
    visit: function (child, isContainer) {
      var ctx = this.ctx;
      ctx.save();
      //if (child.matrix && !child.$fixMatrix)
      //  child.matrix = create(child.matrix);
      //if (child.cxform && !child.$fixCxform)
      //  child.cxform = create(child.cxform);

      var m = child._currentTransformMatrix;
      ctx.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);

      var cxform = child._cxform;
      if (cxform) {
        // We only support alpha channel transformation for now
        ctx.globalAlpha = (ctx.globalAlpha * cxform.alphaMultiplier + cxform.alphaOffset) / 256;
      }

      if (child._graphics) {
        var graphics = child._graphics;

        var scale = graphics._scale;
        if (scale !== 1)
          ctx.scale(scale, scale);

        var subpaths = graphics._subpaths;
        for (var j = 0, o = subpaths.length; j < o; j++) {
          var path = subpaths[j];
          if (path.fillStyle) {
            ctx.fillStyle = path.fillStyle;
            if (path.fillTransform) {
              var m = path.fillTransform;
              path.__draw__(ctx);
              ctx.save();
              ctx.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
              ctx.fill();
              ctx.restore();
            } else {
              ctx.fill(path);
            }
          }
          if (path.strokeStyle) {
            ctx.strokeStyle = path.strokeStyle;
            var drawingStyles = path.drawingStyles;
            for (var prop in drawingStyles)
              ctx[prop] = drawingStyles[prop];
            ctx.stroke(path);
          }
        }
      }

      if (child.draw) {
        child.draw(ctx, child.ratio);
      }

      if (!isContainer) {
        // letting the container to restore transforms after all children are painted
        ctx.restore();
      }

      //if (child.hitTestCache && child.hitTestCache.ratio != child.ratio)
      //  renderShadowCanvas(child);
    }
  };

  var frameTime = 0;
  var maxDelay = 1000 / stage.frameRate;

  ctx.mozFillRule = 'evenodd';

  var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

  var FPS = (function () {
    var width = Math.max(ctx.canvas.width / 5, 100);
    var height = width / 8;
    var sampleWidth = 2;
    var sampleCount = width / (sampleWidth + 1);
    var last = null;
    var samples = [];
    var max = 0;

    return {
      tick: function () {
        var curr = new Date();
        if (last) {
          if (samples.length > sampleCount) {
            samples.shift();
          }
          var elapsed = curr - last;
          samples.push(elapsed);
          var sum = 0;
          for (var i = 0; i < samples.length; i++) {
            sum += samples[i];
            max = Math.max(max, samples[i]);
          }
          var avg = sum / samples.length;
          var xOffset = ctx.canvas.width - width;
          var yOffset = height;
          for (var i = 0; i < samples.length; i++) {
            var scaledSample = (samples[i] / (2 * avg));
            ctx.fillRect(xOffset + i * (sampleWidth + 1), yOffset, sampleWidth, - scaledSample * height);
          }
          ctx.font = "6pt Verdana";
          ctx.fillText("FPS: " + (1000 / avg).toFixed(2), xOffset, height + 15);
        }
        last = curr;
      }
    };
  })();


  (function draw() {
    var now = +new Date;
    if (now - frameTime >= maxDelay) {
      frameTime = now;
      visitContainer(stage, new EnterFrameVisitor());
      visitContainer(stage, new RenderVisitor(ctx));
      visitContainer(stage, new ExitFrameVisitor());
      FPS.tick();
    }
    requestAnimationFrame(draw);
  })();
}
