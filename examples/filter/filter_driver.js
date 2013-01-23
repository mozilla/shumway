var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var r = 0;
function drawShape(ctx) {
  var length = 100;
  ctx.save();
  ctx.fillStyle = 'green';
  ctx.strokeStyle = 'green';
  ctx.translate(200, 200);
  ctx.rotate(r += 0.01);
  ctx.rotate((Math.PI * 1 / 10));
  ctx.beginPath();
  for (var i = 5; i--;) {
    ctx.lineTo(0, length);
    ctx.translate(0, length);
    ctx.rotate((Math.PI * 2 / 10));
    ctx.lineTo(0, -length);
    ctx.translate(0, -length);
    ctx.rotate(-(Math.PI * 6 / 10));
  }
  ctx.lineTo(0, length);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

var bw = 0, bh = 0;

setInterval(function next() {
  ctx.clearRect(0, 0, 512, 512);
  drawShape(ctx);
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // console.time("BLUR");
  blur(imageData.data, canvas.width, canvas.height, 10, 10);
  // blur(imageData.data, canvas.width, canvas.height, 10, 10);
  // blur(imageData.data, canvas.width, canvas.height, 10, 10);
  // blur3(imageData.data, canvas.width, canvas.height, 10, 1);
  // blur(imageData.data, canvas.width, canvas.height, 10, 10);
  // blur(imageData.data, canvas.width, canvas.height, 10, 10);
  ctx.putImageData(imageData, 0, 0);
}, 1000 / 60);





