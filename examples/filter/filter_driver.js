var canvas = document.getElementById("canvas");
var context = canvas.getContext('2d');

var r = 0;
function drawShape(ctx, length, x, y) {
  ctx.save();
  ctx.fillStyle = 'green';
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

var colorMatrix4x5 = new Float32Array(20);
for (var i = 0; i < 20; i++) {
  colorMatrix4x5[i] = Math.random();
}
var colorMatrix4x4 = new Float32Array(16);
for (var i = 0; i < 16; i++) {
  colorMatrix4x4[i] = colorMatrix4x5[5 * ((i / 4) | 0) + (i & 0x3)];
}


function transpose4x4(m) {
  var r = new Float32Array(16);
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      r[j * 4 + i] = m[i * 4 + j];
    }
  }
  return r;
}

colorMatrix4x4 = transpose4x4(colorMatrix4x4);

var blurCanvasJS = document.getElementById("blur-canvas-js");
var blurCanvasGL = document.getElementById("blur-canvas-gl");

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
var vertices = gl.createVertexBuffer(gl.rectangleVertices(canvas.width, canvas.height));
var textureCoordinates = gl.createVertexBuffer(gl.rectangleTextureCoordinates());

gl.useProgram(blurProgramH);
gl.setUniform2f(blurProgramH, "u_resolution", canvas.width, canvas.height);
gl.setUniform2f(blurProgramH, "u_textureSize", canvas.width, canvas.height);
gl.setUniform1f(blurProgramH, "u_flipY", 1);
gl.setVertexAttribute(blurProgramH, "a_position", vertices);
gl.setVertexAttribute(blurProgramH, "a_textureCoordinate", textureCoordinates);

gl.useProgram(blurProgramV);
gl.setUniform2f(blurProgramV, "u_resolution", canvas.width, canvas.height);
gl.setUniform2f(blurProgramV, "u_textureSize", canvas.width, canvas.height);
gl.setUniform1f(blurProgramV, "u_flipY", -1);
gl.setVertexAttribute(blurProgramV, "a_textureCoordinate", textureCoordinates);
gl.setVertexAttribute(blurProgramV, "a_position", vertices);



gl.useProgram(colorProgram);
gl.setUniform2f(colorProgram, "u_resolution", canvas.width, canvas.height);
gl.setUniformMatrix4fv(colorProgram, "u_matrix", colorMatrix4x4);
// gl.setUniform2f(colorProgram, "u_textureSize", canvas.width, canvas.height);

gl.setUniform1f(colorProgram, "u_flipY", -1);
gl.setVertexAttribute(colorProgram, "a_textureCoordinate", textureCoordinates);
gl.setVertexAttribute(colorProgram, "a_position", vertices);

var framebuffer = gl.createFramebuffer();

var firefoxImage = document.getElementById("firefox");


setInterval(function () {

  // Draw some stuff.
  context.clearRect(0, 0, 256, 256);
  drawShape(context, 100, 100, 100);
  context.drawImage(firefoxImage, 0, 0);
  var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  // Run WebGL Blur Filter
  gl.initializeTexture(texture, canvas.width, canvas.height, new Uint8Array(imageData.data.buffer));
  gl.useProgram(blurProgramH);
  gl.bindTexture(texture);
  gl.bindFramebuffer(framebuffer);
  gl.drawTriangles(0, 6);

  gl.useProgram(blurProgramV);
  gl.bindTexture(framebuffer.texture);
  gl.bindFramebuffer(null);
  gl.drawTriangles(0, 6);

  drawImage(blurCanvasGL, glCanvas);

  // Run JS Blur Filter
  blurFilter(imageData.data, canvas.width, canvas.height, 10, 10);
  blurCanvasJS.getContext('2d').putImageData(imageData, 0, 0);

  imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  // Run WebGL Color Filter
  gl.initializeTexture(texture, canvas.width, canvas.height, new Uint8Array(imageData.data.buffer));
  gl.useProgram(colorProgram);
  gl.bindTexture(texture);
  gl.bindFramebuffer(null);
  gl.drawTriangles(0, 6);

  drawImage(colorCanvasGL, glCanvas);

  // Run JS Color Filter
  colorFilter(imageData.data, canvas.width, canvas.height, colorMatrix4x5);
  colorCanvasJS.getContext('2d').putImageData(imageData, 0, 0);

}, 1000 / 30);

function drawImage(dst, src) {
  dst.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  dst.getContext('2d').drawImage(src, 0, 0, canvas.width, canvas.height);
}

console.timeEnd("STRESS");