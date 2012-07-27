/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

function render(displayList, renderingContext) {
  var ctx = renderingContext.beginDrawing();
  // displayList is array, so items are sorted by depth
  for (var depth in displayList) {
    var item = displayList[depth];
    if (item) {
      var character = item.character;
      if (item.matrix && !character.$fixMatrix)
        character.matrix = create(item.matrix);
      if (item.cxform && !character.$fixCxform)
        character.cxform = create(item.cxform);

      ctx.save();
      var m = character.matrix;
      ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
      var rotation = character.rotation;
      if (rotation)
        ctx.rotate(rotation * Math.PI / 180);
      var cxform = character.cxform;
      if (cxform) {
        // We only support alpha channel transformation for now
        ctx.globalAlpha = (ctx.globalAlpha * cxform.alphaMult + cxform.alphaAdd) / 256;
      }

      if (character._graphics) {
        var graphics = character._graphics;
        var subpaths = graphics._subpaths;
        for (var i = 0, n = subpaths.length; i < n; i++) {
          var path = subpaths[i];
          if (path.fillStyle) {
            ctx.fillStyle = path.fillStyle;
            if (path.fillTransform) {
              var m = path.fillTransform;
              path.__draw__(ctx);
              ctx.save();
              ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
              ctx.fill();
              ctx.restore();
            } else {
              ctx.fill(path);
            }
          }
          if (path.strokeStyle) {
            ctx.strokeStyle = path.strokeStyle;
            var drawStyles = path.drawStyles;
            for (prop in drawStyles)
              ctx[prop] = drawStyles[prop];
            ctx.stroke(path);
          }
        }
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

  var bounds = character.getBounds();
  var offsetX = Math.floor(bounds.x / 20);
  var offsetY = Math.floor(bounds.y / 20);
  var sizeX = Math.ceil(bounds.width / 20);
  var sizeY = Math.ceil(bounds.height / 20);

  var canvas = cache.canvas;
  if (!canvas) {
    cache.canvas = canvas = document.createElement('canvas');
    cache.isPixelPainted = function(x, y) {
      x = 0 | (x - offsetX);
      y = 0 | (y - offsetY);
      if (x < 0 || y < 0 || x >= sizeX || y >= sizeY)
        return false;
      var data = cache.imageData.data;
      var result = data[(x + sizeX * y) * 4 + 3];
      return !!result;
    };
  }

  if (sizeX <= 0 || sizeY <= 0)
    return;

  canvas.width = sizeX;
  canvas.height = sizeY;

  var ctx = canvas.getContext('2d');
  ctx.save();
  ctx.mozFillRule = 'evenodd';
  ctx.clearRect(0, 0, sizeX, sizeY);
  ctx.translate(-offsetX, -offsetY);
  ctx.scale(0.05, 0.05);

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

  cache.ratio = character.ratio;
  cache.imageData = ctx.getImageData(0, 0, sizeX, sizeY);
}

function renderStage(stage, ctx) {
  var frameTime = 0;
  var maxDelay = 1000 / stage.frameRate;
  var frameWidth = ctx.canvas.width;
  var frameHeight = ctx.canvas.height;

  ctx.mozFillRule = 'evenodd';

  var renderingContext = {
    depth: 0,
    beginDrawing: function (){
      if (this.depth == 0) {
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
        ctx.scale(scale / 20, scale / 20);

        ctx.canvas.currentTransform = {
          scale: scale,
          offsetX: offsetX,
          offsetY: offsetY
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

  var root = stage.getChildAt(0);

  (function draw() {
    var now = +new Date;
    if (now - frameTime >= maxDelay) {
      frameTime = now;
      root.renderNextFrame(renderingContext);
    }
    requestAnimationFrame(draw);
  })();
}
