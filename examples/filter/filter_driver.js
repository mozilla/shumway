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

var colorMatrix4x5 = new Float32Array([0.748939, 1.044984, -0.793923, 0.000000, 0.000000, -0.008795, 0.713845, 0.294950, 0.000000, 0.000000, 0.827417, -0.240804, 0.413387, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 1.000000, 0.000000]);

function transpose(r, c, m) {
  var result = new Float32Array(16);
  for (var i = 0; i < r; i++) {
    for (var j = 0; j < c; j++) {
      result[j * r + i] = m[i * c + j];
    }
  }
  return result;
}

var colorMatrix5x4 = transpose(4, 5, colorMatrix4x5);
var colorMatrix4x4 = colorMatrix5x4.subarray(0, 16);
var colorMatrixVector = colorMatrix5x4.subarray(16, 20);

var blurCanvasJS = document.getElementById("blur-canvas-js");
var blurCanvasGL = document.getElementById("blur-canvas-gl");

var glowCanvasJS = document.getElementById("glow-canvas-js");
var glowCanvasGL = document.getElementById("glow-canvas-gl");

var colorCanvasJS = document.getElementById("color-canvas-js");
var colorCanvasGL = document.getElementById("color-canvas-gl");

var glCanvas = document.getElementById("canvas-gl");
var gl = new WebGLCanvas(glCanvas);

var vShader = gl.createShaderFromElement("2d-vertex-shader");
var blurFragmentShaderH = gl.createShaderFromElement("2d-blur-fragment-shader-h");
var blurFragmentShaderV = gl.createShaderFromElement("2d-blur-fragment-shader-v");
var colorFragmentShader = gl.createShaderFromElement("2d-color-fragment-shader");

var blurProgramH = gl.createProgram([vShader, blurFragmentShaderH]);
var blurProgramV = gl.createProgram([vShader, blurFragmentShaderV]);
var colorProgram = gl.createProgram([vShader, colorFragmentShader]);

var texture = gl.createTexture();
var vertices = gl.createVertexBuffer(gl.rectangleVertices(width, height));
var textureCoordinates = gl.createVertexBuffer(gl.rectangleTextureCoordinates());

gl.useProgram(blurProgramH);
gl.setUniform2f(blurProgramH, "u_resolution", width, height);
gl.setUniform2f(blurProgramH, "u_textureSize", width, height);
gl.setUniform1f(blurProgramH, "u_flipY", 1);
gl.setVertexAttribute(blurProgramH, "a_position", vertices);
gl.setVertexAttribute(blurProgramH, "a_textureCoordinate", textureCoordinates);

gl.useProgram(blurProgramV);
gl.setUniform2f(blurProgramV, "u_resolution", width, height);
gl.setUniform2f(blurProgramV, "u_textureSize", width, height);
gl.setUniform1f(blurProgramV, "u_flipY", -1);
gl.setVertexAttribute(blurProgramV, "a_textureCoordinate", textureCoordinates);
gl.setVertexAttribute(blurProgramV, "a_position", vertices);



gl.useProgram(colorProgram);
gl.setUniform2f(colorProgram, "u_resolution", width, height);
gl.setUniformMatrix4fv(colorProgram, "u_matrix", colorMatrix4x4);
gl.setUniform4fv(colorProgram, "u_vector", colorMatrixVector);
// gl.setUniform2f(colorProgram, "u_textureSize", canvas.width, canvas.height);

gl.setUniform1f(colorProgram, "u_flipY", -1);
gl.setVertexAttribute(colorProgram, "a_textureCoordinate", textureCoordinates);
gl.setVertexAttribute(colorProgram, "a_position", vertices);

var framebuffer = gl.createFramebuffer();

var firefoxImage = document.getElementById("firefox");


function blurGL(data, width, height) {
  gl.initializeTexture(texture, width, height, new Uint8Array(data.buffer));
  gl.useProgram(blurProgramH);
  gl.bindTexture(texture);
  gl.bindFramebuffer(framebuffer);
  gl.drawTriangles(0, 6);

  gl.useProgram(blurProgramV);
  gl.bindTexture(framebuffer.texture);
  gl.bindFramebuffer(null);
  gl.drawTriangles(0, 6);
}

function colorGL(data, width, height) {
  gl.initializeTexture(texture, width, height, new Uint8Array(data.buffer));
  gl.useProgram(colorProgram);
  gl.bindTexture(texture);
  gl.bindFramebuffer(null);
  gl.drawTriangles(0, 6);
}

function getImageData() {
  return context.getImageData(0, 0, width, height);
}

var run = {
  blur: {
    js: true,
    gl: true
  },
  glow: {
    js: false,
    gl: false
  },
  color: {
    js: true,
    gl: true
  }
};

setInterval(function () {

  // Draw some stuff.
  context.fillStyle = "white";
  // context.fillRect(0, 0, 256, 256);
  context.clearRect(0, 0, 256, 256);
  drawShape(context, 100, 100, 100);
  context.drawImage(firefoxImage, 30, 30);

  var imageData;

  if (run.blur.js) {
    // Run JS Blur Filter
    imageData = getImageData();
    blurFilter(imageData.data, width, height, 10, 10);
    blurCanvasJS.getContext('2d').putImageData(imageData, 0, 0);
  }

  if (run.blur.gl) {
    // Run WebGL Blur Filter
    imageData = getImageData();
    blurGL(imageData.data, width, height);
    drawImage(glCanvas, blurCanvasGL);
  }

  if (run.glow.js) {
    imageData = getImageData();
    dropShadowFilter(imageData.data, width, height, 10, 10, [0, 255, 0, 0]);
    glowCanvasJS.getContext('2d').putImageData(imageData, 0, 0);
  }

  if (run.color.js) {
    // Run JS Color Filter
    imageData = getImageData();
    colorFilter(imageData.data, width, height, colorMatrix4x5);
    colorCanvasJS.getContext('2d').putImageData(imageData, 0, 0);
  }

  if (run.color.gl) {
    // Run WebGL Color Filter
    imageData = getImageData();
    colorGL(imageData.data, width, height);
    drawImage(glCanvas, colorCanvasGL);
  }

}, 1000 / 60);

function drawImage(src, dst) {
  dst.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  dst.getContext('2d').drawImage(src, 0, 0, canvas.width, canvas.height);
}

console.timeEnd("STRESS");