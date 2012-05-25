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
        ctx.globalAlpha = cxform.alphaMult + cxform.alphaAdd;
      }
      if (character.draw)
        character.draw(ctx, character.ratio);
      else if (character.nextFrame)
        character.nextFrame.call(render, renderingContext);
      ctx.restore();
    }
  }
  renderingContext.endDrawing();
}
function renderMovieClip(mc, rate, ctx) {
  var frameTime = 0;
  var maxDelay = 1000 / rate;
  var frameWidth = ctx.canvas.width;
  var frameHeight = ctx.canvas.height;

  ctx.mozFillRule = 'evenodd';

  var renderingContext = {
    depth: 0,
    beginDrawing: function (){
      if (this.depth == 0) {
        ctx.clearRect(0, 0, frameWidth, frameHeight);
        ctx.save();
        ctx.scale(0.05, 0.05);
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
      mc.nextFrame.call(render, renderingContext);
    }
    requestAnimationFrame(draw);
  })();
}
