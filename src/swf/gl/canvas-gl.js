var webGLOptions = coreOptions.register(new OptionSet("WebGL Options"));

var CanvasWebGLContext = CanvasWebGLContext || (function (document, undefined) {

  var TRACE_OFF = 0;
  var TRACE_BRIEF = 1;
  var TRACE_VERBOSE = 2;
  
  var traceOption = webGLOptions.register(new Option("", "trace", "number", TRACE_BRIEF, "trace commands", {off: TRACE_OFF, brief: TRACE_BRIEF, verbose: TRACE_VERBOSE}));
  var alphaOption = webGLOptions.register(new Option("", "alpha", "boolean", false, "makes all colors transparent"));
  var stencilOption = webGLOptions.register(new Option("", "stencilOption", "boolean", false, "cache tessellations"));
  var drawOption = webGLOptions.register(new Option("", "draw", "boolean", true, "draw"));

  var nativeGetContext = HTMLCanvasElement.prototype.getContext;

  var Draw = GL.Job.Draw;

  HTMLCanvasElement.prototype.getContext = function getContext(contextId, args) {
    if (contextId !== "2d.gl") {
      return nativeGetContext.call(this, contextId, args);
    }
    return new CanvasWebGLContext(this);
  };

  var TextureAtlas = (function () {
    function textureAtlas(gl, texture, width, height) {
      this._gl = gl;
      this._packer = new Packer(width, height);
      this.texture = texture;
    }
    textureAtlas.prototype.load = function (image) {
      var gl = this._gl;
      var coordinates = this._packer.insert(image.width, image.height);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, coordinates.x, coordinates.y, gl.RGBA, gl.UNSIGNED_BYTE, image);
      return new TextureAtlasLocation(this, coordinates);
    };
    return textureAtlas;
  })();

  function TextureAtlasLocation(textureAtlas, coordinates) {
    this.textureAtlas = textureAtlas;
    this.coordinates = coordinates;
  }

  TextureAtlasLocation.prototype.toString = function()  {
    return "x: " + this.coordinates.x + ", y: " + this.coordinates.y;
  };

  var CanvasWebGLContext = (function () {
    var writer = new IndentingWriter(false, function (str) {
      console.log(str);
    });

    var shaderRoot = "../../src/swf/gl/shaders/";

    function canvasWebGLContext(canvas) {
      this.isGlContext = true;
      this.canvas = canvas;
      this._width = canvas.width;
      this._height = canvas.height;
      this._state = new State();
      var gl = this._gl = canvas.getContext("experimental-webgl", {
        // preserveDrawingBuffer: true,
        antialias: true,
        stencil: true
      });
      this._gl.viewport(0, 0, this._width, this._height);
      this._programCache = {};
      this._program = this._createProgramFromFiles("canvas.vert", "identity.frag");
      this._updateViewport();
      this._fillStyle = "#000000";
      this._strokeStyle = "#000000";
      this._jobQueue = [];
      this._textureAtlases = [];
      this._path = new GL.Path();
      this._pathTransform = Transform.createIdentity();
      this._pathTransformStack = [];
      this._pathOriginalTransform = Transform.createIdentity();

      this.resetTransform();
    }

    canvasWebGLContext.prototype._scheduleJob = function (job) {
      this._jobQueue.push(job);
    };

    canvasWebGLContext.prototype._updateViewport = function () {
      var gl = this._gl;
      gl.viewport(0, 0, this._width, this._height);
      gl.useProgram(this._program);
      gl.uniform2f(this._program.uniforms.uResolution.location, this._width, this._height);
    };

    Object.defineProperty(canvasWebGLContext.prototype, "width", {
      get: function () {
        return this._width;
      },
      set: function (width) {
        this._width = width;
        this._updateViewport();
      }
    });

    Object.defineProperty(canvasWebGLContext.prototype, "height", {
      get: function () {
        return this._height;
      },
      set: function (height) {
        this._height = height;
        this._updateViewport();
      }
    });

    Object.defineProperty(canvasWebGLContext.prototype, "fillStyle", {
      get: function () {
        return this._fillStyle;
      },
      set: function (fillStyle) {
        traceOption.value >= TRACE_VERBOSE && writer.writeLn("fillStyle " + toSafeArrayString(arguments));
        this._fillStyle = fillStyle;
      }
    });

    Object.defineProperty(canvasWebGLContext.prototype, "strokeStyle", {
      get: function () {
        return this._strokeStyle;
      },
      set: function (strokeStyle) {
        traceOption.value >= TRACE_VERBOSE && writer.writeLn("strokeStyle " + toSafeArrayString(arguments));
        this._strokeStyle = strokeStyle;
      }
    });

    canvasWebGLContext.prototype._createShaderFromFile = function _createShaderFromFile(file) {
      var path = shaderRoot + file;
      var gl = this._gl;
      var request = new XMLHttpRequest();
      request.open("GET", path, false);
      request.send();
      assert (request.status === 200, "File : " + path + " not found.");
      var shaderType;
      if (path.endsWith(".vert")) {
        shaderType = gl.VERTEX_SHADER;
      } else if (path.endsWith(".frag")) {
        shaderType = gl.FRAGMENT_SHADER;
      } else {
        throw "Shader Type: not supported.";
      }
      return this._createShader(shaderType, request.responseText);
    };

    canvasWebGLContext.prototype._createProgramFromFiles = function _createProgramFromFiles(vertex, fragment) {
      var key = vertex + fragment;
      var program = this._programCache[key];
      if (!program) {
        program = this._createProgram([
          this._createShaderFromFile(vertex),
          this._createShaderFromFile(fragment)
        ]);
        this._queryProgramAttributesAndUniforms(program);
        this._programCache[key] = program;
      }
      return program;
    };

    canvasWebGLContext.prototype._createProgram = function _createProgram(shaders) {
      var gl = this._gl;
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
    };

    canvasWebGLContext.prototype._createShader = function _createShader(shaderType, shaderSource) {
      var gl = this._gl;
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
    };

    canvasWebGLContext.prototype._queryProgramAttributesAndUniforms = function _queryProgramAttributesAndUniforms(program) {
      program.uniforms = {};
      program.attributes = {};

      var gl = this._gl;
      for (var i = 0, j = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES); i < j; i++) {
        var attribute = gl.getActiveAttrib(program, i);
        program.attributes[attribute.name] = attribute;
        attribute.location = gl.getAttribLocation(program, attribute.name);
      }
      for (var i = 0, j = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i < j; i++) {
        var uniform = gl.getActiveUniform(program, i);
        program.uniforms[uniform.name] = uniform;
        uniform.location = gl.getUniformLocation(program, uniform.name);
      }
    };

    canvasWebGLContext.prototype._createTexture = function _createTexture(width, height, data) {
      var gl = this._gl;
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      return texture;
    };

    canvasWebGLContext.prototype._loadImage = function (image) {
      if (image.textureAtlasLocation) {
        return image.textureAtlasLocation;
      }
      var textureAtlasLocation, textureAtlas;
      for (var i = 0; i < this._textureAtlases.length; i++) {
        textureAtlasLocation = this._textureAtlases[i].load(image);
        if (textureAtlasLocation) {
          break;
        }
      }
      if (!textureAtlasLocation) {
        textureAtlas = new TextureAtlas(this._gl, this._createTexture(1024, 1024, null), 1024, 1024);
        this._textureAtlases.push(textureAtlas);
        textureAtlasLocation = textureAtlas.load(image);
        assert (textureAtlasLocation);
      }
      traceOption.value >= TRACE_BRIEF && writer.writeLn("Uploading Image: w: " + image.width + ", h: " + image.height + " @ " + textureAtlasLocation);
      return (image.textureAtlasLocation = textureAtlasLocation);
    };

    var State = (function () {
      function state(parent) {
        this.parent = parent;
        this.transform = null;
        if (parent) {
          this.transform = parent.transform.clone();
        } else {
          this.transform = Transform.createIdentity();
        }
        this.clippingPaths = [];
      }
      return state;
    })();

    canvasWebGLContext.prototype.save = function save() {
      traceOption.value >= TRACE_VERBOSE && writer.enter("save");
      this._state = new State(this._state);
      this._pathTransformStack.push(this._pathTransform);
      this._pathTransform = this._pathTransform.clone();
    };

    canvasWebGLContext.prototype.restore = function restore() {
      traceOption.value >= TRACE_VERBOSE && writer.leave("restore");
      var gl = this._gl;
      gl.clear(gl.STENCIL_BUFFER_BIT);
      if (this._state.parent) {
        this._state = this._state.parent;
        this._pathTransform = this._pathTransformStack.pop();
      }
    };

    canvasWebGLContext.prototype._clearRect = function (x, y, w, h) {
      var gl = this._gl;
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(x, this._height - y - h, w, h);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.SCISSOR_TEST);
    };

    Object.defineProperty(canvasWebGLContext.prototype, "currentTransform", {
      get: function() {
        return this._state.transform.clone();
      },
      set: function(transform) {
        notImplemented("set currentTransform");
      }
    });

    canvasWebGLContext.prototype.setTransform = function setTransform(m11, m12, m21, m22, dx, dy) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("setTransform " + toSafeArrayString(arguments));
      this._state.transform.set(m11, m12, m21, m22, dx, dy);
    };

    canvasWebGLContext.prototype.resetTransform = function resetTransform() {
      this._state.transform.reset();
      this._pathTransform.reset();
    };

    canvasWebGLContext.prototype.transform = function transform(m11, m12, m21, m22, dx, dy) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("transform " + toSafeArrayString(arguments));
      this._state.transform.transform(m11, m12, m21, m22, dx, dy);
      this._pathTransform.transform(m11, m12, m21, m22, dx, dy);
    };

    canvasWebGLContext.prototype.scale = function scale(x, y) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("scale " + toSafeArrayString(arguments));
      this._state.transform.scale(x, y);
      this._pathTransform.scale(x, y);
    };

    canvasWebGLContext.prototype.rotate = function rotate(angle) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("rotate " + toSafeArrayString(arguments));
      this._state.transform.rotate(angle);
      this._pathTransform.rotate(angle);
    };

    canvasWebGLContext.prototype.translate = function translate(x, y) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("translate " + toSafeArrayString(arguments));
      this._state.transform.translate(x, y);
      this._pathTransform.translate(x, y);
    };

    /*
     * Path Commands
     */

    canvasWebGLContext.prototype._transformPathPoint = function (x, y) {
      return this._pathTransform.transformPoint(x, y);
    };

    canvasWebGLContext.prototype.beginPath = function beginPath() {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("beginPath " + toSafeArrayString(arguments));
      this._path.reset();
      this._pathTransform.reset();
      this._pathOriginalTransform = this._state.transform.clone();
    };

    canvasWebGLContext.prototype.closePath = function closePath() {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("closePath " + toSafeArrayString(arguments));
    };

    canvasWebGLContext.prototype.moveTo = function (x, y) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("moveTo " + toSafeArrayString(arguments));
      var p = this._transformPathPoint(x, y);
      this._path.moveTo(p.x, p.y);
    };

    canvasWebGLContext.prototype.lineTo = function (x, y) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("lineTo " + toSafeArrayString(arguments));
      var p = this._transformPathPoint(x, y);
      this._path.lineTo(p.x, p.y);
    };

    canvasWebGLContext.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("quadraticCurveTo " + toSafeArrayString(arguments));
      var c = this._transformPathPoint(cpx, cpy);
      var p = this._transformPathPoint(x, y);
      this._path.quadraticCurveTo(c.x, c.y, p.x, p.y);
    };

    canvasWebGLContext.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("bezierCurveTo " + toSafeArrayString(arguments));
    };

    canvasWebGLContext.prototype.arc = function (x1, y1, x2, y2, radius) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("arcTo " + toSafeArrayString(arguments));
    };

    canvasWebGLContext.prototype.rect = function (x, y, w, h) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("rect " + toSafeArrayString(arguments));
      var p = this._transformPathPoint(x, y);
      var d = this._transformPathPoint(w, h);
      this._path.rect(p.x, p.y, d.x, d.y);
    };

    canvasWebGLContext.prototype.strokeRect = function(x, y, w, h) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("strokeRect " + toSafeArrayString(arguments));
      this._fillStyle = this._strokeStyle;
      this.fillRect(x, y, w, h);
    };

    canvasWebGLContext.prototype.drawImage = function drawImage(image, dx, dy, dw, dh) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("drawImage " + toSafeArrayString(arguments));
      this.fillRect(dx, dy, dw, dh);
    }

    canvasWebGLContext.prototype.clip = function clip() {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("clip " + toSafeArrayString(arguments));
      this._state.clippingPaths.push(this._path.clone());
      this._fillPath(Draw.CLIP);
    };

    canvasWebGLContext.prototype.fill = function fill() {
      if (this._state.clippingPaths.length) {
        this._fillPath(Draw.STENCIL);
      } else {
        this._fillPath(Draw.NORMAL);
      }
    };

    var cache = {};
    canvasWebGLContext.prototype._fillPath = function _fillPath(mode) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("fill " + toSafeArrayString(arguments));
      var hash = this._path.hash();
      var geometry = cache[hash];
      if (!geometry) {
        console.warn("Creating Geometry");
        geometry = new GL.Geometry(this);
        if (this._fillStyle && this._fillStyle.image) {
          var location = this._loadImage(this._fillStyle.image);
        }
        if (this._fillStyle instanceof CanvasGradient) {
          if (this._fillStyle.colorStops && this._fillStyle.colorStops.length > 0) {
            var color = parseFillColor(this._fillStyle.colorStops[0].color);
          } else {
            var color = parseFillColor("pink");
          }
        } else {
          var color = parseFillColor(this._fillStyle);
        }
        var simplePath = new GL.SimplePath();
        this._path.visit(simplePath);
        geometry.addFill(simplePath, color);
        cache[hash] = geometry;
      }
      this._scheduleJob(new GL.Job.Draw(this, geometry, GL.createMatrixFromTransform(this._pathOriginalTransform), 1, mode));
    };

    canvasWebGLContext.prototype.stroke = function stroke() {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("stroke " + toSafeArrayString(arguments));
    };

    function parseFillColor(color) {
      color = parseColor(color);
      if (alphaOption.value) {
        var alpha = new Float32Array(4);
        alpha.set(color, 0);
        alpha[3] /= 2;
        color = alpha;
      }
      return color;
    }

    canvasWebGLContext.prototype.fillRect = function fillRect(x, y, w, h) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("fillRect " + toSafeArrayString(arguments));
      var path = new GL.Path();
      var p = this._transformPathPoint(x, y);
      var d = this._transformPathPoint(w, h);
      path.rect(p.x, p.y, d.x, d.y);
      var hash = path.hash();
      var geometry = cache[hash];
      if (!geometry) {
        console.warn("Filling Path");
        geometry = new GL.Geometry(this);
        var color = parseFillColor(this._fillStyle);
        geometry.addFill(path, color);
        cache[hash] = geometry;
      }
      this._scheduleJob(new GL.Job.Draw(this, geometry, GL.createMatrixFromTransform(this._pathOriginalTransform), 1));
    };

    canvasWebGLContext.prototype.fillText = function fillText(text, x, y, maxWidth) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("fillText " + toSafeArrayString(arguments));
    };

    canvasWebGLContext.prototype.strokeText = function strokeText(text, x, y, maxWidth) {
      traceOption.value >= TRACE_VERBOSE && writer.writeLn("strokeText " + toSafeArrayString(arguments));
    };

    canvasWebGLContext.prototype.flush = function () {
      console.warn("---- FLUSH ---- ");
      while (this._jobQueue.length > 0) {
        var job = this._jobQueue.shift();
        job.draw(this);
      }
    };

    return canvasWebGLContext;
  })();

  return CanvasWebGLContext;
})();
