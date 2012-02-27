/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

function render(displayList, ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width * 20, ctx.canvas.height * 20);
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
      var matrix = character.transform.matrix;
      if (matrix) {
        ctx.transform(
          matrix.scaleX,
          matrix.skew0,
          matrix.skew1,
          matrix.scaleY,
          matrix.translateX,
          matrix.translateY
        );
      }
      if (character.draw)
        character.draw(ctx, character.ratio);
      else if (character.nextFrame)
        character.nextFrame.call(render, ctx);
      ctx.restore();
    }
  }
}
function renderMovieClip(mc, rate, ctx) {
  ctx.scale(0.05, 0.05);
  var maxDelay = 1000 / rate;
  var frameTime = 0;
  (function draw() {
    var now = +new Date;
    if (now - frameTime >= maxDelay) {
      frameTime = now;
      mc.nextFrame.call(render, ctx);
    }
    requestAnimationFrame(draw);
  })();
}
