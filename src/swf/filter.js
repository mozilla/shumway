/**
 * All filters need to run on pre-multiplied alpha images, otherwise you end up with
 * ugly edge effects.
 *
 * Resources: http://www.m2osw.com/swf_struct_any_filter#swf_filter_colormatrix
 */

/**
 * Applies a blur box-filter, averaging pixel values in a box with radius (blurX x blurY).
 *
 * For example:
 *
 * +---+---+---+---+
 * | a | b | c | d |
 * +---+---+---+---+
 * | e | f | g | h |
 * +---+---+---+---+
 * | i | j | k | l |
 * +---+---+---+---+
 * | m | n | o | p |
 * +---+---+---+---+
 *
 * The output value of pixel |k| when |bw = bh = 1| is computed as: (f + g + h + j + k +
 * l + n + o + p) / 9. The total running time is O(w * h * bw * bh). We can do better if
 * we split the filter in two passes: horizontal and vertical.
 *
 * In the horizontal and vertical direction we can compute the blur using a sliding window
 * sum of length: (bw * 2 + 1) and (bh * 2 + 1) respectively. For instance, in the horizontal
 * direction:
 *
 * +---+---+---+---+---+---
 * | e | f | g | h | .... |
 * +---+---+---+---+---+---
 * |<-- hf  -->|
 *     |<-- hg  -->|
 *         |<-- hh  -->|
 *
 * hf = (e + f + g) / 3
 * hg = (f + g + h) / 3
 * hh = (g + h + .) / 3
 *
 * In the vertical direction, for |k| we get:
 *
 * vk = (hg + hk + ho) / 3 =
 *    = (f + g + h) / 3 + (j + k + l) / 3 + (n + o + p) / 3
 *    = (f + g + h + j + k + l + n + o + p) / 9
 *    = the original box filter.
 *
 * Each pass runs in O(w * h), independent of the box-filter size.
 *
 * For performance reasons the blur filter doesn't deal with edge conditions, so to blur
 * an image correctly you must make sure there is an empty (blurX, blurY) border. If you
 * want to blur something repeatedly you must have an n x (blurX, blurY) border.
 */
function blurFilter(buffer, w, h, blurX, blurY) {
  blurFilterH(buffer, w, h, blurX);
  blurFilterV(buffer, w, h, blurY);
}

function blurFilterH(buffer, w, h, blurX) {
  var lineBuffer = new Uint8ClampedArray(w * 4);
  var lineSize = w * 4;
  var windowLength = (blurX * 2) + 1;
  var windowSize = windowLength * 4;

  for (var y = 0; y < h; y++) {
    var pLineStart = y * lineSize;
    var rs = 0, gs = 0, bs = 0, as = 0, alpha = 0;

    // Fill window
    for (var ptr = pLineStart, end = ptr + windowSize; ptr < end; ptr += 4) {
      rs += buffer[ptr + 0];
      gs += buffer[ptr + 1];
      bs += buffer[ptr + 2];
      as += buffer[ptr + 3];
    }

    // Slide window
    for (var ptr = pLineStart + blurX * 4,
           end = ptr + (w - blurX * 2) * 4,
           linePtr = blurX * 4,
           lastPtr = pLineStart,
           nextPtr = ptr + (blurX + 1) * 4;
         ptr < end;
         ptr += 4, linePtr += 4, nextPtr += 4, lastPtr += 4) {

      lineBuffer[linePtr + 0] = rs / windowLength;
      lineBuffer[linePtr + 1] = gs / windowLength;
      lineBuffer[linePtr + 2] = bs / windowLength;
      lineBuffer[linePtr + 3] = as / windowLength;

      rs += buffer[nextPtr + 0] - buffer[lastPtr + 0];
      gs += buffer[nextPtr + 1] - buffer[lastPtr + 1];
      bs += buffer[nextPtr + 2] - buffer[lastPtr + 2];
      as += buffer[nextPtr + 3] - buffer[lastPtr + 3];
    }

    // Copy line
    buffer.set(lineBuffer, pLineStart);
  }
}


function blurFilterV(buffer, w, h, blurY) {
  var columnBuffer = new Uint8ClampedArray(h * 4);
  var stride = w * 4;
  var windowLength = (blurY * 2) + 1;

  for (var x = 0; x < w; x++) {
    var pColumnStart = x * 4;
    var rs = 0, gs = 0, bs = 0, as = 0, alpha = 0;

    // Fill window
    for (var ptr = pColumnStart, end = ptr + windowLength * stride; ptr < end; ptr += stride) {
      rs += buffer[ptr + 0];
      gs += buffer[ptr + 1];
      bs += buffer[ptr + 2];
      as += buffer[ptr + 3];
    }

    // Slide window
    for (var ptr = pColumnStart + blurY * stride,
           end = ptr + (h - blurY) * stride,
           columnPtr = blurY * 4,
           lastPtr = pColumnStart,
           nextPtr = ptr + ((blurY + 1) * stride);
         ptr < end;
         ptr += stride, columnPtr += 4, nextPtr += stride, lastPtr += stride) {

      columnBuffer[columnPtr + 0] = rs / windowLength;
      columnBuffer[columnPtr + 1] = gs / windowLength;
      columnBuffer[columnPtr + 2] = bs / windowLength;
      columnBuffer[columnPtr + 3] = as / windowLength;

      rs += buffer[nextPtr + 0] - buffer[lastPtr + 0];
      gs += buffer[nextPtr + 1] - buffer[lastPtr + 1];
      bs += buffer[nextPtr + 2] - buffer[lastPtr + 2];
      as += buffer[nextPtr + 3] - buffer[lastPtr + 3];
    }

    var wordBuffer = new Uint32Array(buffer.buffer);
    var wordColumn = new Uint32Array(columnBuffer.buffer);

    // Copy column
    for (var i = x, end = i + h * w, j = 0; i < end; i += w, j++) {
      wordBuffer[i] = wordColumn[j];
    }
  }
}

function getAlphaChannel(buffer, color) {
  if (!color) {
    color = [0, 0, 0, 0];
  }
  var plane = new Uint8ClampedArray(buffer);
  for (var ptr = 0, end = plane.length; ptr < end; ptr += 4) {
    var alpha = plane[ptr + 3];
    plane[ptr + 0] = color[0] * alpha;
    plane[ptr + 1] = color[1] * alpha;
    plane[ptr + 2] = color[2] * alpha;
  }
  return plane;
}

function scaleAlphaChannel(buffer, value) {
  assert (isNumeric(value));
  for (var ptr = 0, end = buffer.length; ptr < end; ptr += 4) {
    buffer[ptr + 3] *= value;
  }
}

function preMultiplyAlpha(buffer) {
  for (var ptr = 0, end = buffer.length; ptr < end; ptr += 4) {
    var alpha = buffer[ptr + 3] / 255;
    buffer[ptr + 0] *= alpha;
    buffer[ptr + 1] *= alpha;
    buffer[ptr + 2] *= alpha;
  }
}

function unPreMultiplyAlpha(buffer) {
  for (var ptr = 0, end = buffer.length; ptr < end; ptr += 4) {
    var alpha = buffer[ptr + 3] / 255;
    buffer[ptr + 0] /= alpha;
    buffer[ptr + 1] /= alpha;
    buffer[ptr + 2] /= alpha;
  }
}

function compositeSourceOver(dst, src) {
  for (var ptr = 0, end = dst.length; ptr < end; ptr += 4) {
    var Dr = dst[ptr + 0];
    var Dg = dst[ptr + 1];
    var Db = dst[ptr + 2];
    var Da = dst[ptr + 3] / 255;

    var Sr = src[ptr + 0];
    var Sg = src[ptr + 1];
    var Sb = src[ptr + 2];
    var Sa = src[ptr + 3] / 255;

    dst[ptr + 0] = Sr + Dr * (1 - Sa);
    dst[ptr + 1] = Sg + Dg * (1 - Sa);
    dst[ptr + 2] = Sb + Db * (1 - Sa);
    dst[ptr + 3] = (Sa + Da * (1 - Sa)) * 255;
  }
}

function glowFilter(buffer, w, h, color, blurX, blurY, strength) {
  dropShadowFilter(buffer, w, h, color, blurX, blurY, 0, 0, strength)
}

function panFilter(buffer, w, h, angle, distance) {
  var dy = (Math.sin(angle) * distance) | 0;
  var dx = (Math.cos(angle) * distance) | 0;
  var oldBuffer = new Int32Array(buffer.buffer);
  var newBuffer = new Int32Array(oldBuffer.length);
  for (var oy = 0; oy < h; oy++) {
    var ny = oy + dy;
    if (ny < 0 || ny > h) {
      continue;
    }
    for (var ox = 0; ox < w; ox++) {
      var nx = ox + dx;
      if (nx < 0 || nx > w) {
        continue;
      }
      newBuffer[ny * w + nx] = oldBuffer[oy * w + ox];
    }
  }
  oldBuffer.set(newBuffer);
}

function dropShadowFilter(buffer, w, h, color, blurX, blurY, angle, distance, strength) {
  var tmp = getAlphaChannel(buffer, color);
  panFilter(tmp, w, h, angle, distance);
  blurFilter(tmp, w, h, blurX, blurY);
  scaleAlphaChannel(tmp, strength);
  compositeSourceOver(tmp, buffer);
  buffer.set(tmp);
}

/**
 * Applies a color transformation. The |matrix| is a 5x5 matrix whose
 * last row is always [0, 0, 0, 0, 1]. The |matrix| is specified in row-major order;
 *
 * |R|   |r0, r1, r2, r3, r4|   |r|
 * |G|   |g0, g1, g2, g3, g4|   |g|
 * |B| = |b0, b1, b2, b3, b4| x |b|
 * |A|   |a0, a1, a2, a3, a4|   |a|
 * |1|   | 0,  0,  0,  0,  1|   |1|
 *
 */

function clamp(n) {
  return (((255 - n) >> 31) | n) & 0xFF;
}

function colorFilter(buffer, w, h, matrix) {
  var r0 = matrix[0],  r1 = matrix[1],  r2 = matrix[2],  r3 = matrix[3],  r4 = matrix[4];
  var g0 = matrix[5],  g1 = matrix[6],  g2 = matrix[7],  g3 = matrix[8],  g4 = matrix[9];
  var b0 = matrix[10], b1 = matrix[11], b2 = matrix[12], b3 = matrix[13], b4 = matrix[14];
  var a0 = matrix[15], a1 = matrix[16], a2 = matrix[17], a3 = matrix[18], a4 = matrix[19];
  for (var p = 0, e = w * h * 4; p < e; p += 4) {
    var r = buffer[p + 0];
    var g = buffer[p + 1];
    var b = buffer[p + 2];
    var a = buffer[p + 3];
    buffer[p + 0] = r0 * r + r1 * g + r2 * b + r3 * a + r4;
    buffer[p + 1] = g0 * r + g1 * g + g2 * b + g3 * a + g4;
    buffer[p + 2] = b0 * r + b1 * g + b2 * b + b3 * a + b4;
    buffer[p + 3] = a0 * r + a1 * g + a2 * b + a3 * a + a4;
  }
}

/**
 * Yet another abstraction over WebGL APIs.
 */
var WebGLCanvas = (function () {
  function constructor(canvas) {
    this.canvas = canvas;
    var w = this.width = canvas.width;
    var h = this.height = canvas.height;
    assert (w && h && isPowerOfTwo(w) && isPowerOfTwo(h));
    this.gl = this.canvas.getContext("experimental-webgl");
    assert (this.gl);
  }

  constructor.prototype = {
    rectangleVertices: function rectangleVertices(w, h) {
      return new Float32Array([0, 0, w, 0, 0, h, 0, h, w, 0, w, h]);
    },
    rectangleTextureCoordinates: function rectangleTextureCoordinates() {
      return new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);
    },
    useProgram: function (program) {
      this.gl.useProgram(program);
    },
    setVertexAttribute: function setVertexAttribute(program, name, buffer) {
      var gl = this.gl;
      var location = gl.getAttribLocation(program, name);
      assert (location >= 0, "Attribute " + name + " not found.");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    },
    setUniform4fv: function setUniform2f(program, name, vector) {
      var gl = this.gl
      var location = gl.getUniformLocation(program, name);
      assert (location, "Uniform " + name + " not found.");
      gl.uniform4fv(location, vector);
    },
    setUniform2f: function setUniform2f(program, name, x, y) {
      var gl = this.gl
      var location = gl.getUniformLocation(program, name);
      assert (location, "Uniform " + name + " not found.");
      gl.uniform2f(location, x, y);
    },
    setUniform1f: function setUniform2f(program, name, x) {
      var gl = this.gl
      var location = gl.getUniformLocation(program, name);
      assert (location, "Uniform " + name + " not found.");
      gl.uniform1f(location, x);
    },
    setUniformMatrix4fv: function setUniform(program, name, matrix) {
      var gl = this.gl
      var location = gl.getUniformLocation(program, name);
      assert (location, "Uniform " + name + " not found.");
      assert (matrix.length === 16, "Invalid matrix size.");
      gl.uniformMatrix4fv(location, false, matrix);
    },
    createVertexBuffer: function createBuffer(vertices) {
      var gl = this.gl;
      var buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      return buffer;
    },
    createFramebuffer: function createFramebuffer() {
      var gl = this.gl;
      var texture = this.createTexture();
      this.initializeTexture(texture, this.width, this.height, null);
      var framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      framebuffer.texture = texture;
      return framebuffer;
    },
    createTexture: function createAndBindTexture() {
      var gl = this.gl;
      var texture = gl.createTexture();
      this.bindTexture(texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      return texture;
    },
    initializeTexture: function initializeTexture(texture, width, height, data) {
      var gl = this.gl;
      this.bindTexture(texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    },
    bindTexture: function bindTexture(texture) {
      var gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, texture);
    },
    bindFramebuffer: function bindFramebuffer(framebuffer) {
      var gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    },
    createShader: function createShader(gl, shaderType, shaderSource) {
      var gl = this.gl;
      var shader = gl.createShader(shaderType);
      gl.shaderSource(shader, shaderSource);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var lastError = gl.getShaderInfoLog(shader);
        unexpected("Cannot compile shader: " + lastError);
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    },
    createShaderFromElement: function createShaderFromElement(id) {
      var gl = this.gl;
      var shaderScript = document.getElementById(id);
      if (!shaderScript) {
        unexpected("Shader Script Element: " + id + " not found.");
      }
      var shaderType;
      switch (shaderScript.type) {
        case "x-shader/x-vertex":
          shaderType = gl.VERTEX_SHADER;
          break;
        case "x-shader/x-fragment":
          shaderType = gl.FRAGMENT_SHADER;
          break;
        default:
          throw "Shader Type: " + shaderScript.type + " not supported.";
          break;
      }
      return this.createShader(gl, shaderType, shaderScript.text);
    },
    createProgram: function createProgram(shaders) {
      var gl = this.gl;
      var program = gl.createProgram();
      shaders.forEach(function (shader) {
        gl.attachShader(program, shader);
      });
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var lastError = gl.getProgramInfoLog(program);
        unexpected("Cannot link program: " + lastError);
        gl.deleteProgram(program);
      }
      return program;
    },
    drawTriangles: function drawArrays(first, count) {
      var gl = this.gl;
      gl.drawArrays(gl.TRIANGLES, first, count);
    }
  };
  return constructor;
})();

function trace(s) {
  console.info(s);
}
