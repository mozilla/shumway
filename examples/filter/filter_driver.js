var canvas = document.getElementById("canvas");
var width = canvas.width;
var height = canvas.height;
var context = canvas.getContext('2d');

var r = 0;
function drawShape(ctx, length, x, y) {
  ctx.save();
  ctx.fillStyle = '#ff0000';
  ctx.strokeStyle = 'green';
  ctx.translate(x, y);
  ctx.rotate(r += 0.02);
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

var colorMatrix4x5 = new Float32Array([0.748939, 1.044984, -0.793923, 0.000000, 0.000000, -0.008795, 0.713845, 0.294950, 0.000000, 0.000000, 0.827417, -0.240804, 0.413387, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 0.000000]);

var blurCanvasJS = document.getElementById("blur-canvas-js");
var blurCanvasGL = document.getElementById("blur-canvas-gl");

var glowCanvasJS = document.getElementById("glow-canvas-js");
var glowCanvasGL = document.getElementById("glow-canvas-gl");

var shadowCanvasJS = document.getElementById("shadow-canvas-js");
var shadowCanvasGL = document.getElementById("shadow-canvas-gl");

var colorCanvasJS = document.getElementById("color-canvas-js");
var colorCanvasGL = document.getElementById("color-canvas-gl");

var glCanvas = document.getElementById("canvas-gl");

var glFilters = new WebGLFilters(glCanvas);

var gl = new WebGLCanvas(glCanvas);

var firefoxImage = document.getElementById("firefox");


function getImageData(straightAlpha) {
  var imageData = context.getImageData(0, 0, width, height);
  if (!straightAlpha) {
    preMultiplyAlpha(imageData.data);
  }
  return imageData;
}

function putImageData(imageData, context, straightAlpha) {
  if (!straightAlpha) {
    unPreMultiplyAlpha(imageData.data);
  }
  context.putImageData(imageData, 0, 0);
}

var runJS = true;
var runGL = true;

var run = {
  blur: {
    js: runJS && true,
    gl: runGL && true
  },
  glow: {
    js: runJS && true,
    gl: runGL && true
  },
  shadow: {
    js: runJS && true,
    gl: runGL && true
  },
  color: {
    js: runJS && true,
    gl: runGL && true
  }
};

var frameCount = 0;

setInterval(function () {

  // Draw some stuff.
  context.fillStyle = "white";
  // context.fillRect(0, 0, 256, 256);
  context.clearRect(0, 0, 256, 256);
  drawShape(context, 50, 140, 140);
  context.drawImage(firefoxImage, 40, 40);

  var imageData;

  var blurX = 10, blurY = 10;

  if (run.blur.js) {
    // Run JS Blur Filter
    imageData = getImageData();
    blurFilter(imageData.data, width, height, blurX, blurY);
    putImageData(imageData, blurCanvasJS.getContext('2d'));
  }

  if (run.blur.gl) {
    // Run WebGL Blur Filter
    imageData = getImageData(true);
    glFilters.blurFilter(imageData.data, width, height);
    drawImage(glCanvas, blurCanvasGL);
  }

  if (run.glow.js) {
    imageData = getImageData();
    glowFilter(imageData.data, width, height, [0, 0, 255, 0], blurX, blurY, 1);
    putImageData(imageData, glowCanvasJS.getContext('2d'));
  }

  if (run.glow.gl) {
    imageData = getImageData(true);
    glFilters.glowFilter(imageData.data, width, height, [0, 0, 255, 255], blurX, blurY, 1);
    drawImage(glCanvas, glowCanvasGL);

  }

  if (run.shadow.js) {
    imageData = getImageData();
    dropShadowFilter(imageData.data, width, height, [0, 0, 255, 0], blurX, blurY, Math.PI / 4, 20, 0.5);
    putImageData(imageData, shadowCanvasJS.getContext('2d'));
  }

  if (run.shadow.gl) {
    imageData = getImageData();
    glFilters.dropShadowFilter(imageData.data, width, height, [0, 0, 255, 255], blurX, blurY, Math.PI / 4, 20, 0.5);
    drawImage(glCanvas, shadowCanvasGL);
  }

  colorMatrix4x5[0] = Math.sin(frameCount / 100);

  if (run.color.js) {
    // Run JS Color Filter
    imageData = getImageData();
    colorFilter(imageData.data, width, height, colorMatrix4x5);
    putImageData(imageData, colorCanvasJS.getContext('2d'));
  }

  if (run.color.gl) {
    // Run WebGL Color Filter
    imageData = getImageData();
    glFilters.colorFilter(imageData.data, width, height, colorMatrix4x5);
    drawImage(glCanvas, colorCanvasGL);
  }

  frameCount ++;

}, 1000 / 60);

function drawImage(src, dst) {
  dst.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  dst.getContext('2d').drawImage(src, 0, 0, canvas.width, canvas.height);
}

console.timeEnd("STRESS");