/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

function render(displayList, renderingContext) {
  var ctx = renderingContext.beginDrawing();
  var depths = [];
  var i = 0;
  for (depths[i++] in displayList);
  depths.sort(function(a, b) {
    return a - b;
  });
  var i = 0;
  var depth;
  while (depth = depths[i++]) {
    var character = displayList[depth];
    if (character) {
      ctx.save();
      var matrix = character.matrix;
      ctx.transform(
        matrix.scaleX,
        matrix.skew0,
        matrix.skew1,
        matrix.scaleY,
        matrix.translateX,
        matrix.translateY
      );
      var rotation = character.rotation;
      if (rotation)
        ctx.rotate(rotation * Math.PI / 180);
      var cxform = character.cxform;
      if (cxform) {
        // We only support alpha channel transformation for now
        ctx.globalAlpha = (ctx.globalAlpha * cxform.alphaMult + cxform.alphaAdd) / 256;
      }
      if (character.draw)
        character.draw(ctx, character.ratio);
      else if (character.nextFrame)
        character.renderNextFrame(renderingContext);

      ctx.restore();
      if (character.hitTestCache && character.hitTestCache.ratio != character.ratio)
        renderShadowCanvas(character);
    }
  }
  renderingContext.endDrawing();
}

function renderShadowCanvas(character) {
  var cache = character.hitTestCache;

  var bounds = 'getBounds' in character ? character.getBounds() : character.bounds;
  var offsetX = Math.floor(bounds.xMin / 20);
  var offsetY = Math.floor(bounds.yMin / 20);
  var sizeX = Math.ceil(bounds.xMax / 20) - offsetX;
  var sizeY = Math.ceil(bounds.yMax / 20) - offsetY;

  var canvas = cache.canvas;
  if (!canvas) {
    cache.canvas = canvas = document.createElement('canvas');
    cache.isPixelPainted = function(x, y) {
      x = 0 | (x - offsetX);
      y = 0 | (y - offsetY);
      if (x < 0 || y < 0 || x >= sizeX || y >= sizeY)
        return false;
      var result = this.ctx.getImageData(x, y, 1, 1).data;
      return !!result[3];
    };
  }
  canvas.width = sizeX;
  canvas.height = sizeY;

  var ctx = canvas.getContext('2d');
  ctx.save();
  ctx.mozFillRule = 'evenodd';
  ctx.clearRect(0, 0, sizeX, sizeY);
  ctx.translate(-offsetX, -offsetY);
  ctx.scale(0.05, 0.05);

  cache.ctx = ctx;
  cache.ratio = character.ratio;

  if (character.draw)
    character.draw(ctx, character.ratio);
  else if (character.nextFrame) {
    var renderContext = {
      isHitTestRendering: true,
      beginDrawing: function() { return ctx; },
      endDrawing: function() {}
    };
    character.renderNextFrame(renderContext);
  }

  ctx.restore();
}

function renderMovieClip(mc, rate, bounds, ctx) {
  var frameTime = 0;
  var maxDelay = 1000 / rate;
  var frameWidth = ctx.canvas.width;
  var frameHeight = ctx.canvas.height;

  ctx.mozFillRule = 'evenodd';

  var renderingContext = {
    depth: 0,
    beginDrawing: function (){
      if (this.depth == 0) {
        var frameWidth = ctx.canvas.width;
        var frameHeight = ctx.canvas.height;

        var scaleX = frameWidth / (bounds.xMax - bounds.xMin);
        var scaleY = frameHeight / (bounds.yMax - bounds.yMin);
        var scale = Math.min(scaleX, scaleY);
        var offsetX = (frameWidth - scale * (bounds.xMax - bounds.xMin)) / 2;
        var offsetY = (frameHeight - scale * (bounds.yMax - bounds.yMin)) / 2;

        ctx.clearRect(0, 0, frameWidth, frameHeight);
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        ctx.canvas.currentTransform = {
          scale: scale * 20,
          offsetX: offsetX,
          offsetY: offsetY,
          bounds: bounds
        };
      }
      this.depth++;
      return ctx;
    },
    endDrawing: function() {
      this.depth--;
      if (this.depth == 0) {
        ctx.restore();
      }
    }
  };

  (function draw() {
    var now = +new Date;
    if (now - frameTime >= maxDelay) {
      frameTime = now;
      mc.renderNextFrame(renderingContext);
    }
    requestAnimationFrame(draw);
  })();
}
