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
    hasUniform: function hasUniform(program, name) {
      return !!this.gl.getUniformLocation(program, name);
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
      var gl = this.gl;
      var location = gl.getUniformLocation(program, name);
      assert (location, "Uniform " + name + " not found.");
      gl.uniform4fv(location, vector);
    },
    setUniform2f: function setUniform2f(program, name, x, y) {
      var gl = this.gl;
      var location = gl.getUniformLocation(program, name);
      assert (location, "Uniform " + name + " not found.");
      gl.uniform2f(location, x, y);
    },
    setUniform1f: function setUniform2f(program, name, value) {
      var gl = this.gl;
      var location = gl.getUniformLocation(program, name);
      assert (location, "Uniform " + name + " not found.");
      gl.uniform1f(location, value);
    },
    setUniformMatrix4fv: function setUniform(program, name, matrix) {
      var gl = this.gl;
      var location = gl.getUniformLocation(program, name);
      assert (location, "Uniform " + name + " not found.");
      assert (matrix.length === 16, "Invalid matrix size.");
      gl.uniformMatrix4fv(location, false, matrix);
    },
    setUniformMatrix3fv: function setUniformMatrix3fv(program, name, matrix) {
      var gl = this.gl;
      var location = gl.getUniformLocation(program, name);
      assert (location, "Uniform " + name + " not found.");
      assert (matrix.length === 9, "Invalid matrix size.");
      gl.uniformMatrix3fv(location, false, matrix);
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
    createShaderFromFile: function createShaderFromFile(file) {
      var gl = this.gl;
      var request = new XMLHttpRequest();
      request.open("GET", file, false);
      request.send();
      assert (request.status === 200, "File : " + file + " not found.");
      var shaderType;
      if (file.endsWith(".vert")) {
        shaderType = gl.VERTEX_SHADER;
      } else if (file.endsWith(".frag")) {
        shaderType = gl.FRAGMENT_SHADER;
      } else {
        throw "Shader Type: not supported.";
      }
      return this.createShader(gl, shaderType, request.responseText);
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
    },
    clear: function clear(color) {
      var gl = this.gl;
      gl.clearColor(color[0], color[1], color[2], color[3]);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
    enableBlend: function enableBlend() {
      var gl = this.gl;
      gl.enable(gl.BLEND);
    },
    disableBlend: function disableBlend() {
      var gl = this.gl;
      gl.disable(gl.BLEND);
    }
  };
  return constructor;
})();