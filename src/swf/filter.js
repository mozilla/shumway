/**
 * Applies a blur box-filter, averaging pixel values in a box with radius (bw x bh).
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
 */

/**
 * buffer Uint8Array
 * w      buffer width
 * h      buffer height
 * bw     blur width
 * bh     blur height
 */
function blurFilter(buffer, w, h, bw, bh) {
  blurFilterH(buffer, w, h, bw);
  blurFilterV(buffer, w, h, bh);
}

function blurFilterH(buffer, w, h, bw) {
  // buffer = new Uint8Array(buffer.buffer);
  var line = new Uint8Array(w * 4);
  // slide window
  var slide = (bw << 1) + 1;
  var divTable = new Uint8Array(slide * 256);
  for (var i = 0; i < divTable.length; i++) {
    divTable[i] = i / slide;
  }
  for (var y = 0; y < h; y++) {
    var r = 0, g = 0, b = 0, a = 0;
    var pLine = y * (w << 2);

    // fill window
    for (var p = pLine, e = p + ((1 + (bw << 1)) << 2); p < e; p += 4) {
      r = (r + buffer[p + 0]) | 0;
      g = (g + buffer[p + 1]) | 0;
      b = (b + buffer[p + 2]) | 0;
      a = (a + buffer[p + 3]) | 0;
    }

    for (var p = pLine + (bw << 2), e = p + ((w - bw) << 2), k = (bw << 2),
             o = pLine, i = p + ((bw + 1) << 2);
         p < e;
         p += 4, k += 4, i += 4, o += 4) {
      line[k + 0] = divTable[r | 0];
      line[k + 1] = divTable[g | 0];
      line[k + 2] = divTable[b | 0];
      line[k + 3] = divTable[a | 0];

      r = (r + buffer[i + 0] - buffer[o + 0]) | 0;
      g = (g + buffer[i + 1] - buffer[o + 1]) | 0;
      b = (b + buffer[i + 2] - buffer[o + 2]) | 0;
      a = (a + buffer[i + 3] - buffer[o + 3]) | 0;
    }

    buffer.set(line, pLine);
  }
}

function blurFilterV(buffer, w, h, bh) {
  var column = new Uint8Array(h * 4);
  var wordBuffer = new Uint32Array(buffer.buffer);
  var wordColumn = new Uint32Array(column.buffer);
  var stride = w << 2;

  var slide = (bh << 1) + 1;
  var divTable = new Uint8Array(slide * 256);
  for (var i = 0; i < divTable.length; i++) {
    divTable[i] = i / slide;
  }

  for (var x = 0; x < w; x++) {
    var r = 0, g = 0, b = 0, a = 0;
    var pColumn = x << 2;

    // fill window
    for (var p = pColumn, e = p + ((1 + (bh << 1)) * stride); p < e; p += stride) {
      r = (r + buffer[p + 0]) | 0;
      g = (g + buffer[p + 1]) | 0;
      b = (b + buffer[p + 2]) | 0;
      a = (a + buffer[p + 3]) | 0;
    }

    // slide window
    for (var p = pColumn + (bh * stride),
             e = p + ((h - bh) * stride), k = (bh << 2),
             o = pColumn,
             i = p + ((bh + 1) * stride);
         p < e;
         p += stride, k += 4, i += stride, o += stride) {

      column[k + 0] = divTable[r | 0];
      column[k + 1] = divTable[g | 0];
      column[k + 2] = divTable[b | 0];
      column[k + 3] = divTable[a | 0];

      r = (r + buffer[i + 0] - buffer[o + 0]) | 0;
      g = (g + buffer[i + 1] - buffer[o + 1]) | 0;
      b = (b + buffer[i + 2] - buffer[o + 2]) | 0;
      a = (a + buffer[i + 3] - buffer[o + 3]) | 0;
    }

    for (var p = x, e = p + h * w, i = 0; p < e; p += w, i ++) {
      wordBuffer[p] = wordColumn[i];
    }
  }
}

/**
 * Applies a color transformation. The |matrix| is a 5x5 matrix whose
 * last row is always [0, 0, 0, 0, 1];
 *
 * |R|   |r0, r1, r2, r3, r4|   |r|
 * |G|   |g0, g1, g2, g3, g4|   |g|
 * |B| = |b0, b1, b2, b3, b4| x |b|
 * |A|   |a0, a1, a2, a3, a4|   |a|
 * |1|   | 0,  0,  0,  0,  1|   |1|
 *
 */
function colorFilter(buffer, w, h, matrix) {
  var r0 =  matrix[0], r1 = matrix[1],  r2 = matrix[2],  r3 = matrix[3],  r4 = matrix[4];
  var g0 =  matrix[5], g1 = matrix[6],  g2 = matrix[7],  g3 = matrix[8],  g4 = matrix[9];
  var b0 = matrix[10], b1 = matrix[11], b2 = matrix[12], b3 = matrix[13], b4 = matrix[14];
  var a0 = matrix[15], a1 = matrix[16], a2 = matrix[17], a3 = matrix[18], a4 = matrix[19];

  for (var p = 0, e = w * h * 4; p < e; p += 4) {
    var r = buffer[p + 0];
    var g = buffer[p + 1];
    var b = buffer[p + 2];
    var a = buffer[p + 3];
    buffer[p + 0] = r0 * r + r1 * g + r2 * b + r3 * a; // + r4;
    buffer[p + 1] = g0 * r + g1 * g + g2 * b + g3 * a; // + g4;
    buffer[p + 2] = b0 * r + b1 * g + b2 * b + b3 * a; // + b4;
    buffer[p + 3] = a0 * r + a1 * g + a2 * b + a3 * a; // + a4;
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
