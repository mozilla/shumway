/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var WebGL;
        (function (WebGL) {
            var Point3D = GFX.Geometry.Point3D;
            var Matrix3D = GFX.Geometry.Matrix3D;
            var degreesToRadian = GFX.Geometry.degreesToRadian;
            var assert = Shumway.Debug.assert;
            var unexpected = Shumway.Debug.unexpected;
            var notImplemented = Shumway.Debug.notImplemented;
            WebGL.SHADER_ROOT = "shaders/";
            function endsWith(str, end) {
                return str.indexOf(end, this.length - end.length) !== -1;
            }
            var WebGLContext = (function () {
                function WebGLContext(canvas, options) {
                    this._fillColor = Shumway.Color.Red;
                    this._surfaceRegionCache = new Shumway.LRUList();
                    this.modelViewProjectionMatrix = Matrix3D.createIdentity();
                    this._canvas = canvas;
                    this._options = options;
                    this.gl = (canvas.getContext("experimental-webgl", {
                        // preserveDrawingBuffer: true,
                        preserveDrawingBuffer: false,
                        antialias: true,
                        stencil: true,
                        premultipliedAlpha: false
                    }));
                    release || assert(this.gl, "Cannot create WebGL context.");
                    this._programCache = Object.create(null);
                    this._resize();
                    this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.unpackPremultiplyAlpha ? this.gl.ONE : this.gl.ZERO);
                    this._backgroundColor = Shumway.Color.Black;
                    this._geometry = new WebGL.WebGLGeometry(this);
                    this._tmpVertices = WebGL.Vertex.createEmptyVertices(WebGL.Vertex, 64);
                    this._maxSurfaces = options.maxSurfaces;
                    this._maxSurfaceSize = options.maxSurfaceSize;
                    // this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
                    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
                    this.gl.enable(this.gl.BLEND);
                    // this.gl.enable(this.gl.DEPTH_TEST);
                    this.modelViewProjectionMatrix = Matrix3D.create2DProjection(this._w, this._h, 2000);
                    var self = this;
                    this._surfaceRegionAllocator = new GFX.SurfaceRegionAllocator.SimpleAllocator(function () {
                        var texture = self._createTexture(1024, 1024);
                        return new WebGL.WebGLSurface(1024, 1024, texture);
                    });
                }
                Object.defineProperty(WebGLContext.prototype, "surfaces", {
                    get: function () {
                        return (this._surfaceRegionAllocator.surfaces);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(WebGLContext.prototype, "fillStyle", {
                    set: function (value) {
                        this._fillColor.set(Shumway.Color.parseColor(value));
                    },
                    enumerable: true,
                    configurable: true
                });
                WebGLContext.prototype.setBlendMode = function (value) {
                    var gl = this.gl;
                    switch (value) {
                        case 8 /* Add */:
                            gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
                            break;
                        case 3 /* Multiply */:
                            gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
                            break;
                        case 4 /* Screen */:
                            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                            break;
                        case 2 /* Layer */:
                        case 1 /* Normal */:
                            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                            break;
                        default:
                            notImplemented("Blend Mode: " + value);
                    }
                };
                WebGLContext.prototype.setBlendOptions = function () {
                    this.gl.blendFunc(this._options.sourceBlendFactor, this._options.destinationBlendFactor);
                };
                /**
                 * Whether the blend mode can be performed using |blendFunc|.
                 */
                WebGLContext.glSupportedBlendMode = function (value) {
                    switch (value) {
                        case 8 /* Add */:
                        case 3 /* Multiply */:
                        case 4 /* Screen */:
                        case 1 /* Normal */:
                            return true;
                        default:
                            return false;
                    }
                };
                WebGLContext.prototype.create2DProjectionMatrix = function () {
                    return Matrix3D.create2DProjection(this._w, this._h, -this._w);
                };
                WebGLContext.prototype.createPerspectiveMatrix = function (cameraDistance, fov, angle) {
                    var cameraAngleRadians = degreesToRadian(angle);
                    // Compute the projection matrix
                    var projectionMatrix = Matrix3D.createPerspective(degreesToRadian(fov), 1, 0.1, 5000);
                    var up = new Point3D(0, 1, 0);
                    var target = new Point3D(0, 0, 0);
                    var camera = new Point3D(0, 0, cameraDistance);
                    var cameraMatrix = Matrix3D.createCameraLookAt(camera, target, up);
                    var viewMatrix = Matrix3D.createInverse(cameraMatrix);
                    var matrix = Matrix3D.createIdentity();
                    matrix = Matrix3D.createMultiply(matrix, Matrix3D.createTranslation(-this._w / 2, -this._h / 2, 0));
                    matrix = Matrix3D.createMultiply(matrix, Matrix3D.createScale(1 / this._w, -1 / this._h, 1 / 100));
                    matrix = Matrix3D.createMultiply(matrix, Matrix3D.createYRotation(cameraAngleRadians));
                    matrix = Matrix3D.createMultiply(matrix, viewMatrix);
                    matrix = Matrix3D.createMultiply(matrix, projectionMatrix);
                    return matrix;
                };
                WebGLContext.prototype.discardCachedImages = function () {
                    GFX.traceLevel >= 2 /* Verbose */ && GFX.writer && GFX.writer.writeLn("Discard Cache");
                    var count = this._surfaceRegionCache.count / 2 | 0;
                    for (var i = 0; i < count; i++) {
                        var surfaceRegion = this._surfaceRegionCache.pop();
                        GFX.traceLevel >= 2 /* Verbose */ && GFX.writer && GFX.writer.writeLn("Discard: " + surfaceRegion);
                        surfaceRegion.texture.atlas.remove(surfaceRegion.region);
                        surfaceRegion.texture = null;
                    }
                };
                WebGLContext.prototype.cacheImage = function (image) {
                    var w = image.width;
                    var h = image.height;
                    var surfaceRegion = this.allocateSurfaceRegion(w, h);
                    GFX.traceLevel >= 2 /* Verbose */ && GFX.writer && GFX.writer.writeLn("Uploading Image: @ " + surfaceRegion.region);
                    this._surfaceRegionCache.use(surfaceRegion);
                    this.updateSurfaceRegion(image, surfaceRegion);
                    return surfaceRegion;
                };
                WebGLContext.prototype.allocateSurfaceRegion = function (w, h, discardCache) {
                    if (discardCache === void 0) { discardCache = true; }
                    return this._surfaceRegionAllocator.allocate(w, h, null);
                };
                /*
                public allocateTextureRegion(w: number, h: number, discardCache: boolean = true): WebGLSurfaceRegion {
                  var imageIsTileSized = (w === h) && (w === TILE_SIZE);
                  var texture, region;
                  for (var i = 0; i < this._surfaces.length; i++) {
                    texture = this._surfaces[i];
                    if (imageIsTileSized && texture.atlas.compact) {
                      continue;
                    }
                    region = texture.atlas.add(null, w, h);
                    if (region) {
                      break;
                    }
                  }
                  if (!region) {
                    if (w >= this._maxTextureSize || h >= this._maxTextureSize) {
                      // Region cannot possibly fit in the standard texture atlas.
                      texture = this.createTexture(w, h, !imageIsTileSized);
                    } else if (this._surfaces.length === this._maxTextures) {
                      if (discardCache) {
                        this.discardCachedImages();
                        return this.allocateTextureRegion(w, h, false);
                      }
                      return null;
                    } else {
                      texture = this.createTexture(this._maxTextureSize, this._maxTextureSize, !imageIsTileSized);
                    }
                    this._surfaces.push(texture);
                    region = texture.atlas.add(null, w, h);
                    release || assert (region);
                  }
                  return new WebGLSurfaceRegion(texture, region);
                }
                */
                WebGLContext.prototype.updateSurfaceRegion = function (image, surfaceRegion) {
                    var gl = this.gl;
                    gl.bindTexture(gl.TEXTURE_2D, surfaceRegion.surface.texture);
                    GFX.enterTimeline("texSubImage2D");
                    gl.texSubImage2D(gl.TEXTURE_2D, 0, surfaceRegion.region.x, surfaceRegion.region.y, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    GFX.leaveTimeline("texSubImage2D");
                };
                WebGLContext.prototype._resize = function () {
                    var gl = this.gl;
                    this._w = this._canvas.width;
                    this._h = this._canvas.height;
                    gl.viewport(0, 0, this._w, this._h);
                    for (var k in this._programCache) {
                        this._initializeProgram(this._programCache[k]);
                    }
                };
                WebGLContext.prototype._initializeProgram = function (program) {
                    var gl = this.gl;
                    gl.useProgram(program);
                    // gl.uniform2f(program.uniforms.uResolution.location, this._w, this._h);
                };
                WebGLContext.prototype._createShaderFromFile = function (file) {
                    var path = WebGL.SHADER_ROOT + file;
                    var gl = this.gl;
                    var request = new XMLHttpRequest();
                    request.open("GET", path, false);
                    request.send();
                    release || assert(request.status === 200 || request.status === 0, "File : " + path + " not found.");
                    var shaderType;
                    if (endsWith(path, ".vert")) {
                        shaderType = gl.VERTEX_SHADER;
                    }
                    else if (endsWith(path, ".frag")) {
                        shaderType = gl.FRAGMENT_SHADER;
                    }
                    else {
                        throw "Shader Type: not supported.";
                    }
                    return this._createShader(shaderType, request.responseText);
                };
                WebGLContext.prototype.createProgramFromFiles = function (vertex, fragment) {
                    var key = vertex + "-" + fragment;
                    var program = this._programCache[key];
                    if (!program) {
                        program = this._createProgram([
                            this._createShaderFromFile(vertex),
                            this._createShaderFromFile(fragment)
                        ]);
                        this._queryProgramAttributesAndUniforms(program);
                        this._initializeProgram(program);
                        this._programCache[key] = program;
                    }
                    return program;
                };
                WebGLContext.prototype._createProgram = function (shaders) {
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
                };
                WebGLContext.prototype._createShader = function (shaderType, shaderSource) {
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
                };
                WebGLContext.prototype._createTexture = function (w, h) {
                    var gl = this.gl;
                    var texture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                    return texture;
                };
                WebGLContext.prototype._createFramebuffer = function (texture) {
                    var gl = this.gl;
                    var framebuffer = gl.createFramebuffer();
                    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    return framebuffer;
                };
                WebGLContext.prototype._queryProgramAttributesAndUniforms = function (program) {
                    program.uniforms = {};
                    program.attributes = {};
                    var gl = this.gl;
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
                Object.defineProperty(WebGLContext.prototype, "target", {
                    set: function (surface) {
                        var gl = this.gl;
                        if (surface) {
                            gl.viewport(0, 0, surface.w, surface.h);
                            gl.bindFramebuffer(gl.FRAMEBUFFER, surface.framebuffer);
                        }
                        else {
                            gl.viewport(0, 0, this._w, this._h);
                            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                WebGLContext.prototype.clear = function (color) {
                    if (color === void 0) { color = Shumway.Color.None; }
                    var gl = this.gl;
                    gl.clearColor(0, 0, 0, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                };
                WebGLContext.prototype.clearTextureRegion = function (surfaceRegion, color) {
                    if (color === void 0) { color = Shumway.Color.None; }
                    var gl = this.gl;
                    var region = surfaceRegion.region;
                    this.target = surfaceRegion.surface;
                    gl.enable(gl.SCISSOR_TEST);
                    gl.scissor(region.x, region.y, region.w, region.h);
                    gl.clearColor(color.r, color.g, color.b, color.a);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    gl.disable(gl.SCISSOR_TEST);
                };
                WebGLContext.prototype.sizeOf = function (type) {
                    var gl = this.gl;
                    switch (type) {
                        case gl.UNSIGNED_BYTE:
                            return 1;
                        case gl.UNSIGNED_SHORT:
                            return 2;
                        case this.gl.INT:
                        case this.gl.FLOAT:
                            return 4;
                        default:
                            notImplemented(type);
                    }
                };
                WebGLContext.MAX_SURFACES = 8;
                return WebGLContext;
            })();
            WebGL.WebGLContext = WebGLContext;
        })(WebGL = GFX.WebGL || (GFX.WebGL = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var WebGL;
        (function (WebGL) {
            var release = false;
            var assert = Shumway.Debug.assert;
            /**
             * Utility class to help when writing to GL buffers.
             */
            var BufferWriter = (function (_super) {
                __extends(BufferWriter, _super);
                function BufferWriter() {
                    _super.apply(this, arguments);
                }
                BufferWriter.prototype.ensureVertexCapacity = function (count) {
                    release || assert((this._offset & 0x3) === 0);
                    this.ensureCapacity(this._offset + count * 8);
                };
                BufferWriter.prototype.writeVertex = function (x, y) {
                    release || assert((this._offset & 0x3) === 0);
                    this.ensureCapacity(this._offset + 8);
                    this.writeVertexUnsafe(x, y);
                };
                BufferWriter.prototype.writeVertexUnsafe = function (x, y) {
                    var index = this._offset >> 2;
                    this._f32[index] = x;
                    this._f32[index + 1] = y;
                    this._offset += 8;
                };
                BufferWriter.prototype.writeVertex3D = function (x, y, z) {
                    release || assert((this._offset & 0x3) === 0);
                    this.ensureCapacity(this._offset + 12);
                    this.writeVertex3DUnsafe(x, y, z);
                };
                BufferWriter.prototype.writeVertex3DUnsafe = function (x, y, z) {
                    var index = this._offset >> 2;
                    this._f32[index] = x;
                    this._f32[index + 1] = y;
                    this._f32[index + 2] = z;
                    this._offset += 12;
                };
                BufferWriter.prototype.writeTriangleElements = function (a, b, c) {
                    release || assert((this._offset & 0x1) === 0);
                    this.ensureCapacity(this._offset + 6);
                    var index = this._offset >> 1;
                    this._u16[index] = a;
                    this._u16[index + 1] = b;
                    this._u16[index + 2] = c;
                    this._offset += 6;
                };
                BufferWriter.prototype.ensureColorCapacity = function (count) {
                    release || assert((this._offset & 0x2) === 0);
                    this.ensureCapacity(this._offset + count * 16);
                };
                BufferWriter.prototype.writeColorFloats = function (r, g, b, a) {
                    release || assert((this._offset & 0x2) === 0);
                    this.ensureCapacity(this._offset + 16);
                    this.writeColorFloatsUnsafe(r, g, b, a);
                };
                BufferWriter.prototype.writeColorFloatsUnsafe = function (r, g, b, a) {
                    var index = this._offset >> 2;
                    this._f32[index] = r;
                    this._f32[index + 1] = g;
                    this._f32[index + 2] = b;
                    this._f32[index + 3] = a;
                    this._offset += 16;
                };
                BufferWriter.prototype.writeColor = function (r, g, b, a) {
                    release || assert((this._offset & 0x3) === 0);
                    this.ensureCapacity(this._offset + 4);
                    var index = this._offset >> 2;
                    this._i32[index] = a << 24 | b << 16 | g << 8 | r;
                    this._offset += 4;
                };
                BufferWriter.prototype.writeColorUnsafe = function (r, g, b, a) {
                    var index = this._offset >> 2;
                    this._i32[index] = a << 24 | b << 16 | g << 8 | r;
                    this._offset += 4;
                };
                BufferWriter.prototype.writeRandomColor = function () {
                    this.writeColor(Math.random(), Math.random(), Math.random(), Math.random() / 2);
                };
                return BufferWriter;
            })(Shumway.ArrayUtilities.ArrayWriter);
            WebGL.BufferWriter = BufferWriter;
            var WebGLAttribute = (function () {
                function WebGLAttribute(name, size, type, normalized) {
                    if (normalized === void 0) { normalized = false; }
                    this.name = name;
                    this.size = size;
                    this.type = type;
                    this.normalized = normalized;
                }
                return WebGLAttribute;
            })();
            WebGL.WebGLAttribute = WebGLAttribute;
            var WebGLAttributeList = (function () {
                function WebGLAttributeList(attributes) {
                    this.size = 0;
                    this.attributes = attributes;
                }
                WebGLAttributeList.prototype.initialize = function (context) {
                    var offset = 0;
                    for (var i = 0; i < this.attributes.length; i++) {
                        this.attributes[i].offset = offset;
                        offset += context.sizeOf(this.attributes[i].type) * this.attributes[i].size;
                    }
                    this.size = offset;
                };
                return WebGLAttributeList;
            })();
            WebGL.WebGLAttributeList = WebGLAttributeList;
            var WebGLGeometry = (function () {
                function WebGLGeometry(context) {
                    this.triangleCount = 0;
                    this._elementOffset = 0;
                    this.context = context;
                    this.array = new BufferWriter(8);
                    this.buffer = context.gl.createBuffer();
                    this.elementArray = new BufferWriter(8);
                    this.elementBuffer = context.gl.createBuffer();
                }
                Object.defineProperty(WebGLGeometry.prototype, "elementOffset", {
                    get: function () {
                        return this._elementOffset;
                    },
                    enumerable: true,
                    configurable: true
                });
                WebGLGeometry.prototype.addQuad = function () {
                    var offset = this._elementOffset;
                    this.elementArray.writeTriangleElements(offset, offset + 1, offset + 2);
                    this.elementArray.writeTriangleElements(offset, offset + 2, offset + 3);
                    this.triangleCount += 2;
                    this._elementOffset += 4;
                };
                WebGLGeometry.prototype.resetElementOffset = function () {
                    this._elementOffset = 0;
                };
                WebGLGeometry.prototype.reset = function () {
                    this.array.reset();
                    this.elementArray.reset();
                    this.resetElementOffset();
                    this.triangleCount = 0;
                };
                WebGLGeometry.prototype.uploadBuffers = function () {
                    var gl = this.context.gl;
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, this.array.subU8View(), gl.DYNAMIC_DRAW);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.elementArray.subU8View(), gl.DYNAMIC_DRAW);
                };
                return WebGLGeometry;
            })();
            WebGL.WebGLGeometry = WebGLGeometry;
            var Vertex = (function (_super) {
                __extends(Vertex, _super);
                function Vertex(x, y, z) {
                    _super.call(this, x, y, z);
                }
                Vertex.createEmptyVertices = function (type, count) {
                    var result = [];
                    for (var i = 0; i < count; i++) {
                        result.push(new type(0, 0, 0));
                    }
                    return result;
                };
                return Vertex;
            })(GFX.Geometry.Point3D);
            WebGL.Vertex = Vertex;
            (function (WebGLBlendFactor) {
                WebGLBlendFactor[WebGLBlendFactor["ZERO"] = 0] = "ZERO";
                WebGLBlendFactor[WebGLBlendFactor["ONE"] = 1] = "ONE";
                WebGLBlendFactor[WebGLBlendFactor["SRC_COLOR"] = 768] = "SRC_COLOR";
                WebGLBlendFactor[WebGLBlendFactor["ONE_MINUS_SRC_COLOR"] = 769] = "ONE_MINUS_SRC_COLOR";
                WebGLBlendFactor[WebGLBlendFactor["DST_COLOR"] = 774] = "DST_COLOR";
                WebGLBlendFactor[WebGLBlendFactor["ONE_MINUS_DST_COLOR"] = 775] = "ONE_MINUS_DST_COLOR";
                WebGLBlendFactor[WebGLBlendFactor["SRC_ALPHA"] = 770] = "SRC_ALPHA";
                WebGLBlendFactor[WebGLBlendFactor["ONE_MINUS_SRC_ALPHA"] = 771] = "ONE_MINUS_SRC_ALPHA";
                WebGLBlendFactor[WebGLBlendFactor["DST_ALPHA"] = 772] = "DST_ALPHA";
                WebGLBlendFactor[WebGLBlendFactor["ONE_MINUS_DST_ALPHA"] = 773] = "ONE_MINUS_DST_ALPHA";
                WebGLBlendFactor[WebGLBlendFactor["SRC_ALPHA_SATURATE"] = 776] = "SRC_ALPHA_SATURATE";
                WebGLBlendFactor[WebGLBlendFactor["CONSTANT_COLOR"] = 32769] = "CONSTANT_COLOR";
                WebGLBlendFactor[WebGLBlendFactor["ONE_MINUS_CONSTANT_COLOR"] = 32770] = "ONE_MINUS_CONSTANT_COLOR";
                WebGLBlendFactor[WebGLBlendFactor["CONSTANT_ALPHA"] = 32771] = "CONSTANT_ALPHA";
                WebGLBlendFactor[WebGLBlendFactor["ONE_MINUS_CONSTANT_ALPHA"] = 32772] = "ONE_MINUS_CONSTANT_ALPHA";
            })(WebGL.WebGLBlendFactor || (WebGL.WebGLBlendFactor = {}));
            var WebGLBlendFactor = WebGL.WebGLBlendFactor;
        })(WebGL = GFX.WebGL || (GFX.WebGL = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var WebGL;
        (function (WebGL) {
            var release = false;
            var WebGLSurface = (function () {
                function WebGLSurface(w, h, texture) {
                    this.texture = texture;
                    this.w = w;
                    this.h = h;
                    this._regionAllocator = new GFX.RegionAllocator.CompactAllocator(this.w, this.h);
                }
                WebGLSurface.prototype.allocate = function (w, h) {
                    var region = this._regionAllocator.allocate(w, h);
                    if (region) {
                        return new WebGLSurfaceRegion(this, region);
                    }
                    return null;
                };
                WebGLSurface.prototype.free = function (surfaceRegion) {
                    this._regionAllocator.free(surfaceRegion.region);
                };
                return WebGLSurface;
            })();
            WebGL.WebGLSurface = WebGLSurface;
            /**
             * A (region, texture) pair. These objects can appear in linked lists hence the next and previous pointers. Regions
             * don't necessarily need to have a texture reference. Setting the texture reference to null is a way to indicate
             * that the region no longer points to valid texture data.
             */
            var WebGLSurfaceRegion = (function () {
                function WebGLSurfaceRegion(surface, region) {
                    this.surface = surface;
                    this.region = region;
                    this.next = this.previous = null;
                }
                return WebGLSurfaceRegion;
            })();
            WebGL.WebGLSurfaceRegion = WebGLSurfaceRegion;
        })(WebGL = GFX.WebGL || (GFX.WebGL = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var WebGL;
        (function (WebGL) {
            var Color = Shumway.Color;
            var SCRATCH_CANVAS_SIZE = 1024 * 2;
            WebGL.TILE_SIZE = 256;
            WebGL.MIN_UNTILED_SIZE = 256;
            function getTileSize(bounds) {
                if (bounds.w < WebGL.TILE_SIZE || bounds.h < WebGL.TILE_SIZE) {
                    return Math.min(bounds.w, bounds.h);
                }
                return WebGL.TILE_SIZE;
            }
            var Matrix = GFX.Geometry.Matrix;
            var Rectangle = GFX.Geometry.Rectangle;
            var WebGLRendererOptions = (function (_super) {
                __extends(WebGLRendererOptions, _super);
                function WebGLRendererOptions() {
                    _super.apply(this, arguments);
                    this.maxSurfaces = 8;
                    this.maxSurfaceSize = 2048 * 2;
                    this.animateZoom = true;
                    /**
                     * Sometimes it's useful to temporarily disable texture uploads to see if rendering
                     * is texture upload bound.
                     */
                    this.disableSurfaceUploads = false;
                    this.frameSpacing = 0.0001;
                    this.ignoreColorMatrix = false;
                    this.drawSurfaces = false;
                    this.drawSurface = -1;
                    this.premultipliedAlpha = false;
                    this.unpackPremultiplyAlpha = true;
                    this.showTemporaryCanvases = false;
                    this.sourceBlendFactor = 1 /* ONE */;
                    this.destinationBlendFactor = 771 /* ONE_MINUS_SRC_ALPHA */;
                }
                return WebGLRendererOptions;
            })(GFX.RendererOptions);
            WebGL.WebGLRendererOptions = WebGLRendererOptions;
            var WebGLRenderer = (function (_super) {
                __extends(WebGLRenderer, _super);
                function WebGLRenderer(container, stage, options) {
                    if (options === void 0) { options = new WebGLRendererOptions(); }
                    _super.call(this, container, stage, options);
                    this._tmpVertices = WebGL.Vertex.createEmptyVertices(WebGL.Vertex, 64);
                    this._cachedTiles = [];
                    var context = this._context = new WebGL.WebGLContext(this._canvas, options);
                    this._updateSize();
                    this._brush = new WebGL.WebGLCombinedBrush(context, new WebGL.WebGLGeometry(context));
                    this._stencilBrush = new WebGL.WebGLCombinedBrush(context, new WebGL.WebGLGeometry(context));
                    this._scratchCanvas = document.createElement("canvas");
                    this._scratchCanvas.width = this._scratchCanvas.height = SCRATCH_CANVAS_SIZE;
                    this._scratchCanvasContext = this._scratchCanvas.getContext("2d", {
                        willReadFrequently: true
                    });
                    this._dynamicScratchCanvas = document.createElement("canvas");
                    this._dynamicScratchCanvas.width = this._dynamicScratchCanvas.height = 0;
                    this._dynamicScratchCanvasContext = this._dynamicScratchCanvas.getContext("2d", {
                        willReadFrequently: true
                    });
                    this._uploadCanvas = document.createElement("canvas");
                    this._uploadCanvas.width = this._uploadCanvas.height = 0;
                    this._uploadCanvasContext = this._uploadCanvas.getContext("2d", {
                        willReadFrequently: true
                    });
                    if (options.showTemporaryCanvases) {
                        document.getElementById("temporaryCanvasPanelContainer").appendChild(this._uploadCanvas);
                        document.getElementById("temporaryCanvasPanelContainer").appendChild(this._scratchCanvas);
                    }
                    this._clipStack = [];
                }
                WebGLRenderer.prototype.resize = function () {
                    this._updateSize();
                    this.render();
                };
                WebGLRenderer.prototype._updateSize = function () {
                    this._viewport = new Rectangle(0, 0, this._canvas.width, this._canvas.height);
                    this._context._resize();
                };
                WebGLRenderer.prototype._cacheImageCallback = function (oldSurfaceRegion, src, srcBounds) {
                    /*
                     * To avoid seeming caused by linear texture sampling we need to pad each atlased image with a 1 pixel border that duplicates
                     * edge pixels, similar to CLAMP_TO_EDGE
                     *
                     * See the discussion here: http://gamedev.stackexchange.com/questions/61796/sprite-sheet-textures-picking-up-edges-of-adjacent-texture
                     *
                     * For the image:
                     *
                     *    +---+
                     *    |123|
                     *    |456|
                     *    |789|
                     *    +---+
                     *
                     * We instead create:
                     *
                     *  +-------+
                     *  |? 123 ?|
                     *  | +---+ |
                     *  |1|123|3|
                     *  |4|456|6|
                     *  |7|789|9|
                     *  | +---+ |
                     *  |? 789 ?|
                     *  +-------+
                     *
                     *  I don't know what to do about corners yet. Might not be a problem, I don't see any artifacts if they are left empty.
                     */
                    var w = srcBounds.w;
                    var h = srcBounds.h;
                    var sx = srcBounds.x;
                    var sy = srcBounds.y;
                    this._uploadCanvas.width = w + 2;
                    this._uploadCanvas.height = h + 2;
                    // Draw Image
                    this._uploadCanvasContext.drawImage(src.canvas, sx, sy, w, h, 1, 1, w, h);
                    // Top & Bottom Margins
                    this._uploadCanvasContext.drawImage(src.canvas, sx, sy, w, 1, 1, 0, w, 1);
                    this._uploadCanvasContext.drawImage(src.canvas, sx, sy + h - 1, w, 1, 1, h + 1, w, 1);
                    // Left & Right Margins
                    this._uploadCanvasContext.drawImage(src.canvas, sx, sy, 1, h, 0, 1, 1, h);
                    this._uploadCanvasContext.drawImage(src.canvas, sx + w - 1, sy, 1, h, w + 1, 1, 1, h);
                    if (!oldSurfaceRegion || !oldSurfaceRegion.surface) {
                        return this._context.cacheImage(this._uploadCanvas);
                    }
                    else {
                        if (!this._options.disableSurfaceUploads) {
                            this._context.updateSurfaceRegion(this._uploadCanvas, oldSurfaceRegion);
                        }
                        return oldSurfaceRegion;
                    }
                };
                WebGLRenderer.prototype._enterClip = function (clip, matrix, brush, viewport) {
                    brush.flush();
                    var gl = this._context.gl;
                    if (this._clipStack.length === 0) {
                        gl.enable(gl.STENCIL_TEST);
                        gl.clear(gl.STENCIL_BUFFER_BIT);
                        gl.stencilFunc(gl.ALWAYS, 1, 1);
                    }
                    this._clipStack.push(clip);
                    gl.colorMask(false, false, false, false);
                    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
                    this._renderFrame(clip, matrix, brush, viewport, 0);
                    brush.flush();
                    gl.colorMask(true, true, true, true);
                    gl.stencilFunc(gl.NOTEQUAL, 0, this._clipStack.length);
                    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                };
                WebGLRenderer.prototype._leaveClip = function (clip, matrix, brush, viewport) {
                    brush.flush();
                    var gl = this._context.gl;
                    var clip = this._clipStack.pop();
                    if (clip) {
                        gl.colorMask(false, false, false, false);
                        gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
                        this._renderFrame(clip, matrix, brush, viewport, 0);
                        brush.flush();
                        gl.colorMask(true, true, true, true);
                        gl.stencilFunc(gl.NOTEQUAL, 0, this._clipStack.length);
                        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                    }
                    if (this._clipStack.length === 0) {
                        gl.disable(gl.STENCIL_TEST);
                    }
                };
                WebGLRenderer.prototype._renderFrame = function (root, matrix, brush, viewport, depth) {
                    if (depth === void 0) { depth = 0; }
                    //      var self = this;
                    //      var options = this._options;
                    //      var context = this._context;
                    //      var gl = context.gl;
                    //      var cacheImageCallback = this._cacheImageCallback.bind(this);
                    //      var tileMatrix = Matrix.createIdentity();
                    //      var colorMatrix = ColorMatrix.createIdentity();
                    //      var inverseMatrix = Matrix.createIdentity();
                    //      root.visit(function (frame: Node, matrix?: Matrix, flags?: NodeFlags): VisitorFlags {
                    //        depth += options.frameSpacing;
                    //
                    //        var bounds = frame.getBounds();
                    //
                    //        if (flags & FrameFlags.EnterClip) {
                    //          self._enterClip(frame, matrix, brush, viewport);
                    //          return;
                    //        } else if (flags & FrameFlags.LeaveClip) {
                    //          self._leaveClip(frame, matrix, brush, viewport);
                    //          return;
                    //        }
                    //
                    //        // Return early if the bounds are not within the viewport.
                    //        if (!viewport.intersectsTransformedAABB(bounds, matrix)) {
                    //          return VisitorFlags.Skip;
                    //        }
                    //
                    //        var alpha = frame.getConcatenatedAlpha(root);
                    //        if (!options.ignoreColorMatrix) {
                    //          colorMatrix = frame.getConcatenatedColorMatrix();
                    //        }
                    //
                    //        if (frame instanceof FrameContainer) {
                    //          if (frame instanceof ClipRectangle || options.paintBounds) {
                    //            brush.fillRectangle(bounds, Color.randomColor(0.3), matrix, depth);
                    //          }
                    ////          if (frame !== root && frame.blendMode !== BlendMode.Normal) {
                    ////            // self._renderFrameLayer(frame, matrix, brush);
                    ////            // self._renderFrameIntoTextureRegion(frame, transform);
                    ////            return VisitorFlags.Skip;
                    ////          }
                    //        } else if (frame instanceof Shape) {
                    //          if (frame.blendMode !== BlendMode.Normal) {
                    //            if (!WebGLContext.glSupportedBlendMode(frame.blendMode)) {
                    //              // gl.TEXTURE_2D
                    //              // gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 4, 4, 16, 16);
                    //              // Now we need to render the frame into a texture.
                    //            }
                    //            return VisitorFlags.Skip;
                    //          }
                    //          var shape = <Shape2>frame;
                    //          var bounds = shape.source.getBounds();
                    //          if (!bounds.isEmpty()) {
                    //            var source = shape.source;
                    //            var tileCache: RenderableTileCache = source.properties["tileCache"];
                    //            if (!tileCache) {
                    //              tileCache = source.properties["tileCache"] = new RenderableTileCache(source, TILE_SIZE, MIN_UNTILED_SIZE);
                    //            }
                    //            var t = Matrix.createIdentity().translate(bounds.x, bounds.y);
                    //            t.concat(matrix);
                    //            t.inverse(inverseMatrix);
                    //            var tiles = tileCache.fetchTiles(viewport, inverseMatrix, self._scratchCanvasContext, cacheImageCallback);
                    //            for (var i = 0; i < tiles.length; i++) {
                    //              var tile = tiles[i];
                    //              tileMatrix.setIdentity();
                    //              tileMatrix.translate(tile.bounds.x, tile.bounds.y);
                    //              tileMatrix.scale(1 / tile.scale, 1 / tile.scale);
                    //              tileMatrix.translate(bounds.x, bounds.y);
                    //              tileMatrix.concat(matrix);
                    //              var src = <WebGLSurfaceRegion>(tile.cachedSurfaceRegion);
                    //              if (src && src.surface) {
                    //                context._surfaceRegionCache.use(src);
                    //              }
                    //              var color = new Color(1, 1, 1, alpha);
                    //              if (options.paintFlashing) {
                    //                color = Color.randomColor(1);
                    //              }
                    //              if (!brush.drawImage(src, new Rectangle(0, 0, tile.bounds.w, tile.bounds.h), color, colorMatrix, tileMatrix, depth, frame.blendMode)) {
                    //                unexpected();
                    //              }
                    //              if (options.drawTiles) {
                    //                var srcBounds = tile.bounds.clone();
                    //                if (!tile.color) {
                    //                  tile.color = Color.randomColor(0.4);
                    //                }
                    //                brush.fillRectangle(new Rectangle(0, 0, srcBounds.w, srcBounds.h), tile.color, tileMatrix, depth);
                    //              }
                    //            }
                    //          }
                    //        }
                    //        return VisitorFlags.Continue;
                    //      }, matrix, FrameFlags.Empty, VisitorFlags.Clips);
                };
                WebGLRenderer.prototype._renderSurfaces = function (brush) {
                    var options = this._options;
                    var context = this._context;
                    var viewport = this._viewport;
                    if (options.drawSurfaces) {
                        var surfaces = context.surfaces;
                        var matrix = Matrix.createIdentity();
                        if (options.drawSurface >= 0 && options.drawSurface < surfaces.length) {
                            var surface = surfaces[options.drawSurface | 0];
                            var src = new Rectangle(0, 0, surface.w, surface.h);
                            var dst = src.clone();
                            while (dst.w > viewport.w) {
                                dst.scale(0.5, 0.5);
                            }
                            brush.drawImage(new WebGL.WebGLSurfaceRegion(surface, src), dst, Color.White, null, matrix, 0.2);
                        }
                        else {
                            var surfaceWindowSize = viewport.w / 5;
                            if (surfaceWindowSize > viewport.h / surfaces.length) {
                                surfaceWindowSize = viewport.h / surfaces.length;
                            }
                            brush.fillRectangle(new Rectangle(viewport.w - surfaceWindowSize, 0, surfaceWindowSize, viewport.h), new Color(0, 0, 0, 0.5), matrix, 0.1);
                            for (var i = 0; i < surfaces.length; i++) {
                                var surface = surfaces[i];
                                var surfaceWindow = new Rectangle(viewport.w - surfaceWindowSize, i * surfaceWindowSize, surfaceWindowSize, surfaceWindowSize);
                                brush.drawImage(new WebGL.WebGLSurfaceRegion(surface, new Rectangle(0, 0, surface.w, surface.h)), surfaceWindow, Color.White, null, matrix, 0.2);
                            }
                        }
                        brush.flush();
                    }
                };
                WebGLRenderer.prototype.render = function () {
                    var self = this;
                    var stage = this._stage;
                    var options = this._options;
                    var context = this._context;
                    var gl = context.gl;
                    // TODO: Only set the camera once, not every frame.
                    if (options.perspectiveCamera) {
                        this._context.modelViewProjectionMatrix = this._context.createPerspectiveMatrix(options.perspectiveCameraDistance + (options.animateZoom ? Math.sin(Date.now() / 3000) * 0.8 : 0), options.perspectiveCameraFOV, options.perspectiveCameraAngle);
                    }
                    else {
                        this._context.modelViewProjectionMatrix = this._context.create2DProjectionMatrix();
                    }
                    var brush = this._brush;
                    gl.clearColor(0, 0, 0, 0);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    brush.reset();
                    var viewport = this._viewport;
                    GFX.enterTimeline("_renderFrame");
                    // this._renderFrame(stage, stage.matrix, brush, viewport, 0);
                    GFX.leaveTimeline();
                    brush.flush();
                    if (options.paintViewport) {
                        brush.fillRectangle(viewport, new Color(0.5, 0, 0, 0.25), Matrix.createIdentity(), 0);
                        brush.flush();
                    }
                    this._renderSurfaces(brush);
                };
                return WebGLRenderer;
            })(GFX.Renderer);
            WebGL.WebGLRenderer = WebGLRenderer;
        })(WebGL = GFX.WebGL || (GFX.WebGL = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var WebGL;
        (function (WebGL) {
            var Color = Shumway.Color;
            var Point = GFX.Geometry.Point;
            var Matrix3D = GFX.Geometry.Matrix3D;
            var WebGLBrush = (function () {
                function WebGLBrush(context, geometry, target) {
                    this._target = target;
                    this._context = context;
                    this._geometry = geometry;
                }
                WebGLBrush.prototype.reset = function () {
                    Shumway.Debug.abstractMethod("reset");
                };
                WebGLBrush.prototype.flush = function () {
                    Shumway.Debug.abstractMethod("flush");
                };
                Object.defineProperty(WebGLBrush.prototype, "target", {
                    get: function () {
                        return this._target;
                    },
                    set: function (target) {
                        if (this._target !== target) {
                            this.flush();
                        }
                        this._target = target;
                    },
                    enumerable: true,
                    configurable: true
                });
                return WebGLBrush;
            })();
            WebGL.WebGLBrush = WebGLBrush;
            (function (WebGLCombinedBrushKind) {
                WebGLCombinedBrushKind[WebGLCombinedBrushKind["FillColor"] = 0] = "FillColor";
                WebGLCombinedBrushKind[WebGLCombinedBrushKind["FillTexture"] = 1] = "FillTexture";
                WebGLCombinedBrushKind[WebGLCombinedBrushKind["FillTextureWithColorMatrix"] = 2] = "FillTextureWithColorMatrix";
            })(WebGL.WebGLCombinedBrushKind || (WebGL.WebGLCombinedBrushKind = {}));
            var WebGLCombinedBrushKind = WebGL.WebGLCombinedBrushKind;
            var WebGLCombinedBrushVertex = (function (_super) {
                __extends(WebGLCombinedBrushVertex, _super);
                function WebGLCombinedBrushVertex(x, y, z) {
                    _super.call(this, x, y, z);
                    this.kind = 0 /* FillColor */;
                    this.color = new Color(0, 0, 0, 0);
                    this.sampler = 0;
                    this.coordinate = new Point(0, 0);
                }
                WebGLCombinedBrushVertex.initializeAttributeList = function (context) {
                    var gl = context.gl;
                    if (WebGLCombinedBrushVertex.attributeList) {
                        return;
                    }
                    WebGLCombinedBrushVertex.attributeList = new WebGL.WebGLAttributeList([
                        new WebGL.WebGLAttribute("aPosition", 3, gl.FLOAT),
                        new WebGL.WebGLAttribute("aCoordinate", 2, gl.FLOAT),
                        new WebGL.WebGLAttribute("aColor", 4, gl.UNSIGNED_BYTE, true),
                        new WebGL.WebGLAttribute("aKind", 1, gl.FLOAT),
                        new WebGL.WebGLAttribute("aSampler", 1, gl.FLOAT)
                    ]);
                    WebGLCombinedBrushVertex.attributeList.initialize(context);
                };
                WebGLCombinedBrushVertex.prototype.writeTo = function (geometry) {
                    var array = geometry.array;
                    array.ensureAdditionalCapacity(68);
                    array.writeVertex3DUnsafe(this.x, this.y, this.z);
                    array.writeVertexUnsafe(this.coordinate.x, this.coordinate.y);
                    array.writeColorUnsafe(this.color.r * 255, this.color.g * 255, this.color.b * 255, this.color.a * 255);
                    array.writeFloatUnsafe(this.kind);
                    array.writeFloatUnsafe(this.sampler);
                };
                return WebGLCombinedBrushVertex;
            })(WebGL.Vertex);
            WebGL.WebGLCombinedBrushVertex = WebGLCombinedBrushVertex;
            var WebGLCombinedBrush = (function (_super) {
                __extends(WebGLCombinedBrush, _super);
                function WebGLCombinedBrush(context, geometry, target) {
                    if (target === void 0) { target = null; }
                    _super.call(this, context, geometry, target);
                    this._blendMode = 1 /* Normal */;
                    this._program = context.createProgramFromFiles("combined.vert", "combined.frag");
                    this._surfaces = [];
                    WebGLCombinedBrushVertex.initializeAttributeList(this._context);
                }
                WebGLCombinedBrush.prototype.reset = function () {
                    this._surfaces = [];
                    this._geometry.reset();
                };
                WebGLCombinedBrush.prototype.drawImage = function (src, dstRectangle, color, colorMatrix, matrix, depth, blendMode) {
                    if (depth === void 0) { depth = 0; }
                    if (blendMode === void 0) { blendMode = 1 /* Normal */; }
                    if (!src || !src.surface) {
                        return true;
                    }
                    dstRectangle = dstRectangle.clone();
                    if (this._colorMatrix) {
                        if (!colorMatrix || !this._colorMatrix.equals(colorMatrix)) {
                            this.flush();
                        }
                    }
                    this._colorMatrix = colorMatrix;
                    if (this._blendMode !== blendMode) {
                        this.flush();
                        this._blendMode = blendMode;
                    }
                    var sampler = this._surfaces.indexOf(src.surface);
                    if (sampler < 0) {
                        if (this._surfaces.length === 8) {
                            this.flush();
                        }
                        this._surfaces.push(src.surface);
                        // if (this._surfaces.length > 8) {
                        //   return false;
                        //   notImplemented("Cannot handle more than 8 texture samplers.");
                        // }
                        sampler = this._surfaces.length - 1;
                    }
                    var tmpVertices = WebGLCombinedBrush._tmpVertices;
                    var srcRectangle = src.region.clone();
                    // TODO: This takes into the consideration the 1 pixel border added around tiles in the atlas. It should
                    // probably be moved elsewhere.
                    srcRectangle.offset(1, 1).resize(-2, -2);
                    srcRectangle.scale(1 / src.surface.w, 1 / src.surface.h);
                    matrix.transformRectangle(dstRectangle, tmpVertices);
                    for (var i = 0; i < 4; i++) {
                        tmpVertices[i].z = depth;
                    }
                    tmpVertices[0].coordinate.x = srcRectangle.x;
                    tmpVertices[0].coordinate.y = srcRectangle.y;
                    tmpVertices[1].coordinate.x = srcRectangle.x + srcRectangle.w;
                    tmpVertices[1].coordinate.y = srcRectangle.y;
                    tmpVertices[2].coordinate.x = srcRectangle.x + srcRectangle.w;
                    tmpVertices[2].coordinate.y = srcRectangle.y + srcRectangle.h;
                    tmpVertices[3].coordinate.x = srcRectangle.x;
                    tmpVertices[3].coordinate.y = srcRectangle.y + srcRectangle.h;
                    for (var i = 0; i < 4; i++) {
                        var vertex = WebGLCombinedBrush._tmpVertices[i];
                        vertex.kind = colorMatrix ? 2 /* FillTextureWithColorMatrix */ : 1 /* FillTexture */;
                        vertex.color.set(color);
                        vertex.sampler = sampler;
                        vertex.writeTo(this._geometry);
                    }
                    this._geometry.addQuad();
                    return true;
                };
                WebGLCombinedBrush.prototype.fillRectangle = function (rectangle, color, matrix, depth) {
                    if (depth === void 0) { depth = 0; }
                    matrix.transformRectangle(rectangle, WebGLCombinedBrush._tmpVertices);
                    for (var i = 0; i < 4; i++) {
                        var vertex = WebGLCombinedBrush._tmpVertices[i];
                        vertex.kind = 0 /* FillColor */;
                        vertex.color.set(color);
                        vertex.z = depth;
                        vertex.writeTo(this._geometry);
                    }
                    this._geometry.addQuad();
                };
                WebGLCombinedBrush.prototype.flush = function () {
                    GFX.enterTimeline("WebGLCombinedBrush.flush");
                    var g = this._geometry;
                    var p = this._program;
                    var gl = this._context.gl;
                    var matrix;
                    g.uploadBuffers();
                    gl.useProgram(p);
                    if (this._target) {
                        matrix = Matrix3D.create2DProjection(this._target.w, this._target.h, 2000);
                        matrix = Matrix3D.createMultiply(matrix, Matrix3D.createScale(1, -1, 1));
                    }
                    else {
                        matrix = this._context.modelViewProjectionMatrix;
                    }
                    gl.uniformMatrix4fv(p.uniforms.uTransformMatrix3D.location, false, matrix.asWebGLMatrix());
                    if (this._colorMatrix) {
                        gl.uniformMatrix4fv(p.uniforms.uColorMatrix.location, false, this._colorMatrix.asWebGLMatrix());
                        gl.uniform4fv(p.uniforms.uColorVector.location, this._colorMatrix.asWebGLVector());
                    }
                    for (var i = 0; i < this._surfaces.length; i++) {
                        gl.activeTexture(gl.TEXTURE0 + i);
                        gl.bindTexture(gl.TEXTURE_2D, this._surfaces[i].texture);
                    }
                    gl.uniform1iv(p.uniforms["uSampler[0]"].location, [0, 1, 2, 3, 4, 5, 6, 7]);
                    // Bind vertex buffer.
                    gl.bindBuffer(gl.ARRAY_BUFFER, g.buffer);
                    var size = WebGLCombinedBrushVertex.attributeList.size;
                    var attributeList = WebGLCombinedBrushVertex.attributeList;
                    var attributes = attributeList.attributes;
                    for (var i = 0; i < attributes.length; i++) {
                        var attribute = attributes[i];
                        var position = p.attributes[attribute.name].location;
                        gl.enableVertexAttribArray(position);
                        gl.vertexAttribPointer(position, attribute.size, attribute.type, attribute.normalized, size, attribute.offset);
                    }
                    // this._context.setBlendMode(this._blendMode);
                    this._context.setBlendOptions();
                    // Bind target.
                    this._context.target = this._target;
                    // Bind elements buffer.
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.elementBuffer);
                    gl.drawElements(gl.TRIANGLES, g.triangleCount * 3, gl.UNSIGNED_SHORT, 0);
                    this.reset();
                    GFX.leaveTimeline("WebGLCombinedBrush.flush");
                };
                WebGLCombinedBrush._tmpVertices = WebGL.Vertex.createEmptyVertices(WebGLCombinedBrushVertex, 4);
                WebGLCombinedBrush._depth = 1;
                return WebGLCombinedBrush;
            })(WebGLBrush);
            WebGL.WebGLCombinedBrush = WebGLCombinedBrush;
        })(WebGL = GFX.WebGL || (GFX.WebGL = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Canvas2D;
        (function (Canvas2D) {
            var assert = Shumway.Debug.assert;
            var originalSave = CanvasRenderingContext2D.prototype.save;
            var originalClip = CanvasRenderingContext2D.prototype.clip;
            var originalFill = CanvasRenderingContext2D.prototype.fill;
            var originalStroke = CanvasRenderingContext2D.prototype.stroke;
            var originalRestore = CanvasRenderingContext2D.prototype.restore;
            var originalBeginPath = CanvasRenderingContext2D.prototype.beginPath;
            function debugSave() {
                if (this.stackDepth === undefined) {
                    this.stackDepth = 0;
                }
                if (this.clipStack === undefined) {
                    this.clipStack = [0];
                }
                else {
                    this.clipStack.push(0);
                }
                this.stackDepth++;
                originalSave.call(this);
            }
            function debugRestore() {
                this.stackDepth--;
                this.clipStack.pop();
                originalRestore.call(this);
            }
            function debugFill() {
                assert(!this.buildingClippingRegionDepth);
                originalFill.apply(this, arguments);
            }
            function debugStroke() {
                assert(GFX.debugClipping.value || !this.buildingClippingRegionDepth);
                originalStroke.apply(this, arguments);
            }
            function debugBeginPath() {
                originalBeginPath.call(this);
            }
            function debugClip() {
                if (this.clipStack === undefined) {
                    this.clipStack = [0];
                }
                this.clipStack[this.clipStack.length - 1]++;
                if (GFX.debugClipping.value) {
                    this.strokeStyle = Shumway.ColorStyle.Pink;
                    this.stroke.apply(this, arguments);
                }
                else {
                    originalClip.apply(this, arguments);
                }
            }
            function notifyReleaseChanged() {
                if (release) {
                    CanvasRenderingContext2D.prototype.save = originalSave;
                    CanvasRenderingContext2D.prototype.clip = originalClip;
                    CanvasRenderingContext2D.prototype.fill = originalFill;
                    CanvasRenderingContext2D.prototype.stroke = originalStroke;
                    CanvasRenderingContext2D.prototype.restore = originalRestore;
                    CanvasRenderingContext2D.prototype.beginPath = originalBeginPath;
                }
                else {
                    CanvasRenderingContext2D.prototype.save = debugSave;
                    CanvasRenderingContext2D.prototype.clip = debugClip;
                    CanvasRenderingContext2D.prototype.fill = debugFill;
                    CanvasRenderingContext2D.prototype.stroke = debugStroke;
                    CanvasRenderingContext2D.prototype.restore = debugRestore;
                    CanvasRenderingContext2D.prototype.beginPath = debugBeginPath;
                }
            }
            Canvas2D.notifyReleaseChanged = notifyReleaseChanged;
            CanvasRenderingContext2D.prototype.enterBuildingClippingRegion = function () {
                if (!this.buildingClippingRegionDepth) {
                    this.buildingClippingRegionDepth = 0;
                }
                this.buildingClippingRegionDepth++;
            };
            CanvasRenderingContext2D.prototype.leaveBuildingClippingRegion = function () {
                this.buildingClippingRegionDepth--;
            };
        })(Canvas2D = GFX.Canvas2D || (GFX.Canvas2D = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Canvas2D;
        (function (Canvas2D) {
            var clamp = Shumway.NumberUtilities.clamp;
            var isFirefox = navigator.userAgent.indexOf('Firefox') != -1;
            var Filters = (function () {
                function Filters() {
                }
                /**
                 * Creates an SVG element and defines filters that are referenced in |canvas.filter| properties. We cannot
                 * inline CSS filters because they don't expose independent blurX and blurY properties.
                 * This only works in Firefox, and you have to set the 'canvas.filters.enabled' equal to |true|.
                 */
                Filters._prepareSVGFilters = function () {
                    if (Filters._svgBlurFilter) {
                        return;
                    }
                    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                    // Blur Filter
                    var blurFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
                    blurFilter.setAttribute("id", "svgBlurFilter");
                    var feGaussianFilter = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
                    feGaussianFilter.setAttribute("stdDeviation", "0 0");
                    blurFilter.appendChild(feGaussianFilter);
                    defs.appendChild(blurFilter);
                    Filters._svgBlurFilter = feGaussianFilter;
                    // Drop Shadow Filter
                    var dropShadowFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
                    dropShadowFilter.setAttribute("id", "svgDropShadowFilter");
                    var feGaussianFilter = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
                    feGaussianFilter.setAttribute("in", "SourceAlpha");
                    feGaussianFilter.setAttribute("stdDeviation", "3");
                    dropShadowFilter.appendChild(feGaussianFilter);
                    Filters._svgDropshadowFilterBlur = feGaussianFilter;
                    var feOffset = document.createElementNS("http://www.w3.org/2000/svg", "feOffset");
                    feOffset.setAttribute("dx", "0");
                    feOffset.setAttribute("dy", "0");
                    feOffset.setAttribute("result", "offsetblur");
                    dropShadowFilter.appendChild(feOffset);
                    Filters._svgDropshadowFilterOffset = feOffset;
                    var feFlood = document.createElementNS("http://www.w3.org/2000/svg", "feFlood");
                    feFlood.setAttribute("flood-color", "rgba(0,0,0,1)");
                    dropShadowFilter.appendChild(feFlood);
                    Filters._svgDropshadowFilterFlood = feFlood;
                    var feComposite = document.createElementNS("http://www.w3.org/2000/svg", "feComposite");
                    feComposite.setAttribute("in2", "offsetblur");
                    feComposite.setAttribute("operator", "in");
                    dropShadowFilter.appendChild(feComposite);
                    var feMerge = document.createElementNS("http://www.w3.org/2000/svg", "feMerge");
                    var feMergeNode = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
                    feMerge.appendChild(feMergeNode);
                    var feMergeNode = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
                    feMergeNode.setAttribute("in", "SourceGraphic");
                    feMerge.appendChild(feMergeNode);
                    dropShadowFilter.appendChild(feMerge);
                    defs.appendChild(dropShadowFilter);
                    var colorMatrixFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
                    colorMatrixFilter.setAttribute("id", "svgColorMatrixFilter");
                    var feColorMatrix = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
                    // Color interpolation in linear RGB doesn't seem to match Flash's results.
                    feColorMatrix.setAttribute("color-interpolation-filters", "sRGB");
                    feColorMatrix.setAttribute("in", "SourceGraphic");
                    feColorMatrix.setAttribute("type", "matrix");
                    colorMatrixFilter.appendChild(feColorMatrix);
                    defs.appendChild(colorMatrixFilter);
                    Filters._svgColorMatrixFilter = feColorMatrix;
                    svg.appendChild(defs);
                    document.documentElement.appendChild(svg);
                };
                Filters._applyColorMatrixFilter = function (context, colorMatrix) {
                    Filters._prepareSVGFilters();
                    Filters._svgColorMatrixFilter.setAttribute("values", colorMatrix.toSVGFilterMatrix());
                    context.filter = "url(#svgColorMatrixFilter)";
                };
                /**
                 * This doesn't currently allow you to specify multiple filters. Only the last one is used.
                 * To support multiple filters, we need to group them in SVG nodes.
                 */
                Filters._applyFilters = function (ratio, context, filters) {
                    Filters._prepareSVGFilters();
                    Filters._removeFilters(context);
                    var scale = ratio;
                    /**
                     * Scale blur radius for each quality level. The scale constants were gathered
                     * experimentally.
                     */
                    function getBlurScale(quality) {
                        var blurScale = ratio / 2; // For some reason we always have to scale by 1/2 first.
                        switch (quality) {
                            case 0:
                                return 0;
                            case 1:
                                return blurScale / 2.7;
                            case 2:
                                return blurScale / 1.28;
                            case 3:
                            default:
                                return blurScale;
                        }
                    }
                    for (var i = 0; i < filters.length; i++) {
                        var filter = filters[i];
                        if (filter instanceof GFX.BlurFilter) {
                            var blurFilter = filter;
                            var blurScale = getBlurScale(blurFilter.quality);
                            Filters._svgBlurFilter.setAttribute("stdDeviation", blurFilter.blurX * blurScale + " " + blurFilter.blurY * blurScale);
                            context.filter = "url(#svgBlurFilter)";
                        }
                        else if (filter instanceof GFX.DropshadowFilter) {
                            var dropshadowFilter = filter;
                            var blurScale = getBlurScale(dropshadowFilter.quality);
                            Filters._svgDropshadowFilterBlur.setAttribute("stdDeviation", dropshadowFilter.blurX * blurScale + " " + dropshadowFilter.blurY * blurScale);
                            Filters._svgDropshadowFilterOffset.setAttribute("dx", String(Math.cos(dropshadowFilter.angle * Math.PI / 180) * dropshadowFilter.distance * scale));
                            Filters._svgDropshadowFilterOffset.setAttribute("dy", String(Math.sin(dropshadowFilter.angle * Math.PI / 180) * dropshadowFilter.distance * scale));
                            Filters._svgDropshadowFilterFlood.setAttribute("flood-color", Shumway.ColorUtilities.rgbaToCSSStyle(((dropshadowFilter.color << 8) | Math.round(255 * dropshadowFilter.alpha))));
                            context.filter = "url(#svgDropShadowFilter)";
                        }
                    }
                };
                Filters._removeFilters = function (context) {
                    // For some reason, setting this to the default empty string "" does
                    // not work, it expects "none".
                    context.filter = "none";
                };
                Filters._applyColorMatrix = function (context, colorMatrix) {
                    Filters._removeFilters(context);
                    if (colorMatrix.isIdentity()) {
                        context.globalAlpha = 1;
                        context.globalColorMatrix = null;
                    }
                    else if (colorMatrix.hasOnlyAlphaMultiplier()) {
                        context.globalAlpha = clamp(colorMatrix.alphaMultiplier, 0, 1);
                        context.globalColorMatrix = null;
                    }
                    else {
                        context.globalAlpha = 1;
                        if (Filters._svgFiltersAreSupported && true) {
                            Filters._applyColorMatrixFilter(context, colorMatrix);
                            context.globalColorMatrix = null;
                        }
                        else {
                            context.globalColorMatrix = colorMatrix;
                        }
                    }
                };
                Filters._svgFiltersAreSupported = !!Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, "filter");
                return Filters;
            })();
            Canvas2D.Filters = Filters;
            /**
             * Match up FLash blend modes with Canvas blend operations:
             *
             * See: http://kaourantin.net/2005/09/some-word-on-blend-modes-in-flash.html
             */
            function getCompositeOperation(blendMode) {
                // TODO:
                // These Flash blend modes have no canvas equivalent:
                // - BlendMode.Subtract
                // - BlendMode.Invert
                // - BlendMode.Shader
                // - BlendMode.Add is similar to BlendMode.Screen
                // These blend modes are actually Porter-Duff compositing operators.
                // The backdrop is the nearest parent with blendMode set to layer.
                // When there is no LAYER parent, they are ignored (treated as NORMAL).
                // - BlendMode.Alpha (destination-in)
                // - BlendMode.Erase (destination-out)
                // - BlendMode.Layer [defines backdrop]
                var compositeOp = "source-over";
                switch (blendMode) {
                    case 1 /* Normal */:
                    case 2 /* Layer */:
                        return compositeOp;
                    case 3 /* Multiply */:
                        compositeOp = "multiply";
                        break;
                    case 8 /* Add */:
                    case 4 /* Screen */:
                        compositeOp = "screen";
                        break;
                    case 5 /* Lighten */:
                        compositeOp = "lighten";
                        break;
                    case 6 /* Darken */:
                        compositeOp = "darken";
                        break;
                    case 7 /* Difference */:
                        compositeOp = "difference";
                        break;
                    case 13 /* Overlay */:
                        compositeOp = "overlay";
                        break;
                    case 14 /* HardLight */:
                        compositeOp = "hard-light";
                        break;
                    case 11 /* Alpha */:
                        compositeOp = "destination-in";
                        break;
                    case 12 /* Erase */:
                        compositeOp = "destination-out";
                        break;
                    default:
                        Shumway.Debug.somewhatImplemented("Blend Mode: " + GFX.BlendMode[blendMode]);
                }
                return compositeOp;
            }
            /**
             * Clip target? Some blend modes like destination-in that affect all target pixels are very slow otherwise.
             */
            function blendModeShouldClip(blendMode) {
                switch (blendMode) {
                    case 11 /* Alpha */:
                        return true;
                    default:
                        return false;
                }
            }
            var Canvas2DSurfaceRegion = (function () {
                function Canvas2DSurfaceRegion(surface, region, w, h) {
                    this.surface = surface;
                    this.region = region;
                    this.w = w;
                    this.h = h;
                    // ...
                }
                Canvas2DSurfaceRegion.prototype.free = function () {
                    this.surface.free(this);
                };
                Canvas2DSurfaceRegion._ensureCopyCanvasSize = function (w, h) {
                    var canvas;
                    if (!Canvas2DSurfaceRegion._copyCanvasContext) {
                        canvas = document.createElement("canvas");
                        if (typeof registerScratchCanvas !== "undefined") {
                            registerScratchCanvas(canvas);
                        }
                        canvas.width = 512;
                        canvas.height = 512;
                        Canvas2DSurfaceRegion._copyCanvasContext = canvas.getContext("2d");
                    }
                    else {
                        canvas = Canvas2DSurfaceRegion._copyCanvasContext.canvas;
                        if (canvas.width < w || canvas.height < h) {
                            canvas.width = Shumway.IntegerUtilities.nearestPowerOfTwo(w);
                            canvas.height = Shumway.IntegerUtilities.nearestPowerOfTwo(h);
                        }
                    }
                };
                Canvas2DSurfaceRegion.prototype.draw = function (source, x, y, w, h, blendMode) {
                    this.context.setTransform(1, 0, 0, 1, 0, 0);
                    var sourceCanvas, sx = 0, sy = 0;
                    // Handle copying from and to the same canvas.
                    if (source.context.canvas === this.context.canvas) {
                        Canvas2DSurfaceRegion._ensureCopyCanvasSize(w, h);
                        var copyContext = Canvas2DSurfaceRegion._copyCanvasContext;
                        copyContext.clearRect(0, 0, w, h);
                        copyContext.drawImage(source.surface.canvas, source.region.x, source.region.y, w, h, 0, 0, w, h);
                        sourceCanvas = copyContext.canvas;
                        sx = 0;
                        sy = 0;
                    }
                    else {
                        sourceCanvas = source.surface.canvas;
                        sx = source.region.x;
                        sy = source.region.y;
                    }
                    var canvas = this.context.canvas;
                    var clip = blendModeShouldClip(blendMode);
                    if (clip) {
                        this.context.save();
                        this.context.beginPath();
                        this.context.rect(x, y, w, h);
                        this.context.clip();
                    }
                    this.context.globalCompositeOperation = getCompositeOperation(blendMode);
                    this.context.drawImage(sourceCanvas, sx, sy, w, h, x, y, w, h);
                    this.context.globalCompositeOperation = getCompositeOperation(1 /* Normal */);
                    if (clip) {
                        this.context.restore();
                    }
                };
                Object.defineProperty(Canvas2DSurfaceRegion.prototype, "context", {
                    get: function () {
                        return this.surface.context;
                    },
                    enumerable: true,
                    configurable: true
                });
                Canvas2DSurfaceRegion.prototype.resetTransform = function () {
                    this.surface.context.setTransform(1, 0, 0, 1, 0, 0);
                };
                Canvas2DSurfaceRegion.prototype.reset = function () {
                    var context = this.surface.context;
                    context.setTransform(1, 0, 0, 1, 0, 0);
                    context.fillStyle = null;
                    context.strokeStyle = null;
                    context.globalAlpha = 1;
                    context.globalColorMatrix = null;
                    context.globalCompositeOperation = getCompositeOperation(1 /* Normal */);
                };
                Canvas2DSurfaceRegion.prototype.fill = function (fillStyle) {
                    var context = this.surface.context, region = this.region;
                    context.fillStyle = fillStyle;
                    context.fillRect(region.x, region.y, region.w, region.h);
                };
                Canvas2DSurfaceRegion.prototype.clear = function (rectangle) {
                    var context = this.surface.context, region = this.region;
                    if (!rectangle) {
                        rectangle = region;
                    }
                    context.clearRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
                };
                return Canvas2DSurfaceRegion;
            })();
            Canvas2D.Canvas2DSurfaceRegion = Canvas2DSurfaceRegion;
            var Canvas2DSurface = (function () {
                function Canvas2DSurface(canvas, regionAllocator) {
                    this.canvas = canvas;
                    this.context = canvas.getContext("2d");
                    this.w = canvas.width;
                    this.h = canvas.height;
                    this._regionAllocator = regionAllocator;
                }
                Canvas2DSurface.prototype.allocate = function (w, h) {
                    var region = this._regionAllocator.allocate(w, h);
                    if (region) {
                        return new Canvas2DSurfaceRegion(this, region, w, h);
                    }
                    return null;
                };
                Canvas2DSurface.prototype.free = function (surfaceRegion) {
                    this._regionAllocator.free(surfaceRegion.region);
                };
                return Canvas2DSurface;
            })();
            Canvas2D.Canvas2DSurface = Canvas2DSurface;
        })(Canvas2D = GFX.Canvas2D || (GFX.Canvas2D = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Canvas2D;
        (function (Canvas2D) {
            var assert = Shumway.Debug.assert;
            var Rectangle = Shumway.GFX.Geometry.Rectangle;
            var Point = Shumway.GFX.Geometry.Point;
            var Matrix = Shumway.GFX.Geometry.Matrix;
            var BlendMode = Shumway.GFX.BlendMode;
            var clamp = Shumway.NumberUtilities.clamp;
            var pow2 = Shumway.NumberUtilities.pow2;
            var writer = null; // new IndentingWriter(false, dumpLine);
            var MIN_CACHE_LEVELS = 5;
            var MAX_CACHE_LEVELS = 3;
            var MipMapLevel = (function () {
                function MipMapLevel(surfaceRegion, scale) {
                    this.surfaceRegion = surfaceRegion;
                    this.scale = scale;
                    // ...
                }
                return MipMapLevel;
            })();
            Canvas2D.MipMapLevel = MipMapLevel;
            var MipMap = (function () {
                function MipMap(renderer, node, surfaceRegionAllocator, size) {
                    this._node = node;
                    this._levels = [];
                    this._surfaceRegionAllocator = surfaceRegionAllocator;
                    this._size = size;
                    this._renderer = renderer;
                }
                MipMap.prototype.getLevel = function (matrix) {
                    var matrixScale = Math.max(matrix.getAbsoluteScaleX(), matrix.getAbsoluteScaleY());
                    var level = 0;
                    if (matrixScale !== 1) {
                        level = clamp(Math.round(Math.log(matrixScale) / Math.LN2), -MIN_CACHE_LEVELS, MAX_CACHE_LEVELS);
                    }
                    if (!(this._node.hasFlags(2097152 /* Scalable */))) {
                        level = clamp(level, -MIN_CACHE_LEVELS, 0);
                    }
                    var scale = pow2(level);
                    var levelIndex = MIN_CACHE_LEVELS + level;
                    var mipLevel = this._levels[levelIndex];
                    if (!mipLevel) {
                        var bounds = this._node.getBounds();
                        var scaledBounds = bounds.clone();
                        scaledBounds.scale(scale, scale);
                        scaledBounds.snap();
                        var surfaceRegion = this._surfaceRegionAllocator.allocate(scaledBounds.w, scaledBounds.h, null);
                        // surfaceRegion.fill(ColorStyle.randomStyle());
                        var region = surfaceRegion.region;
                        mipLevel = this._levels[levelIndex] = new MipMapLevel(surfaceRegion, scale);
                        var surface = (mipLevel.surfaceRegion.surface);
                        var context = surface.context;
                        //        context.save();
                        //        context.beginPath();
                        //        context.rect(region.x, region.y, region.w, region.h);
                        //        context.clip();
                        //        context.setTransform(scale, 0, 0, scale, region.x - scaledBounds.x, region.y - scaledBounds.y);
                        var state = new RenderState(surfaceRegion);
                        state.clip.set(region);
                        state.matrix.setElements(scale, 0, 0, scale, region.x - scaledBounds.x, region.y - scaledBounds.y);
                        state.flags |= 64 /* IgnoreNextRenderWithCache */;
                        this._renderer.renderNodeWithState(this._node, state);
                        state.free();
                    }
                    return mipLevel;
                };
                return MipMap;
            })();
            Canvas2D.MipMap = MipMap;
            (function (FillRule) {
                FillRule[FillRule["NonZero"] = 0] = "NonZero";
                FillRule[FillRule["EvenOdd"] = 1] = "EvenOdd";
            })(Canvas2D.FillRule || (Canvas2D.FillRule = {}));
            var FillRule = Canvas2D.FillRule;
            var Canvas2DRendererOptions = (function (_super) {
                __extends(Canvas2DRendererOptions, _super);
                function Canvas2DRendererOptions() {
                    _super.apply(this, arguments);
                    /**
                     * Whether to force snapping matrices to device pixels.
                     */
                    this.snapToDevicePixels = true;
                    /**
                     * Whether to force image smoothing when drawing images.
                     */
                    this.imageSmoothing = true;
                    /**
                     * Whether to enable blending.
                     */
                    this.blending = true;
                    /**
                     * Whether to enable debugging of layers.
                     */
                    this.debugLayers = false;
                    /**
                     * Whether to enable masking.
                     */
                    this.masking = true;
                    /**
                     * Whether to enable filters.
                     */
                    this.filters = true;
                    /**
                     * Whether to cache shapes as images.
                     */
                    this.cacheShapes = false;
                    /**
                     * Shapes above this size are not cached.
                     */
                    this.cacheShapesMaxSize = 256;
                    /**
                     * Number of times a shape is rendered before it's elligible for caching.
                     */
                    this.cacheShapesThreshold = 16;
                    /**
                     * Enables alpha layer for the canvas context.
                     */
                    this.alpha = false;
                }
                return Canvas2DRendererOptions;
            })(GFX.RendererOptions);
            Canvas2D.Canvas2DRendererOptions = Canvas2DRendererOptions;
            (function (RenderFlags) {
                RenderFlags[RenderFlags["None"] = 0x0000] = "None";
                RenderFlags[RenderFlags["IgnoreNextLayer"] = 0x0001] = "IgnoreNextLayer";
                RenderFlags[RenderFlags["RenderMask"] = 0x0002] = "RenderMask";
                RenderFlags[RenderFlags["IgnoreMask"] = 0x0004] = "IgnoreMask";
                RenderFlags[RenderFlags["PaintStencil"] = 0x0008] = "PaintStencil";
                RenderFlags[RenderFlags["PaintClip"] = 0x0010] = "PaintClip";
                RenderFlags[RenderFlags["IgnoreRenderable"] = 0x0020] = "IgnoreRenderable";
                RenderFlags[RenderFlags["IgnoreNextRenderWithCache"] = 0x0040] = "IgnoreNextRenderWithCache";
                RenderFlags[RenderFlags["CacheShapes"] = 0x0100] = "CacheShapes";
                RenderFlags[RenderFlags["PaintFlashing"] = 0x0200] = "PaintFlashing";
                RenderFlags[RenderFlags["PaintBounds"] = 0x0400] = "PaintBounds";
                RenderFlags[RenderFlags["PaintDirtyRegion"] = 0x0800] = "PaintDirtyRegion";
                RenderFlags[RenderFlags["ImageSmoothing"] = 0x1000] = "ImageSmoothing";
                RenderFlags[RenderFlags["PixelSnapping"] = 0x2000] = "PixelSnapping";
            })(Canvas2D.RenderFlags || (Canvas2D.RenderFlags = {}));
            var RenderFlags = Canvas2D.RenderFlags;
            var MAX_VIEWPORT = Rectangle.createMaxI16();
            /**
             * Render state.
             */
            var RenderState = (function (_super) {
                __extends(RenderState, _super);
                function RenderState(target) {
                    _super.call(this);
                    this.clip = Rectangle.createEmpty();
                    this.clipList = [];
                    this.clipPath = null;
                    this.flags = 0 /* None */;
                    this.target = null;
                    this.matrix = Matrix.createIdentity();
                    this.colorMatrix = GFX.ColorMatrix.createIdentity();
                    this.filters = [];
                    RenderState.allocationCount++;
                    this.target = target;
                }
                RenderState.prototype.set = function (state) {
                    this.clip.set(state.clip);
                    this.clipPath = state.clipPath;
                    this.target = state.target;
                    this.matrix.set(state.matrix);
                    this.colorMatrix.set(state.colorMatrix);
                    this.flags = state.flags;
                    this.filters.length = 0;
                    this.filters.push.apply(this.filters, state.filters);
                    Shumway.ArrayUtilities.copyFrom(this.clipList, state.clipList);
                };
                RenderState.prototype.clone = function () {
                    var state = RenderState.allocate();
                    if (!state) {
                        state = new RenderState(this.target);
                    }
                    state.set(this);
                    return state;
                };
                RenderState.allocate = function () {
                    var dirtyStack = RenderState._dirtyStack;
                    var state = null;
                    if (dirtyStack.length) {
                        state = dirtyStack.pop();
                    }
                    return state;
                };
                RenderState.prototype.free = function () {
                    this.clipPath = null;
                    RenderState._dirtyStack.push(this);
                };
                RenderState.prototype.transform = function (transform) {
                    var state = this.clone();
                    state.matrix.preMultiply(transform.getMatrix());
                    if (transform.hasColorMatrix()) {
                        state.colorMatrix.multiply(transform.getColorMatrix());
                    }
                    return state;
                };
                RenderState.prototype.hasFlags = function (flags) {
                    return (this.flags & flags) === flags;
                };
                RenderState.prototype.removeFlags = function (flags) {
                    this.flags &= ~flags;
                };
                RenderState.prototype.toggleFlags = function (flags, on) {
                    if (on) {
                        this.flags |= flags;
                    }
                    else {
                        this.flags &= ~flags;
                    }
                };
                RenderState.prototype.beginClipPath = function (transform) {
                    this.target.context.save();
                    this.clipPath = new Path2D();
                };
                RenderState.prototype.applyClipPath = function () {
                    var context = this.target.context;
                    // Coords in clipPath are defined in global space, so have to reset the current transform, ...
                    context.setTransform(1, 0, 0, 1, 0, 0);
                    // ... apply the clip ...
                    context.clip(this.clipPath);
                    // ... and finally restore the current transform.
                    var matrix = this.matrix;
                    context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
                };
                RenderState.prototype.closeClipPath = function () {
                    this.target.context.restore();
                };
                RenderState.allocationCount = 0;
                RenderState._dirtyStack = [];
                return RenderState;
            })(GFX.State);
            Canvas2D.RenderState = RenderState;
            /**
             * Stats for each rendered frame.
             */
            var FrameInfo = (function () {
                function FrameInfo() {
                    this._count = 0;
                    this.shapes = 0;
                    this.groups = 0;
                    this.culledNodes = 0;
                }
                FrameInfo.prototype.enter = function (state) {
                    Shumway.GFX.enterTimeline("Frame", { frame: this._count });
                    this._count++;
                    if (!writer) {
                        return;
                    }
                    writer.enter("> Frame: " + this._count);
                    this._enterTime = performance.now();
                    this.shapes = 0;
                    this.groups = 0;
                    this.culledNodes = 0;
                };
                FrameInfo.prototype.leave = function () {
                    Shumway.GFX.leaveTimeline("Frame");
                    if (!writer) {
                        return;
                    }
                    writer.writeLn("Shapes: " + this.shapes + ", Groups: " + this.groups + ", Culled Nodes: " + this.culledNodes);
                    writer.writeLn("Elapsed: " + (performance.now() - this._enterTime).toFixed(2));
                    writer.writeLn("Rectangle: " + Rectangle.allocationCount + ", Matrix: " + Matrix.allocationCount + ", State: " + RenderState.allocationCount);
                    writer.leave("<");
                };
                return FrameInfo;
            })();
            Canvas2D.FrameInfo = FrameInfo;
            var Canvas2DRenderer = (function (_super) {
                __extends(Canvas2DRenderer, _super);
                function Canvas2DRenderer(container, stage, options) {
                    if (options === void 0) { options = new Canvas2DRendererOptions(); }
                    _super.call(this, container, stage, options);
                    this._visited = 0;
                    this._frameInfo = new FrameInfo();
                    this._fontSize = 0;
                    /**
                     * Stack of rendering layers. Stage video lives at the bottom of this stack.
                     */
                    this._layers = [];
                    if (container instanceof HTMLCanvasElement) {
                        var canvas = container;
                        this._viewport = new Rectangle(0, 0, canvas.width, canvas.height);
                        this._target = this._createTarget(canvas);
                    }
                    else {
                        this._addLayer("Background Layer");
                        var canvasLayer = this._addLayer("Canvas Layer");
                        var canvas = document.createElement("canvas");
                        canvasLayer.appendChild(canvas);
                        this._viewport = new Rectangle(0, 0, container.scrollWidth, container.scrollHeight);
                        var self = this;
                        stage.addEventListener(1 /* OnStageBoundsChanged */, function () {
                            self._onStageBoundsChanged(canvas);
                        });
                        this._onStageBoundsChanged(canvas);
                    }
                    Canvas2DRenderer._prepareSurfaceAllocators();
                }
                Canvas2DRenderer.prototype._addLayer = function (name) {
                    var div = document.createElement("div");
                    div.style.position = "absolute";
                    div.style.overflow = "hidden";
                    div.style.width = "100%";
                    div.style.height = "100%";
                    div.style.zIndex = this._layers.length + '';
                    this._container.appendChild(div);
                    this._layers.push(div);
                    return div;
                };
                Object.defineProperty(Canvas2DRenderer.prototype, "_backgroundVideoLayer", {
                    get: function () {
                        return this._layers[0];
                    },
                    enumerable: true,
                    configurable: true
                });
                Canvas2DRenderer.prototype._createTarget = function (canvas) {
                    return new Canvas2D.Canvas2DSurfaceRegion(new Canvas2D.Canvas2DSurface(canvas), new GFX.RegionAllocator.Region(0, 0, canvas.width, canvas.height), canvas.width, canvas.height);
                };
                /**
                 * If the stage bounds have changed, we have to resize all of our layers, canvases and more ...
                 */
                Canvas2DRenderer.prototype._onStageBoundsChanged = function (canvas) {
                    var stageBounds = this._stage.getBounds(true);
                    stageBounds.snap();
                    var ratio = this._devicePixelRatio = window.devicePixelRatio || 1;
                    var w = (stageBounds.w / ratio) + 'px';
                    var h = (stageBounds.h / ratio) + 'px';
                    for (var i = 0; i < this._layers.length; i++) {
                        var layer = this._layers[i];
                        layer.style.width = w;
                        layer.style.height = h;
                    }
                    canvas.width = stageBounds.w;
                    canvas.height = stageBounds.h;
                    canvas.style.position = "absolute";
                    canvas.style.width = w;
                    canvas.style.height = h;
                    this._target = this._createTarget(canvas);
                    this._fontSize = 10 * this._devicePixelRatio;
                };
                Canvas2DRenderer._prepareSurfaceAllocators = function () {
                    if (Canvas2DRenderer._initializedCaches) {
                        return;
                    }
                    var minSurfaceSize = 1024;
                    Canvas2DRenderer._surfaceCache = new GFX.SurfaceRegionAllocator.SimpleAllocator(function (w, h) {
                        var canvas = document.createElement("canvas");
                        if (typeof registerScratchCanvas !== "undefined") {
                            registerScratchCanvas(canvas);
                        }
                        // Surface caches are at least this size.
                        var W = Math.max(minSurfaceSize, w);
                        var H = Math.max(minSurfaceSize, h);
                        canvas.width = W;
                        canvas.height = H;
                        var allocator = null;
                        if (w >= 1024 / 2 || h >= 1024 / 2) {
                            // The requested size is very large, so create a single grid allocator
                            // with there requested size. This will only hold one image.
                            allocator = new GFX.RegionAllocator.GridAllocator(W, H, W, H);
                        }
                        else {
                            allocator = new GFX.RegionAllocator.BucketAllocator(W, H);
                        }
                        return new Canvas2D.Canvas2DSurface(canvas, allocator);
                    });
                    Canvas2DRenderer._shapeCache = new GFX.SurfaceRegionAllocator.SimpleAllocator(function (w, h) {
                        var canvas = document.createElement("canvas");
                        if (typeof registerScratchCanvas !== "undefined") {
                            registerScratchCanvas(canvas);
                        }
                        var W = minSurfaceSize, H = minSurfaceSize;
                        canvas.width = W;
                        canvas.height = H;
                        // Shape caches can be compact since regions are never freed explicitly.
                        var allocator = allocator = new GFX.RegionAllocator.CompactAllocator(W, H);
                        return new Canvas2D.Canvas2DSurface(canvas, allocator);
                    });
                    Canvas2DRenderer._initializedCaches = true;
                };
                /**
                 * Main render function.
                 */
                Canvas2DRenderer.prototype.render = function () {
                    var stage = this._stage;
                    var target = this._target;
                    var options = this._options;
                    var viewport = this._viewport;
                    // stage.visit(new TracingNodeVisitor(new IndentingWriter()), null);
                    target.reset();
                    target.context.save();
                    target.context.beginPath();
                    target.context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
                    target.context.clip();
                    this._renderStageToTarget(target, stage, viewport);
                    target.reset();
                    if (options.paintViewport) {
                        target.context.beginPath();
                        target.context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
                        target.context.strokeStyle = "#FF4981";
                        target.context.lineWidth = 2;
                        target.context.stroke();
                    }
                    target.context.restore();
                };
                Canvas2DRenderer.prototype.renderNode = function (node, clip, matrix) {
                    var state = new RenderState(this._target);
                    state.clip.set(clip);
                    state.flags = 256 /* CacheShapes */;
                    state.matrix.set(matrix);
                    node.visit(this, state);
                    state.free();
                };
                Canvas2DRenderer.prototype.renderNodeWithState = function (node, state) {
                    node.visit(this, state);
                };
                Canvas2DRenderer.prototype._renderWithCache = function (node, state) {
                    var matrix = state.matrix;
                    var bounds = node.getBounds();
                    if (bounds.isEmpty()) {
                        return false;
                    }
                    var cacheShapesMaxSize = this._options.cacheShapesMaxSize;
                    var matrixScale = Math.max(matrix.getAbsoluteScaleX(), matrix.getAbsoluteScaleY());
                    var renderCount = 100;
                    var paintClip = !!(state.flags & 16 /* PaintClip */);
                    var paintStencil = !!(state.flags & 8 /* PaintStencil */);
                    var paintFlashing = !!(state.flags & 512 /* PaintFlashing */);
                    if (!state.hasFlags(256 /* CacheShapes */)) {
                        return;
                    }
                    if (paintStencil || paintClip || !state.colorMatrix.isIdentity() || node.hasFlags(1048576 /* Dynamic */)) {
                        return false;
                    }
                    if (renderCount < this._options.cacheShapesThreshold || bounds.w * matrixScale > cacheShapesMaxSize || bounds.h * matrixScale > cacheShapesMaxSize) {
                        return false;
                    }
                    var mipMap = node.properties["mipMap"];
                    if (!mipMap) {
                        mipMap = node.properties["mipMap"] = new MipMap(this, node, Canvas2DRenderer._shapeCache, cacheShapesMaxSize);
                    }
                    var mipMapLevel = mipMap.getLevel(matrix);
                    var mipMapLevelSurfaceRegion = (mipMapLevel.surfaceRegion);
                    var region = mipMapLevelSurfaceRegion.region;
                    if (mipMapLevel) {
                        var context = state.target.context;
                        context.imageSmoothingEnabled = context.mozImageSmoothingEnabled = true;
                        context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
                        context.drawImage(mipMapLevelSurfaceRegion.surface.canvas, region.x, region.y, region.w, region.h, bounds.x, bounds.y, bounds.w, bounds.h);
                        return true;
                    }
                    return false;
                };
                Canvas2DRenderer.prototype._intersectsClipList = function (node, state) {
                    var boundsAABB = node.getBounds(true);
                    var intersects = false;
                    state.matrix.transformRectangleAABB(boundsAABB);
                    if (state.clip.intersects(boundsAABB)) {
                        intersects = true;
                    }
                    var list = state.clipList;
                    if (intersects && list.length) {
                        intersects = false;
                        for (var i = 0; i < list.length; i++) {
                            if (boundsAABB.intersects(list[i])) {
                                intersects = true;
                                break;
                            }
                        }
                    }
                    boundsAABB.free();
                    return intersects;
                };
                Canvas2DRenderer.prototype.visitGroup = function (node, state) {
                    this._frameInfo.groups++;
                    var bounds = node.getBounds();
                    if (node.hasFlags(4 /* IsMask */) && !(state.flags & 4 /* IgnoreMask */)) {
                        return;
                    }
                    if (!node.hasFlags(65536 /* Visible */)) {
                        return;
                    }
                    var filters = node.getLayer().filters;
                    if (filters) {
                        state.filters.push.apply(state.filters, filters);
                    }
                    if (!(state.flags & 1 /* IgnoreNextLayer */) && (node.getLayer().blendMode !== 1 /* Normal */ || node.getLayer().mask) && this._options.blending) {
                        state = state.clone();
                        state.flags |= 1 /* IgnoreNextLayer */;
                        this._renderLayer(node, state);
                        state.free();
                    }
                    else {
                        if (this._intersectsClipList(node, state)) {
                            var clips = null;
                            var children = node.getChildren();
                            for (var i = 0; i < children.length; i++) {
                                var child = children[i];
                                var transform = child.getTransform();
                                var childState = state.transform(transform);
                                childState.toggleFlags(4096 /* ImageSmoothing */, child.hasFlags(524288 /* ImageSmoothing */));
                                if (child.clip >= 0) {
                                    clips = clips || new Uint8Array(children.length); // MEMORY: Don't allocate here.
                                    clips[child.clip + i]++;
                                    var clipState = childState.clone();
                                    /*
                                     * We can't cull the clip because clips outside of the viewport still need to act
                                     * as clipping masks. For now we just expand the cull bounds, but a better approach
                                     * would be to cull the clipped nodes and skip creating the clipping region
                                     * alltogether. For this we would need to keep track of the bounds of the current
                                     * clipping region.
                                     */
                                    // clipState.clip.set(MAX_VIEWPORT);
                                    clipState.flags |= 16 /* PaintClip */;
                                    clipState.beginClipPath(transform.getMatrix());
                                    child.visit(this, clipState);
                                    clipState.applyClipPath();
                                    clipState.free();
                                }
                                else {
                                    child.visit(this, childState);
                                }
                                if (clips && clips[i] > 0) {
                                    while (clips[i]--) {
                                        state.closeClipPath();
                                    }
                                }
                                childState.free();
                            }
                        }
                        else {
                            this._frameInfo.culledNodes++;
                        }
                    }
                    this._renderDebugInfo(node, state);
                };
                Canvas2DRenderer.prototype._renderDebugInfo = function (node, state) {
                    if (!(state.flags & 1024 /* PaintBounds */)) {
                        return;
                    }
                    var context = state.target.context;
                    var bounds = node.getBounds(true);
                    var style = node.properties["style"];
                    if (!style) {
                        style = node.properties["style"] = Shumway.Color.randomColor(0.4).toCSSStyle();
                    }
                    context.strokeStyle = style;
                    state.matrix.transformRectangleAABB(bounds);
                    context.setTransform(1, 0, 0, 1, 0, 0);
                    var drawDetails = false;
                    if (drawDetails && bounds.w > 32 && bounds.h > 32) {
                        context.textAlign = "center";
                        context.textBaseline = "middle";
                        context.font = this._fontSize + "px Arial";
                        var debugText = "" + node.id;
                        context.fillText(debugText, bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
                    }
                    bounds.free();
                    var matrix = state.matrix;
                    bounds = node.getBounds();
                    var p = Canvas2DRenderer._debugPoints;
                    state.matrix.transformRectangle(bounds, p);
                    // Doing it this way is a lot faster than strokeRect.
                    context.lineWidth = 1;
                    context.beginPath();
                    context.moveTo(p[0].x, p[0].y);
                    context.lineTo(p[1].x, p[1].y);
                    context.lineTo(p[2].x, p[2].y);
                    context.lineTo(p[3].x, p[3].y);
                    context.lineTo(p[0].x, p[0].y);
                    context.stroke();
                };
                Canvas2DRenderer.prototype.visitStage = function (node, state) {
                    var context = state.target.context;
                    var bounds = node.getBounds(true);
                    state.matrix.transformRectangleAABB(bounds);
                    bounds.intersect(state.clip);
                    state.target.reset();
                    state = state.clone();
                    if (false && node.dirtyRegion) {
                        state.clipList.length = 0;
                        node.dirtyRegion.gatherOptimizedRegions(state.clipList);
                        context.save();
                        if (state.clipList.length) {
                            context.beginPath();
                            for (var i = 0; i < state.clipList.length; i++) {
                                var clip = state.clipList[i];
                                context.rect(clip.x, clip.y, clip.w, clip.h);
                            }
                            context.clip();
                        }
                        else {
                            context.restore();
                            state.free();
                            return;
                        }
                    }
                    if (this._options.clear) {
                        state.target.clear(state.clip);
                    }
                    // Fill background
                    if (!node.hasFlags(32768 /* Transparent */) && node.color) {
                        if (!(state.flags & 32 /* IgnoreRenderable */)) {
                            this._container.style.backgroundColor = node.color.toCSSStyle();
                        }
                    }
                    this.visitGroup(node, state);
                    if (node.dirtyRegion) {
                        context.restore();
                        state.target.reset();
                        context.globalAlpha = 0.4;
                        if (state.hasFlags(2048 /* PaintDirtyRegion */)) {
                            node.dirtyRegion.render(state.target.context);
                        }
                        node.dirtyRegion.clear();
                    }
                    state.free();
                };
                Canvas2DRenderer.prototype.visitShape = function (node, state) {
                    if (!this._intersectsClipList(node, state)) {
                        return;
                    }
                    var matrix = state.matrix;
                    if (state.flags & 8192 /* PixelSnapping */) {
                        matrix = matrix.clone();
                        matrix.snap();
                    }
                    var context = state.target.context;
                    Canvas2D.Filters._applyColorMatrix(context, state.colorMatrix);
                    if (Canvas2D.Filters._svgFiltersAreSupported && GFX.filters.value) {
                        Canvas2D.Filters._applyFilters(this._devicePixelRatio, context, state.filters);
                    }
                    // Only paint if it is visible.
                    if (node.source instanceof GFX.RenderableVideo) {
                        this.visitRenderableVideo(node.source, state);
                    }
                    else if (context.globalAlpha > 0) {
                        this.visitRenderable(node.source, state, node.ratio);
                    }
                    if (state.flags & 8192 /* PixelSnapping */) {
                        matrix.free();
                    }
                };
                /**
                 * We don't actually draw the video like normal renderables, although we could.
                 * Instead, we add the video element underneeth the canvas at layer zero and set
                 * the appropriate css transform to move it into place.
                 */
                Canvas2DRenderer.prototype.visitRenderableVideo = function (node, state) {
                    if (!node.video || !node.video.videoWidth) {
                        return; // video is not ready
                    }
                    var ratio = this._devicePixelRatio;
                    var matrix = state.matrix.clone();
                    matrix.scale(1 / ratio, 1 / ratio);
                    var bounds = node.getBounds();
                    var videoMatrix = Shumway.GFX.Geometry.Matrix.createIdentity();
                    videoMatrix.scale(bounds.w / node.video.videoWidth, bounds.h / node.video.videoHeight);
                    matrix.preMultiply(videoMatrix);
                    videoMatrix.free();
                    var cssTransform = matrix.toCSSTransform();
                    node.video.style.transformOrigin = "0 0";
                    node.video.style.transform = cssTransform;
                    var videoLayer = this._backgroundVideoLayer;
                    if (videoLayer !== node.video.parentElement) {
                        videoLayer.appendChild(node.video);
                        node.addEventListener(2 /* RemovedFromStage */, function removeVideo(node) {
                            release || assert(videoLayer === node.video.parentElement);
                            videoLayer.removeChild(node.video);
                            node.removeEventListener(2 /* RemovedFromStage */, removeVideo);
                        });
                    }
                    matrix.free();
                };
                Canvas2DRenderer.prototype.visitRenderable = function (node, state, ratio) {
                    var bounds = node.getBounds();
                    if (state.flags & 32 /* IgnoreRenderable */) {
                        return;
                    }
                    if (bounds.isEmpty()) {
                        return;
                    }
                    if (state.hasFlags(64 /* IgnoreNextRenderWithCache */)) {
                        state.removeFlags(64 /* IgnoreNextRenderWithCache */);
                    }
                    else {
                        if (this._renderWithCache(node, state)) {
                            return;
                        }
                    }
                    var matrix = state.matrix;
                    var context = state.target.context;
                    var paintClip = !!(state.flags & 16 /* PaintClip */);
                    var paintStencil = !!(state.flags & 8 /* PaintStencil */);
                    var paintFlashing = !release && !!(state.flags & 512 /* PaintFlashing */);
                    context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
                    var paintStart = 0;
                    if (paintFlashing) {
                        paintStart = performance.now();
                    }
                    this._frameInfo.shapes++;
                    context.imageSmoothingEnabled = context.mozImageSmoothingEnabled = state.hasFlags(4096 /* ImageSmoothing */);
                    var renderCount = node.properties["renderCount"] || 0;
                    var cacheShapesMaxSize = this._options.cacheShapesMaxSize;
                    node.properties["renderCount"] = ++renderCount;
                    node.render(context, ratio, null, paintClip ? state.clipPath : null, paintStencil);
                    if (paintFlashing) {
                        var elapsed = performance.now() - paintStart;
                        context.fillStyle = Shumway.ColorStyle.gradientColor(0.1 / elapsed);
                        context.globalAlpha = 0.3 + 0.1 * Math.random();
                        context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
                    }
                };
                Canvas2DRenderer.prototype._renderLayer = function (node, state) {
                    var layer = node.getLayer();
                    var mask = layer.mask;
                    if (!mask) {
                        var clip = Rectangle.allocate();
                        var target = this._renderToTemporarySurface(node, state, clip, null);
                        if (target) {
                            var matrix = state.matrix;
                            state.target.draw(target, clip.x, clip.y, clip.w, clip.h, layer.blendMode);
                            target.free();
                        }
                        clip.free();
                    }
                    else {
                        var paintStencil = !node.hasFlags(131072 /* CacheAsBitmap */) || !mask.hasFlags(131072 /* CacheAsBitmap */);
                        this._renderWithMask(node, mask, layer.blendMode, paintStencil, state);
                    }
                };
                Canvas2DRenderer.prototype._renderWithMask = function (node, mask, blendMode, stencil, state) {
                    var maskMatrix = mask.getTransform().getConcatenatedMatrix(true);
                    // If the mask doesn't have a parent then it's matrix doesn't include the pixel density
                    // scaling and we have to factor it in separately.
                    if (!mask.parent) {
                        maskMatrix = maskMatrix.scale(this._devicePixelRatio, this._devicePixelRatio);
                    }
                    var aAABB = node.getBounds().clone();
                    state.matrix.transformRectangleAABB(aAABB);
                    aAABB.snap();
                    if (aAABB.isEmpty()) {
                        return;
                    }
                    var bAABB = mask.getBounds().clone();
                    maskMatrix.transformRectangleAABB(bAABB);
                    bAABB.snap();
                    if (bAABB.isEmpty()) {
                        return;
                    }
                    var clip = state.clip.clone();
                    clip.intersect(aAABB);
                    clip.intersect(bAABB);
                    clip.snap();
                    // The masked area is empty, so nothing to do here.
                    if (clip.isEmpty()) {
                        return;
                    }
                    var aState = state.clone();
                    aState.clip.set(clip);
                    var a = this._renderToTemporarySurface(node, aState, Rectangle.createEmpty(), null);
                    aState.free();
                    var bState = state.clone();
                    bState.clip.set(clip);
                    bState.matrix = maskMatrix;
                    bState.flags |= 4 /* IgnoreMask */;
                    if (stencil) {
                        bState.flags |= 8 /* PaintStencil */;
                    }
                    var b = this._renderToTemporarySurface(mask, bState, Rectangle.createEmpty(), a.surface);
                    bState.free();
                    a.draw(b, 0, 0, clip.w, clip.h, 11 /* Alpha */);
                    var matrix = state.matrix;
                    state.target.draw(a, clip.x, clip.y, clip.w, clip.h, blendMode);
                    b.free();
                    a.free();
                };
                Canvas2DRenderer.prototype._renderStageToTarget = function (target, node, clip) {
                    Rectangle.allocationCount = Matrix.allocationCount = RenderState.allocationCount = 0;
                    var state = new RenderState(target);
                    state.clip.set(clip);
                    if (!this._options.paintRenderable) {
                        state.flags |= 32 /* IgnoreRenderable */;
                    }
                    if (this._options.paintBounds) {
                        state.flags |= 1024 /* PaintBounds */;
                    }
                    if (this._options.paintDirtyRegion) {
                        state.flags |= 2048 /* PaintDirtyRegion */;
                    }
                    if (this._options.paintFlashing) {
                        state.flags |= 512 /* PaintFlashing */;
                    }
                    if (this._options.cacheShapes) {
                        state.flags |= 256 /* CacheShapes */;
                    }
                    if (this._options.imageSmoothing) {
                        state.flags |= 4096 /* ImageSmoothing */;
                    }
                    if (this._options.snapToDevicePixels) {
                        state.flags |= 8192 /* PixelSnapping */;
                    }
                    this._frameInfo.enter(state);
                    node.visit(this, state);
                    this._frameInfo.leave();
                };
                Canvas2DRenderer.prototype._renderToTemporarySurface = function (node, state, clip, excludeSurface) {
                    var matrix = state.matrix;
                    var bounds = node.getBounds();
                    var boundsAABB = bounds.clone();
                    matrix.transformRectangleAABB(boundsAABB);
                    boundsAABB.snap();
                    clip.set(boundsAABB);
                    clip.intersect(state.clip);
                    clip.snap();
                    if (clip.isEmpty()) {
                        return null;
                    }
                    var target = this._allocateSurface(clip.w, clip.h, excludeSurface);
                    var region = target.region;
                    // Region bounds may be smaller than the allocated surface region.
                    var surfaceRegionBounds = new Rectangle(region.x, region.y, clip.w, clip.h);
                    target.context.setTransform(1, 0, 0, 1, 0, 0);
                    target.clear();
                    matrix = matrix.clone();
                    matrix.translate(surfaceRegionBounds.x - clip.x, surfaceRegionBounds.y - clip.y);
                    // Clip region bounds so we don't paint outside.
                    target.context.save();
                    // We can't do this because we could be clipping some other temporary region in the same
                    // context.
                    // TODO: but we have to, otherwise we overwrite textures that we might need. This happens in
                    // _renderWithMask, which is why we currently force the allocation of a whole second surface
                    // to avoid it. So, we need to find a solution here.
                    //target.context.beginPath();
                    //target.context.rect(surfaceRegionBounds.x, surfaceRegionBounds.y, surfaceRegionBounds.w,
                    //                    surfaceRegionBounds.h);
                    //target.context.clip();
                    state = state.clone();
                    state.target = target;
                    state.matrix = matrix;
                    state.clip.set(surfaceRegionBounds);
                    node.visit(this, state);
                    state.free();
                    target.context.restore();
                    return target;
                };
                Canvas2DRenderer.prototype._allocateSurface = function (w, h, excludeSurface) {
                    var surface = (Canvas2DRenderer._surfaceCache.allocate(w, h, excludeSurface));
                    if (!release) {
                        surface.fill("#FF4981");
                    }
                    // var color = "rgba(" + (Math.random() * 255 | 0) + ", " + (Math.random() * 255 | 0) + ", " + (Math.random() * 255 | 0) + ", 1)"
                    // surface.fill(color);
                    return surface;
                };
                Canvas2DRenderer.prototype.screenShot = function (bounds, stageContent) {
                    if (stageContent) {
                        // HACK: Weird way to get to the real content, but oh well...
                        var contentStage = this._stage.content.groupChild.child;
                        assert(contentStage instanceof GFX.Stage);
                        bounds = contentStage.content.getBounds(true);
                        // Figure out the device bounds.
                        contentStage.content.getTransform().getConcatenatedMatrix().transformRectangleAABB(bounds);
                        // If it's zoomed in, clip by the viewport.
                        bounds.intersect(this._viewport);
                    }
                    if (!bounds) {
                        bounds = new Rectangle(0, 0, this._target.w, this._target.h);
                    }
                    var canvas = document.createElement("canvas");
                    canvas.width = bounds.w;
                    canvas.height = bounds.h;
                    var context = canvas.getContext("2d");
                    context.fillStyle = this._container.style.backgroundColor;
                    context.fillRect(0, 0, bounds.w, bounds.h);
                    context.drawImage(this._target.context.canvas, bounds.x, bounds.y, bounds.w, bounds.h, 0, 0, bounds.w, bounds.h);
                    return new GFX.ScreenShot(canvas.toDataURL('image/png'), bounds.w, bounds.h);
                };
                Canvas2DRenderer._initializedCaches = false;
                Canvas2DRenderer._debugPoints = Point.createEmptyPoints(4);
                return Canvas2DRenderer;
            })(GFX.Renderer);
            Canvas2D.Canvas2DRenderer = Canvas2DRenderer;
        })(Canvas2D = GFX.Canvas2D || (GFX.Canvas2D = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var assert = Shumway.Debug.assert;
        var Point = GFX.Geometry.Point;
        var Matrix = GFX.Geometry.Matrix;
        var Rectangle = GFX.Geometry.Rectangle;
        var FPS = Shumway.Tools.Mini.FPS;
        var UIState = (function () {
            function UIState() {
            }
            UIState.prototype.onMouseUp = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onMouseDown = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onMouseMove = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onMouseWheel = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onMouseClick = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onKeyUp = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onKeyDown = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onKeyPress = function (easel, event) {
                easel.state = this;
            };
            return UIState;
        })();
        GFX.UIState = UIState;
        var StartState = (function (_super) {
            __extends(StartState, _super);
            function StartState() {
                _super.apply(this, arguments);
                this._keyCodes = [];
            }
            StartState.prototype.onMouseDown = function (easel, event) {
                if (event.altKey) {
                    easel.state = new DragState(easel.worldView, easel.getMousePosition(event, null), easel.worldView.getTransform().getMatrix(true));
                }
                else {
                }
            };
            StartState.prototype.onMouseClick = function (easel, event) {
            };
            StartState.prototype.onKeyDown = function (easel, event) {
                this._keyCodes[event.keyCode] = true;
            };
            StartState.prototype.onKeyUp = function (easel, event) {
                this._keyCodes[event.keyCode] = false;
            };
            return StartState;
        })(UIState);
        function normalizeWheelSpeed(event) {
            var normalized;
            if (event.wheelDelta) {
                normalized = (event.wheelDelta % 120 - 0) == -0 ? event.wheelDelta / 120 : event.wheelDelta / 12;
            }
            else {
                var rawAmmount = event.deltaY ? event.deltaY : event.detail;
                normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
            }
            return normalized;
        }
        var PersistentState = (function (_super) {
            __extends(PersistentState, _super);
            function PersistentState() {
                _super.apply(this, arguments);
                this._keyCodes = [];
                this._paused = false;
                this._mousePosition = new Point(0, 0);
            }
            PersistentState.prototype.onMouseMove = function (easel, event) {
                this._mousePosition = easel.getMousePosition(event, null);
                this._update(easel);
            };
            PersistentState.prototype.onMouseDown = function (easel, event) {
            };
            PersistentState.prototype.onMouseClick = function (easel, event) {
            };
            PersistentState.prototype.onMouseWheel = function (easel, event) {
                var ticks = (event.type === 'DOMMouseScroll') ? -event.detail : event.wheelDelta / 40;
                if (event.altKey) {
                    event.preventDefault();
                    var p = easel.getMousePosition(event, null);
                    var m = easel.worldView.getTransform().getMatrix(true);
                    var s = 1 + ticks / 1000;
                    m.translate(-p.x, -p.y);
                    m.scale(s, s);
                    m.translate(p.x, p.y);
                    easel.worldView.getTransform().setMatrix(m);
                }
            };
            PersistentState.prototype.onKeyPress = function (easel, event) {
                if (!event.altKey) {
                    return;
                }
                var code = event.keyCode || event.which;
                console.info("onKeyPress Code: " + code);
                switch (code) {
                    case 248:
                        this._paused = !this._paused;
                        event.preventDefault();
                        break;
                    case 223:
                        easel.toggleOption("paintRenderable");
                        event.preventDefault();
                        break;
                    case 8730:
                        easel.toggleOption("paintViewport");
                        event.preventDefault();
                        break;
                    case 8747:
                        easel.toggleOption("paintBounds");
                        event.preventDefault();
                        break;
                    case 8706:
                        easel.toggleOption("paintDirtyRegion");
                        event.preventDefault();
                        break;
                    case 231:
                        easel.toggleOption("clear");
                        event.preventDefault();
                        break;
                    case 402:
                        easel.toggleOption("paintFlashing");
                        event.preventDefault();
                        break;
                }
                this._update(easel);
            };
            PersistentState.prototype.onKeyDown = function (easel, event) {
                this._keyCodes[event.keyCode] = true;
                this._update(easel);
            };
            PersistentState.prototype.onKeyUp = function (easel, event) {
                this._keyCodes[event.keyCode] = false;
                this._update(easel);
            };
            PersistentState.prototype._update = function (easel) {
                easel.paused = this._paused;
                if (easel.getOption("paintViewport")) {
                    var w = GFX.viewportLoupeDiameter.value, h = GFX.viewportLoupeDiameter.value;
                    easel.viewport = new Rectangle(this._mousePosition.x - w / 2, this._mousePosition.y - h / 2, w, h);
                }
                else {
                    easel.viewport = null;
                }
            };
            return PersistentState;
        })(UIState);
        var MouseDownState = (function (_super) {
            __extends(MouseDownState, _super);
            function MouseDownState() {
                _super.apply(this, arguments);
                this._startTime = Date.now();
            }
            MouseDownState.prototype.onMouseMove = function (easel, event) {
                if (Date.now() - this._startTime < 10) {
                    return;
                }
                var node = easel.queryNodeUnderMouse(event);
                if (node) {
                    easel.state = new DragState(node, easel.getMousePosition(event, null), node.getTransform().getMatrix(true));
                }
            };
            MouseDownState.prototype.onMouseUp = function (easel, event) {
                easel.state = new StartState();
                easel.selectNodeUnderMouse(event);
            };
            return MouseDownState;
        })(UIState);
        var DragState = (function (_super) {
            __extends(DragState, _super);
            function DragState(target, startPosition, startMatrix) {
                _super.call(this);
                this._target = target;
                this._startPosition = startPosition;
                this._startMatrix = startMatrix;
            }
            DragState.prototype.onMouseMove = function (easel, event) {
                event.preventDefault();
                var p = easel.getMousePosition(event, null);
                p.sub(this._startPosition);
                this._target.getTransform().setMatrix(this._startMatrix.clone().translate(p.x, p.y));
                easel.state = this;
            };
            DragState.prototype.onMouseUp = function (easel, event) {
                easel.state = new StartState();
            };
            return DragState;
        })(UIState);
        var Easel = (function () {
            function Easel(container, disableHiDPI, backgroundColor) {
                if (disableHiDPI === void 0) { disableHiDPI = false; }
                if (backgroundColor === void 0) { backgroundColor = undefined; }
                this._state = new StartState();
                this._persistentState = new PersistentState();
                this.paused = false;
                this.viewport = null;
                this._selectedNodes = [];
                this._isRendering = false;
                this._rAF = undefined;
                this._eventListeners = Object.create(null);
                this._fullScreen = false;
                release || assert(container && container.children.length === 0, "Easel container must be empty.");
                this._container = container;
                this._stage = new GFX.Stage(512, 512, true);
                this._worldView = this._stage.content;
                this._world = new GFX.Group();
                this._worldView.addChild(this._world);
                this._disableHiDPI = disableHiDPI;
                // Create stage container.
                var stageContainer = document.createElement("div");
                stageContainer.style.position = "absolute";
                stageContainer.style.width = "100%";
                stageContainer.style.height = "100%";
                stageContainer.style.zIndex = "0";
                container.appendChild(stageContainer);
                // Create hud container, that lives on top of the stage.
                if (GFX.hud.value) {
                    var hudContainer = document.createElement("div");
                    hudContainer.style.position = "absolute";
                    hudContainer.style.width = "100%";
                    hudContainer.style.height = "100%";
                    hudContainer.style.pointerEvents = "none";
                    var fpsContainer = document.createElement("div");
                    fpsContainer.style.position = "absolute";
                    fpsContainer.style.width = "100%";
                    fpsContainer.style.height = "20px";
                    fpsContainer.style.pointerEvents = "none";
                    hudContainer.appendChild(fpsContainer);
                    container.appendChild(hudContainer);
                    this._fps = new FPS(fpsContainer);
                }
                else {
                    this._fps = null;
                }
                var transparent = backgroundColor === 0;
                this.transparent = transparent;
                var cssBackgroundColor = backgroundColor === undefined ? "#14171a" : backgroundColor === 0 ? 'transparent' : Shumway.ColorUtilities.rgbaToCSSStyle(backgroundColor);
                this._options = new GFX.Canvas2D.Canvas2DRendererOptions();
                this._options.alpha = transparent;
                this._renderer = new GFX.Canvas2D.Canvas2DRenderer(stageContainer, this._stage, this._options);
                this._listenForContainerSizeChanges();
                this._onMouseUp = this._onMouseUp.bind(this);
                this._onMouseDown = this._onMouseDown.bind(this);
                this._onMouseMove = this._onMouseMove.bind(this);
                var self = this;
                window.addEventListener("mouseup", function (event) {
                    self._state.onMouseUp(self, event);
                    self._render();
                }, false);
                window.addEventListener("mousemove", function (event) {
                    self._state.onMouseMove(self, event);
                    self._persistentState.onMouseMove(self, event);
                }, false);
                function handleMouseWheel(event) {
                    self._state.onMouseWheel(self, event);
                    self._persistentState.onMouseWheel(self, event);
                }
                window.addEventListener('DOMMouseScroll', handleMouseWheel);
                window.addEventListener("mousewheel", handleMouseWheel);
                container.addEventListener("mousedown", function (event) {
                    self._state.onMouseDown(self, event);
                });
                window.addEventListener("keydown", function (event) {
                    self._state.onKeyDown(self, event);
                    if (self._state !== self._persistentState) {
                        self._persistentState.onKeyDown(self, event);
                    }
                }, false);
                window.addEventListener("keypress", function (event) {
                    self._state.onKeyPress(self, event);
                    if (self._state !== self._persistentState) {
                        self._persistentState.onKeyPress(self, event);
                    }
                }, false);
                window.addEventListener("keyup", function (event) {
                    self._state.onKeyUp(self, event);
                    if (self._state !== self._persistentState) {
                        self._persistentState.onKeyUp(self, event);
                    }
                }, false);
            }
            Easel.prototype._listenForContainerSizeChanges = function () {
                var pollInterval = 10;
                var w = this._containerWidth;
                var h = this._containerHeight;
                this._onContainerSizeChanged();
                var self = this;
                setInterval(function () {
                    if (w !== self._containerWidth || h !== self._containerHeight) {
                        self._onContainerSizeChanged();
                        w = self._containerWidth;
                        h = self._containerHeight;
                    }
                }, pollInterval);
            };
            Easel.prototype._onContainerSizeChanged = function () {
                var ratio = this.getRatio();
                var sw = Math.ceil(this._containerWidth * ratio);
                var sh = Math.ceil(this._containerHeight * ratio);
                this._stage.setBounds(new Rectangle(0, 0, sw, sh));
                this._stage.content.setBounds(new Rectangle(0, 0, sw, sh));
                this._worldView.getTransform().setMatrix(new Matrix(ratio, 0, 0, ratio, 0, 0));
                this._dispatchEvent('resize');
            };
            /**
             * Primitive event dispatching features.
             */
            Easel.prototype.addEventListener = function (type, listener) {
                if (!this._eventListeners[type]) {
                    this._eventListeners[type] = [];
                }
                this._eventListeners[type].push(listener);
            };
            Easel.prototype._dispatchEvent = function (type) {
                var listeners = this._eventListeners[type];
                if (!listeners) {
                    return;
                }
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i]();
                }
            };
            Easel.prototype.startRendering = function () {
                if (this._isRendering) {
                    return;
                }
                this._isRendering = true;
                var self = this;
                this._rAF = requestAnimationFrame(function tick() {
                    self.render();
                    self._rAF = requestAnimationFrame(tick);
                });
            };
            Easel.prototype.stopRendering = function () {
                if (this._isRendering) {
                    this._isRendering = false;
                    cancelAnimationFrame(this._rAF);
                }
            };
            Object.defineProperty(Easel.prototype, "state", {
                set: function (state) {
                    this._state = state;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Easel.prototype, "cursor", {
                set: function (cursor) {
                    this._container.style.cursor = cursor;
                },
                enumerable: true,
                configurable: true
            });
            Easel.prototype._render = function () {
                GFX.RenderableVideo.checkForVideoUpdates();
                var mustRender = (this._stage.readyToRender() || GFX.forcePaint.value) && !this.paused;
                var renderTime = 0;
                if (mustRender) {
                    var renderer = this._renderer;
                    if (this.viewport) {
                        renderer.viewport = this.viewport;
                    }
                    else {
                        renderer.viewport = this._stage.getBounds();
                    }
                    this._dispatchEvent("render");
                    GFX.enterTimeline("Render");
                    renderTime = performance.now();
                    renderer.render();
                    renderTime = performance.now() - renderTime;
                    GFX.leaveTimeline("Render");
                }
                if (this._fps) {
                    this._fps.tickAndRender(!mustRender, renderTime);
                }
            };
            Easel.prototype.render = function () {
                this._render();
            };
            Object.defineProperty(Easel.prototype, "world", {
                get: function () {
                    return this._world;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Easel.prototype, "worldView", {
                get: function () {
                    return this._worldView;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Easel.prototype, "stage", {
                get: function () {
                    return this._stage;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Easel.prototype, "options", {
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            Easel.prototype.getDisplayParameters = function () {
                var ratio = this.getRatio();
                return {
                    stageWidth: this._containerWidth,
                    stageHeight: this._containerHeight,
                    pixelRatio: ratio,
                    screenWidth: window.screen ? window.screen.width : 640,
                    screenHeight: window.screen ? window.screen.height : 480
                };
            };
            Easel.prototype.toggleOption = function (name) {
                var option = this._options;
                option[name] = !option[name];
            };
            Easel.prototype.getOption = function (name) {
                return this._options[name];
            };
            Easel.prototype.getRatio = function () {
                var devicePixelRatio = window.devicePixelRatio || 1;
                var backingStoreRatio = 1;
                var ratio = 1;
                if (devicePixelRatio !== backingStoreRatio && !this._disableHiDPI) {
                    ratio = devicePixelRatio / backingStoreRatio;
                }
                return ratio;
            };
            Object.defineProperty(Easel.prototype, "_containerWidth", {
                get: function () {
                    return this._container.clientWidth;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Easel.prototype, "_containerHeight", {
                get: function () {
                    return this._container.clientHeight;
                },
                enumerable: true,
                configurable: true
            });
            Easel.prototype.queryNodeUnderMouse = function (event) {
                return this._world;
            };
            Easel.prototype.selectNodeUnderMouse = function (event) {
                var frame = this.queryNodeUnderMouse(event);
                if (frame) {
                    this._selectedNodes.push(frame);
                }
                this._render();
            };
            Easel.prototype.getMousePosition = function (event, coordinateSpace) {
                var container = this._container;
                var bRect = container.getBoundingClientRect();
                var ratio = this.getRatio();
                var x = ratio * (event.clientX - bRect.left) * (container.scrollWidth / bRect.width);
                var y = ratio * (event.clientY - bRect.top) * (container.scrollHeight / bRect.height);
                var p = new Point(x, y);
                if (!coordinateSpace) {
                    return p;
                }
                var m = Matrix.createIdentity();
                coordinateSpace.getTransform().getConcatenatedMatrix().inverse(m);
                m.transformPoint(p);
                return p;
            };
            Easel.prototype.getMouseWorldPosition = function (event) {
                return this.getMousePosition(event, this._world);
            };
            Easel.prototype._onMouseDown = function (event) {
                // this._renderers.forEach(renderer => renderer.render());
            };
            Easel.prototype._onMouseUp = function (event) {
            };
            Easel.prototype._onMouseMove = function (event) {
            };
            Easel.prototype.screenShot = function (bounds, stageContent) {
                return this._renderer.screenShot(bounds, stageContent);
            };
            return Easel;
        })();
        GFX.Easel = Easel;
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Matrix = Shumway.GFX.Geometry.Matrix;
        (function (Layout) {
            Layout[Layout["Simple"] = 0] = "Simple";
        })(GFX.Layout || (GFX.Layout = {}));
        var Layout = GFX.Layout;
        var TreeRendererOptions = (function (_super) {
            __extends(TreeRendererOptions, _super);
            function TreeRendererOptions() {
                _super.apply(this, arguments);
                this.layout = 0 /* Simple */;
            }
            return TreeRendererOptions;
        })(GFX.RendererOptions);
        GFX.TreeRendererOptions = TreeRendererOptions;
        var TreeRenderer = (function (_super) {
            __extends(TreeRenderer, _super);
            function TreeRenderer(container, stage, options) {
                if (options === void 0) { options = new TreeRendererOptions(); }
                _super.call(this, container, stage, options);
                this._canvas = document.createElement("canvas");
                this._container.appendChild(this._canvas);
                this._context = this._canvas.getContext("2d");
                this._listenForContainerSizeChanges();
            }
            TreeRenderer.prototype._listenForContainerSizeChanges = function () {
                var pollInterval = 10;
                var w = this._containerWidth;
                var h = this._containerHeight;
                this._onContainerSizeChanged();
                var self = this;
                setInterval(function () {
                    if (w !== self._containerWidth || h !== self._containerHeight) {
                        self._onContainerSizeChanged();
                        w = self._containerWidth;
                        h = self._containerHeight;
                    }
                }, pollInterval);
            };
            TreeRenderer.prototype._getRatio = function () {
                var devicePixelRatio = window.devicePixelRatio || 1;
                var backingStoreRatio = 1;
                var ratio = 1;
                if (devicePixelRatio !== backingStoreRatio) {
                    ratio = devicePixelRatio / backingStoreRatio;
                }
                return ratio;
            };
            TreeRenderer.prototype._onContainerSizeChanged = function () {
                var ratio = this._getRatio();
                var w = Math.ceil(this._containerWidth * ratio);
                var h = Math.ceil(this._containerHeight * ratio);
                var canvas = this._canvas;
                if (ratio > 0) {
                    canvas.width = w * ratio;
                    canvas.height = h * ratio;
                    canvas.style.width = w + 'px';
                    canvas.style.height = h + 'px';
                }
                else {
                    canvas.width = w;
                    canvas.height = h;
                }
            };
            Object.defineProperty(TreeRenderer.prototype, "_containerWidth", {
                get: function () {
                    return this._container.clientWidth;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TreeRenderer.prototype, "_containerHeight", {
                get: function () {
                    return this._container.clientHeight;
                },
                enumerable: true,
                configurable: true
            });
            TreeRenderer.prototype.render = function () {
                var context = this._context;
                context.save();
                context.clearRect(0, 0, this._canvas.width, this._canvas.height);
                context.scale(1, 1);
                if (this._options.layout === 0 /* Simple */) {
                    this._renderNodeSimple(this._context, this._stage, Matrix.createIdentity());
                }
                context.restore();
            };
            TreeRenderer.prototype._renderNodeSimple = function (context, root, transform) {
                var self = this;
                context.save();
                var fontHeight = 16;
                context.font = fontHeight + "px Arial";
                context.fillStyle = "white";
                var x = 0, y = 0;
                var w = 20, h = fontHeight, hPadding = 2, wColPadding = 8;
                var colX = 0;
                var maxX = 0;
                function visit(node) {
                    var children = node.getChildren();
                    if (node.hasFlags(16 /* Dirty */)) {
                        context.fillStyle = "red";
                    }
                    else {
                        context.fillStyle = "white";
                    }
                    var l = String(node.id);
                    if (node instanceof GFX.RenderableText) {
                        l = "T" + l;
                    }
                    else if (node instanceof GFX.RenderableShape) {
                        l = "S" + l;
                    }
                    else if (node instanceof GFX.RenderableBitmap) {
                        l = "B" + l;
                    }
                    else if (node instanceof GFX.RenderableVideo) {
                        l = "V" + l;
                    }
                    if (node instanceof GFX.Renderable) {
                        l = l + " [" + node._parents.length + "]";
                    }
                    var t = context.measureText(l).width;
                    // context.fillRect(x, y, t, h);
                    context.fillText(l, x, y);
                    if (children) {
                        x += t + 4;
                        maxX = Math.max(maxX, x + w);
                        for (var i = 0; i < children.length; i++) {
                            visit(children[i]);
                            if (i < children.length - 1) {
                                y += h + hPadding;
                                if (y > self._canvas.height) {
                                    context.fillStyle = "gray";
                                    // context.fillRect(maxX + 4, 0, 2, self._canvas.height);
                                    x = x - colX + maxX + wColPadding;
                                    colX = maxX + wColPadding;
                                    y = 0;
                                    context.fillStyle = "white";
                                }
                            }
                        }
                        x -= t + 4;
                    }
                }
                visit(root);
                context.restore();
            };
            return TreeRenderer;
        })(GFX.Renderer);
        GFX.TreeRenderer = TreeRenderer;
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var Remoting;
    (function (Remoting) {
        var GFX;
        (function (GFX) {
            var BlurFilter = Shumway.GFX.BlurFilter;
            var DropshadowFilter = Shumway.GFX.DropshadowFilter;
            var NodeFlags = Shumway.GFX.NodeFlags;
            var Shape = Shumway.GFX.Shape;
            var Group = Shumway.GFX.Group;
            var RenderableShape = Shumway.GFX.RenderableShape;
            var RenderableMorphShape = Shumway.GFX.RenderableMorphShape;
            var RenderableBitmap = Shumway.GFX.RenderableBitmap;
            var RenderableVideo = Shumway.GFX.RenderableVideo;
            var RenderableText = Shumway.GFX.RenderableText;
            var ColorMatrix = Shumway.GFX.ColorMatrix;
            var BlendMode = Shumway.GFX.BlendMode;
            var ShapeData = Shumway.ShapeData;
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var Stage = Shumway.GFX.Stage;
            var NodeEventType = Shumway.GFX.NodeEventType;
            var Matrix = Shumway.GFX.Geometry.Matrix;
            var Rectangle = Shumway.GFX.Geometry.Rectangle;
            var assert = Shumway.Debug.assert;
            var writer = null; // new IndentingWriter();
            var GFXChannelSerializer = (function () {
                function GFXChannelSerializer() {
                }
                GFXChannelSerializer.prototype.writeMouseEvent = function (event, point) {
                    var output = this.output;
                    output.writeInt(300 /* MouseEvent */);
                    var typeId = Shumway.Remoting.MouseEventNames.indexOf(event.type);
                    output.writeInt(typeId);
                    output.writeFloat(point.x);
                    output.writeFloat(point.y);
                    output.writeInt(event.buttons);
                    var flags = (event.ctrlKey ? 1 /* CtrlKey */ : 0) | (event.altKey ? 2 /* AltKey */ : 0) | (event.shiftKey ? 4 /* ShiftKey */ : 0);
                    output.writeInt(flags);
                };
                GFXChannelSerializer.prototype.writeKeyboardEvent = function (event) {
                    var output = this.output;
                    output.writeInt(301 /* KeyboardEvent */);
                    var typeId = Shumway.Remoting.KeyboardEventNames.indexOf(event.type);
                    output.writeInt(typeId);
                    output.writeInt(event.keyCode);
                    output.writeInt(event.charCode);
                    output.writeInt(event.location);
                    var flags = (event.ctrlKey ? 1 /* CtrlKey */ : 0) | (event.altKey ? 2 /* AltKey */ : 0) | (event.shiftKey ? 4 /* ShiftKey */ : 0);
                    output.writeInt(flags);
                };
                GFXChannelSerializer.prototype.writeFocusEvent = function (type) {
                    var output = this.output;
                    output.writeInt(302 /* FocusEvent */);
                    output.writeInt(type);
                };
                return GFXChannelSerializer;
            })();
            GFX.GFXChannelSerializer = GFXChannelSerializer;
            var GFXChannelDeserializerContext = (function () {
                function GFXChannelDeserializerContext(easelHost, root, transparent) {
                    var stage = this.stage = new Stage(128, 512);
                    if (typeof registerInspectorStage !== "undefined") {
                        registerInspectorStage(stage);
                    }
                    function updateStageBounds(node) {
                        var stageBounds = node.getBounds(true);
                        // Easel stage is the root stage and is not scaled, our stage is so
                        // we need to scale down.
                        var ratio = easelHost.easel.getRatio();
                        stageBounds.scale(1 / ratio, 1 / ratio);
                        stageBounds.snap();
                        stage.setBounds(stageBounds);
                    }
                    updateStageBounds(easelHost.stage);
                    easelHost.stage.addEventListener(1 /* OnStageBoundsChanged */, updateStageBounds);
                    easelHost.content = stage.content;
                    if (transparent) {
                        this.stage.setFlags(32768 /* Transparent */);
                    }
                    root.addChild(this.stage);
                    this._nodes = [];
                    this._assets = [];
                    this._easelHost = easelHost;
                    this._canvas = document.createElement("canvas");
                    this._context = this._canvas.getContext("2d");
                }
                GFXChannelDeserializerContext.prototype._registerAsset = function (id, symbolId, asset) {
                    if (typeof registerInspectorAsset !== "undefined") {
                        registerInspectorAsset(id, symbolId, asset);
                    }
                    if (!release && this._assets[id]) {
                        console.warn("Asset already exists: " + id + ". old:", this._assets[id], "new: " + asset);
                    }
                    this._assets[id] = asset;
                };
                GFXChannelDeserializerContext.prototype._makeNode = function (id) {
                    if (id === -1) {
                        return null;
                    }
                    var node = null;
                    if (id & 134217728 /* Asset */) {
                        id &= ~134217728 /* Asset */;
                        node = this._assets[id].wrap();
                    }
                    else {
                        node = this._nodes[id];
                    }
                    release || assert(node, "Node " + node + " of " + id + " has not been sent yet.");
                    return node;
                };
                GFXChannelDeserializerContext.prototype._getAsset = function (id) {
                    return this._assets[id];
                };
                GFXChannelDeserializerContext.prototype._getBitmapAsset = function (id) {
                    return this._assets[id];
                };
                GFXChannelDeserializerContext.prototype._getVideoAsset = function (id) {
                    return this._assets[id];
                };
                GFXChannelDeserializerContext.prototype._getTextAsset = function (id) {
                    return this._assets[id];
                };
                GFXChannelDeserializerContext.prototype.registerFont = function (syncId, data, resolve) {
                    Shumway.registerCSSFont(syncId, data, !inFirefox);
                    if (inFirefox) {
                        resolve(null);
                    }
                    else {
                        window.setTimeout(resolve, 400);
                    }
                };
                GFXChannelDeserializerContext.prototype.registerImage = function (syncId, symbolId, imageType, data, resolve) {
                    this._registerAsset(syncId, symbolId, this._decodeImage(imageType, data, resolve));
                };
                GFXChannelDeserializerContext.prototype.registerVideo = function (syncId) {
                    this._registerAsset(syncId, 0, new RenderableVideo(syncId, this));
                };
                /**
                 * Creates an Image element to decode JPG|PNG|GIF data passed in as a buffer.
                 *
                 * The resulting image is stored as the drawing source of a new RenderableBitmap, which is
                 * returned.
                 * Once the image is loaded, the RenderableBitmap's bounds are updated and the provided
                 * oncomplete callback is invoked with the image dimensions.
                 */
                GFXChannelDeserializerContext.prototype._decodeImage = function (type, data, oncomplete) {
                    var image = new Image();
                    var asset = RenderableBitmap.FromImage(image, -1, -1);
                    image.src = URL.createObjectURL(new Blob([data], { type: Shumway.getMIMETypeForImageType(type) }));
                    image.onload = function () {
                        release || assert(!asset.parent);
                        asset.setBounds(new Rectangle(0, 0, image.width, image.height));
                        asset.invalidate();
                        oncomplete({ width: image.width, height: image.height });
                    };
                    image.onerror = function () {
                        oncomplete(null);
                    };
                    return asset;
                };
                GFXChannelDeserializerContext.prototype.sendVideoPlaybackEvent = function (assetId, eventType, data) {
                    this._easelHost.sendVideoPlaybackEvent(assetId, eventType, data);
                };
                return GFXChannelDeserializerContext;
            })();
            GFX.GFXChannelDeserializerContext = GFXChannelDeserializerContext;
            var GFXChannelDeserializer = (function () {
                function GFXChannelDeserializer() {
                }
                GFXChannelDeserializer.prototype.read = function () {
                    var tag = 0;
                    var input = this.input;
                    var data = {
                        bytesAvailable: input.bytesAvailable,
                        updateGraphics: 0,
                        updateBitmapData: 0,
                        updateTextContent: 0,
                        updateFrame: 0,
                        updateStage: 0,
                        updateNetStream: 0,
                        registerFont: 0,
                        drawToBitmap: 0,
                        requestBitmapData: 0,
                        decodeImage: 0
                    };
                    Shumway.GFX.enterTimeline("GFXChannelDeserializer.read", data);
                    while (input.bytesAvailable > 0) {
                        tag = input.readInt();
                        switch (tag) {
                            case 0 /* EOF */:
                                Shumway.GFX.leaveTimeline("GFXChannelDeserializer.read");
                                return;
                            case 101 /* UpdateGraphics */:
                                data.updateGraphics++;
                                this._readUpdateGraphics();
                                break;
                            case 102 /* UpdateBitmapData */:
                                data.updateBitmapData++;
                                this._readUpdateBitmapData();
                                break;
                            case 103 /* UpdateTextContent */:
                                data.updateTextContent++;
                                this._readUpdateTextContent();
                                break;
                            case 100 /* UpdateFrame */:
                                data.updateFrame++;
                                this._readUpdateFrame();
                                break;
                            case 104 /* UpdateStage */:
                                data.updateStage++;
                                this._readUpdateStage();
                                break;
                            case 105 /* UpdateNetStream */:
                                data.updateNetStream++;
                                this._readUpdateNetStream();
                                break;
                            case 200 /* DrawToBitmap */:
                                data.drawToBitmap++;
                                this._readDrawToBitmap();
                                break;
                            case 106 /* RequestBitmapData */:
                                data.requestBitmapData++;
                                this._readRequestBitmapData();
                                break;
                            default:
                                release || assert(false, 'Unknown MessageReader tag: ' + tag);
                                break;
                        }
                    }
                    Shumway.GFX.leaveTimeline("GFXChannelDeserializer.read");
                };
                GFXChannelDeserializer.prototype._readMatrix = function () {
                    var input = this.input;
                    var matrix = GFXChannelDeserializer._temporaryReadMatrix;
                    matrix.setElements(input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat() / 20, input.readFloat() / 20);
                    return matrix;
                };
                GFXChannelDeserializer.prototype._readRectangle = function () {
                    var input = this.input;
                    var rectangle = GFXChannelDeserializer._temporaryReadRectangle;
                    rectangle.setElements(input.readInt() / 20, input.readInt() / 20, input.readInt() / 20, input.readInt() / 20);
                    return rectangle;
                };
                GFXChannelDeserializer.prototype._readColorMatrix = function () {
                    var input = this.input;
                    var colorMatrix = GFXChannelDeserializer._temporaryReadColorMatrix;
                    var rm = 1, gm = 1, bm = 1, am = 1;
                    var ro = 0, go = 0, bo = 0, ao = 0;
                    switch (input.readInt()) {
                        case 0 /* Identity */:
                            return GFXChannelDeserializer._temporaryReadColorMatrixIdentity;
                            break;
                        case 1 /* AlphaMultiplierOnly */:
                            am = input.readFloat();
                            break;
                        case 2 /* All */:
                            rm = input.readFloat();
                            gm = input.readFloat();
                            bm = input.readFloat();
                            am = input.readFloat();
                            ro = input.readInt();
                            go = input.readInt();
                            bo = input.readInt();
                            ao = input.readInt();
                            break;
                    }
                    colorMatrix.setMultipliersAndOffsets(rm, gm, bm, am, ro, go, bo, ao);
                    return colorMatrix;
                };
                GFXChannelDeserializer.prototype._readAsset = function () {
                    var assetId = this.input.readInt();
                    var asset = this.inputAssets[assetId];
                    this.inputAssets[assetId] = null;
                    return asset;
                };
                GFXChannelDeserializer.prototype._readUpdateGraphics = function () {
                    var input = this.input;
                    var context = this.context;
                    var id = input.readInt();
                    var symbolId = input.readInt();
                    var asset = context._getAsset(id);
                    var bounds = this._readRectangle();
                    var pathData = ShapeData.FromPlainObject(this._readAsset());
                    var numTextures = input.readInt();
                    var textures = [];
                    for (var i = 0; i < numTextures; i++) {
                        var bitmapId = input.readInt();
                        textures.push(context._getBitmapAsset(bitmapId));
                    }
                    if (asset) {
                        asset.update(pathData, textures, bounds);
                    }
                    else {
                        var renderable;
                        if (pathData.morphCoordinates) {
                            renderable = new RenderableMorphShape(id, pathData, textures, bounds);
                        }
                        else {
                            renderable = new RenderableShape(id, pathData, textures, bounds);
                        }
                        for (var i = 0; i < textures.length; i++) {
                            textures[i] && textures[i].addRenderableParent(renderable);
                        }
                        context._registerAsset(id, symbolId, renderable);
                    }
                };
                GFXChannelDeserializer.prototype._readUpdateBitmapData = function () {
                    var input = this.input;
                    var context = this.context;
                    var id = input.readInt();
                    var symbolId = input.readInt();
                    var asset = context._getBitmapAsset(id);
                    var bounds = this._readRectangle();
                    var type = input.readInt();
                    var dataBuffer = DataBuffer.FromPlainObject(this._readAsset());
                    if (!asset) {
                        asset = RenderableBitmap.FromDataBuffer(type, dataBuffer, bounds);
                        context._registerAsset(id, symbolId, asset);
                    }
                    else {
                        asset.updateFromDataBuffer(type, dataBuffer);
                    }
                    if (this.output) {
                    }
                };
                GFXChannelDeserializer.prototype._readUpdateTextContent = function () {
                    var input = this.input;
                    var context = this.context;
                    var id = input.readInt();
                    var symbolId = input.readInt();
                    var asset = context._getTextAsset(id);
                    var bounds = this._readRectangle();
                    var matrix = this._readMatrix();
                    var backgroundColor = input.readInt();
                    var borderColor = input.readInt();
                    var autoSize = input.readInt();
                    var wordWrap = input.readBoolean();
                    var scrollV = input.readInt();
                    var scrollH = input.readInt();
                    var plainText = this._readAsset();
                    var textRunData = DataBuffer.FromPlainObject(this._readAsset());
                    var coords = null;
                    var numCoords = input.readInt();
                    if (numCoords) {
                        coords = new DataBuffer(numCoords * 4);
                        input.readBytes(coords, 0, numCoords * 4);
                    }
                    if (!asset) {
                        asset = new RenderableText(bounds);
                        asset.setContent(plainText, textRunData, matrix, coords);
                        asset.setStyle(backgroundColor, borderColor, scrollV, scrollH);
                        asset.reflow(autoSize, wordWrap);
                        context._registerAsset(id, symbolId, asset);
                    }
                    else {
                        asset.setBounds(bounds);
                        asset.setContent(plainText, textRunData, matrix, coords);
                        asset.setStyle(backgroundColor, borderColor, scrollV, scrollH);
                        asset.reflow(autoSize, wordWrap);
                    }
                    if (this.output) {
                        var rect = asset.textRect;
                        this.output.writeInt(rect.w * 20);
                        this.output.writeInt(rect.h * 20);
                        this.output.writeInt(rect.x * 20);
                        var lines = asset.lines;
                        var numLines = lines.length;
                        this.output.writeInt(numLines);
                        for (var i = 0; i < numLines; i++) {
                            this._writeLineMetrics(lines[i]);
                        }
                    }
                };
                GFXChannelDeserializer.prototype._writeLineMetrics = function (line) {
                    release || assert(this.output);
                    this.output.writeInt(line.x);
                    this.output.writeInt(line.width);
                    this.output.writeInt(line.ascent);
                    this.output.writeInt(line.descent);
                    this.output.writeInt(line.leading);
                };
                GFXChannelDeserializer.prototype._readUpdateStage = function () {
                    var context = this.context;
                    var id = this.input.readInt();
                    if (!context._nodes[id]) {
                        context._nodes[id] = context.stage.content;
                    }
                    var color = this.input.readInt();
                    var bounds = this._readRectangle();
                    // TODO: Need to updateContentMatrix on stage here.
                    context.stage.content.setBounds(bounds);
                    context.stage.color = Shumway.Color.FromARGB(color);
                    context.stage.align = this.input.readInt();
                    context.stage.scaleMode = this.input.readInt();
                    var displayState = this.input.readInt();
                    var currentMouseTarget = this.input.readInt();
                    var cursor = this.input.readInt();
                    context._easelHost.cursor = Shumway.UI.toCSSCursor(cursor);
                    context._easelHost.fullscreen = displayState === 0 || displayState === 1;
                };
                GFXChannelDeserializer.prototype._readUpdateNetStream = function () {
                    var context = this.context;
                    var id = this.input.readInt();
                    var asset = context._getVideoAsset(id);
                    var rectangle = this._readRectangle();
                    if (!asset) {
                        context.registerVideo(id);
                        asset = context._getVideoAsset(id);
                    }
                    asset.setBounds(rectangle);
                };
                GFXChannelDeserializer.prototype._readFilters = function (node) {
                    var input = this.input;
                    var count = input.readInt();
                    var filters = [];
                    if (count) {
                        for (var i = 0; i < count; i++) {
                            var type = input.readInt();
                            switch (type) {
                                case 0 /* Blur */:
                                    filters.push(new BlurFilter(input.readFloat(), input.readFloat(), input.readInt()));
                                    break;
                                case 1 /* DropShadow */:
                                    filters.push(new DropshadowFilter(input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat(), input.readInt(), input.readFloat(), input.readBoolean(), input.readBoolean(), input.readBoolean(), input.readInt(), input.readFloat()));
                                    break;
                                default:
                                    Shumway.Debug.somewhatImplemented(Remoting.FilterType[type]);
                                    break;
                            }
                        }
                        node.getLayer().filters = filters;
                    }
                };
                GFXChannelDeserializer.prototype._readUpdateFrame = function () {
                    var input = this.input;
                    var context = this.context;
                    var id = input.readInt();
                    var ratio = 0;
                    writer && writer.writeLn("Receiving UpdateFrame: " + id);
                    var node = context._nodes[id];
                    if (!node) {
                        node = context._nodes[id] = new Group();
                    }
                    var hasBits = input.readInt();
                    if (hasBits & 1 /* HasMatrix */) {
                        node.getTransform().setMatrix(this._readMatrix());
                    }
                    if (hasBits & 8 /* HasColorTransform */) {
                        node.getTransform().setColorMatrix(this._readColorMatrix());
                    }
                    if (hasBits & 64 /* HasMask */) {
                        var maskId = input.readInt();
                        if (maskId >= 0) {
                            node.getLayer().mask = context._makeNode(maskId);
                        }
                    }
                    if (hasBits & 128 /* HasClip */) {
                        node.clip = input.readInt();
                    }
                    if (hasBits & 32 /* HasMiscellaneousProperties */) {
                        ratio = input.readInt() / 0xffff;
                        release || assert(ratio >= 0 && ratio <= 1);
                        var blendMode = input.readInt();
                        if (blendMode !== 1 /* Normal */) {
                            node.getLayer().blendMode = blendMode;
                        }
                        this._readFilters(node);
                        node.toggleFlags(65536 /* Visible */, input.readBoolean());
                        node.toggleFlags(131072 /* CacheAsBitmap */, input.readBoolean());
                        node.toggleFlags(262144 /* PixelSnapping */, !!input.readInt());
                        node.toggleFlags(524288 /* ImageSmoothing */, !!input.readInt());
                    }
                    if (hasBits & 4 /* HasChildren */) {
                        var count = input.readInt();
                        var container = node;
                        container.clearChildren();
                        for (var i = 0; i < count; i++) {
                            var childId = input.readInt();
                            var child = context._makeNode(childId);
                            release || assert(child, "Child " + childId + " of " + id + " has not been sent yet.");
                            container.addChild(child);
                        }
                    }
                    if (ratio) {
                        var group = node;
                        var child = group.getChildren()[0];
                        if (child instanceof Shape) {
                            child.ratio = ratio;
                        }
                    }
                };
                GFXChannelDeserializer.prototype._readDrawToBitmap = function () {
                    var input = this.input;
                    var context = this.context;
                    var targetId = input.readInt();
                    var sourceId = input.readInt();
                    var hasBits = input.readInt();
                    var matrix;
                    var colorMatrix;
                    var clipRect;
                    if (hasBits & 1 /* HasMatrix */) {
                        matrix = this._readMatrix().clone();
                    }
                    else {
                        matrix = Matrix.createIdentity();
                    }
                    if (hasBits & 8 /* HasColorTransform */) {
                        colorMatrix = this._readColorMatrix();
                    }
                    if (hasBits & 16 /* HasClipRect */) {
                        clipRect = this._readRectangle();
                    }
                    var blendMode = input.readInt();
                    input.readBoolean(); // Smoothing
                    var target = context._getBitmapAsset(targetId);
                    var source = context._makeNode(sourceId);
                    if (!target) {
                        context._registerAsset(targetId, -1, RenderableBitmap.FromNode(source, matrix, colorMatrix, blendMode, clipRect));
                    }
                    else {
                        target.drawNode(source, matrix, colorMatrix, blendMode, clipRect);
                    }
                };
                GFXChannelDeserializer.prototype._readRequestBitmapData = function () {
                    var input = this.input;
                    var output = this.output;
                    var context = this.context;
                    var id = input.readInt();
                    var renderableBitmap = context._getBitmapAsset(id);
                    renderableBitmap.readImageData(output);
                };
                /**
                 * Used to avoid extra allocation, don't ever leak a reference to this object.
                 */
                GFXChannelDeserializer._temporaryReadMatrix = Matrix.createIdentity();
                /**
                 * Used to avoid extra allocation, don't ever leak a reference to this object.
                 */
                GFXChannelDeserializer._temporaryReadRectangle = Rectangle.createEmpty();
                /**
                 * Used to avoid extra allocation, don't ever leak a reference to this object.
                 */
                GFXChannelDeserializer._temporaryReadColorMatrix = ColorMatrix.createIdentity();
                GFXChannelDeserializer._temporaryReadColorMatrixIdentity = ColorMatrix.createIdentity();
                return GFXChannelDeserializer;
            })();
            GFX.GFXChannelDeserializer = GFXChannelDeserializer;
        })(GFX = Remoting.GFX || (Remoting.GFX = {}));
    })(Remoting = Shumway.Remoting || (Shumway.Remoting = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Point = Shumway.GFX.Geometry.Point;
        var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
        var VideoControlEvent = Shumway.Remoting.VideoControlEvent;
        var EaselHost = (function () {
            function EaselHost(easel) {
                this._easel = easel;
                var group = easel.world;
                var transparent = easel.transparent;
                this._group = group;
                this._content = null;
                this._fullscreen = false;
                this._context = new Shumway.Remoting.GFX.GFXChannelDeserializerContext(this, this._group, transparent);
                this._addEventListeners();
            }
            EaselHost.prototype.onSendUpdates = function (update, asssets) {
                throw new Error('This method is abstract');
            };
            Object.defineProperty(EaselHost.prototype, "easel", {
                get: function () {
                    return this._easel;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EaselHost.prototype, "stage", {
                get: function () {
                    return this._easel.stage;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EaselHost.prototype, "content", {
                set: function (value) {
                    this._content = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EaselHost.prototype, "cursor", {
                set: function (cursor) {
                    this._easel.cursor = cursor;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EaselHost.prototype, "fullscreen", {
                set: function (value) {
                    if (this._fullscreen !== value) {
                        this._fullscreen = value;
                        // TODO refactor to have a normal two-way communication service/api
                        // HACK for now
                        if (typeof ShumwayCom !== 'undefined' && ShumwayCom.setFullscreen) {
                            ShumwayCom.setFullscreen(value);
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
            EaselHost.prototype._mouseEventListener = function (event) {
                // var position = this._easel.getMouseWorldPosition(event);
                var position = this._easel.getMousePosition(event, this._content);
                var point = new Point(position.x, position.y);
                var buffer = new DataBuffer();
                var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
                serializer.output = buffer;
                serializer.writeMouseEvent(event, point);
                this.onSendUpdates(buffer, []);
            };
            EaselHost.prototype._keyboardEventListener = function (event) {
                var buffer = new DataBuffer();
                var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
                serializer.output = buffer;
                serializer.writeKeyboardEvent(event);
                this.onSendUpdates(buffer, []);
            };
            EaselHost.prototype._addEventListeners = function () {
                var mouseEventListener = this._mouseEventListener.bind(this);
                var keyboardEventListener = this._keyboardEventListener.bind(this);
                var mouseEvents = EaselHost._mouseEvents;
                for (var i = 0; i < mouseEvents.length; i++) {
                    window.addEventListener(mouseEvents[i], mouseEventListener);
                }
                var keyboardEvents = EaselHost._keyboardEvents;
                for (var i = 0; i < keyboardEvents.length; i++) {
                    window.addEventListener(keyboardEvents[i], keyboardEventListener);
                }
                this._addFocusEventListeners();
                this._easel.addEventListener('resize', this._resizeEventListener.bind(this));
            };
            EaselHost.prototype._sendFocusEvent = function (type) {
                var buffer = new DataBuffer();
                var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
                serializer.output = buffer;
                serializer.writeFocusEvent(type);
                this.onSendUpdates(buffer, []);
            };
            EaselHost.prototype._addFocusEventListeners = function () {
                var self = this;
                document.addEventListener('visibilitychange', function (event) {
                    self._sendFocusEvent(document.hidden ? 0 /* DocumentHidden */ : 1 /* DocumentVisible */);
                });
                window.addEventListener('focus', function (event) {
                    self._sendFocusEvent(3 /* WindowFocus */);
                });
                window.addEventListener('blur', function (event) {
                    self._sendFocusEvent(2 /* WindowBlur */);
                });
            };
            EaselHost.prototype._resizeEventListener = function () {
                this.onDisplayParameters(this._easel.getDisplayParameters());
            };
            EaselHost.prototype.onDisplayParameters = function (params) {
                throw new Error('This method is abstract');
            };
            EaselHost.prototype.processUpdates = function (updates, assets, output) {
                if (output === void 0) { output = null; }
                var deserializer = new Shumway.Remoting.GFX.GFXChannelDeserializer();
                deserializer.input = updates;
                deserializer.inputAssets = assets;
                deserializer.output = output;
                deserializer.context = this._context;
                deserializer.read();
            };
            EaselHost.prototype.processVideoControl = function (id, eventType, data) {
                var context = this._context;
                var asset = context._getVideoAsset(id);
                if (!asset) {
                    if (eventType !== 1 /* Init */) {
                        return undefined;
                    }
                    context.registerVideo(id);
                    asset = context._getVideoAsset(id);
                }
                return asset.processControlRequest(eventType, data);
            };
            EaselHost.prototype.processRegisterFont = function (syncId, data, resolve) {
                this._context.registerFont(syncId, data, resolve);
            };
            EaselHost.prototype.processRegisterImage = function (syncId, symbolId, imageType, data, resolve) {
                this._context.registerImage(syncId, symbolId, imageType, data, resolve);
            };
            EaselHost.prototype.processFSCommand = function (command, args) {
            };
            EaselHost.prototype.processFrame = function () {
            };
            EaselHost.prototype.onVideoPlaybackEvent = function (id, eventType, data) {
                throw new Error('This method is abstract');
            };
            EaselHost.prototype.sendVideoPlaybackEvent = function (id, eventType, data) {
                this.onVideoPlaybackEvent(id, eventType, data);
            };
            EaselHost._mouseEvents = Shumway.Remoting.MouseEventNames;
            EaselHost._keyboardEvents = Shumway.Remoting.KeyboardEventNames;
            return EaselHost;
        })();
        GFX.EaselHost = EaselHost;
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Window;
        (function (Window) {
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var CircularBuffer = Shumway.CircularBuffer;
            var TimelineBuffer = Shumway.Tools.Profiler.TimelineBuffer;
            var WindowEaselHost = (function (_super) {
                __extends(WindowEaselHost, _super);
                function WindowEaselHost(easel, playerWindow, window) {
                    _super.call(this, easel);
                    this._timelineRequests = Object.create(null);
                    this._playerWindow = playerWindow;
                    this._window = window;
                    this._window.addEventListener('message', function (e) {
                        this.onWindowMessage(e.data);
                    }.bind(this));
                    if (typeof ShumwayCom !== 'undefined') {
                        ShumwayCom.setSyncMessageCallback(function (msg) {
                            this.onWindowMessage(msg, false);
                            return msg.result;
                        }.bind(this));
                    }
                    else {
                        this._window.addEventListener('syncmessage', function (e) {
                            this.onWindowMessage(e.detail, false);
                        }.bind(this));
                    }
                }
                WindowEaselHost.prototype.onSendUpdates = function (updates, assets) {
                    var bytes = updates.getBytes();
                    this._playerWindow.postMessage({
                        type: 'gfx',
                        updates: bytes,
                        assets: assets
                    }, '*', [bytes.buffer]);
                };
                WindowEaselHost.prototype.onDisplayParameters = function (params) {
                    this._playerWindow.postMessage({
                        type: 'displayParameters',
                        params: params
                    }, '*');
                };
                WindowEaselHost.prototype.onVideoPlaybackEvent = function (id, eventType, data) {
                    this._playerWindow.postMessage({
                        type: 'videoPlayback',
                        id: id,
                        eventType: eventType,
                        data: data
                    }, '*');
                };
                WindowEaselHost.prototype.requestTimeline = function (type, cmd) {
                    return new Promise(function (resolve) {
                        this._timelineRequests[type] = resolve;
                        this._playerWindow.postMessage({
                            type: 'timeline',
                            cmd: cmd,
                            request: type
                        }, '*');
                    }.bind(this));
                };
                WindowEaselHost.prototype._sendRegisterFontResponse = function (requestId, result) {
                    this._playerWindow.postMessage({
                        type: 'registerFontResponse',
                        requestId: requestId,
                        result: result
                    }, '*');
                };
                WindowEaselHost.prototype._sendRegisterImageResponse = function (requestId, result) {
                    this._playerWindow.postMessage({
                        type: 'registerImageResponse',
                        requestId: requestId,
                        result: result
                    }, '*');
                };
                WindowEaselHost.prototype.onWindowMessage = function (data, async) {
                    if (async === void 0) { async = true; }
                    if (typeof data === 'object' && data !== null) {
                        if (data.type === 'player') {
                            var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
                            if (async) {
                                this.processUpdates(updates, data.assets);
                            }
                            else {
                                var output = new DataBuffer();
                                this.processUpdates(updates, data.assets, output);
                                data.result = output.toPlainObject();
                            }
                        }
                        else if (data.type === 'frame') {
                            this.processFrame();
                        }
                        else if (data.type === 'videoControl') {
                            data.result = this.processVideoControl(data.id, data.eventType, data.data);
                        }
                        else if (data.type === 'registerFont') {
                            this.processRegisterFont(data.syncId, data.data, this._sendRegisterFontResponse.bind(this, data.requestId));
                        }
                        else if (data.type === 'registerImage') {
                            this.processRegisterImage(data.syncId, data.symbolId, data.imageType, data.data, this._sendRegisterImageResponse.bind(this, data.requestId));
                        }
                        else if (data.type === 'fscommand') {
                            this.processFSCommand(data.command, data.args);
                        }
                        else if (data.type === 'timelineResponse' && data.timeline) {
                            // Transform timeline into a Timeline object.
                            data.timeline.__proto__ = TimelineBuffer.prototype;
                            data.timeline._marks.__proto__ = CircularBuffer.prototype;
                            data.timeline._times.__proto__ = CircularBuffer.prototype;
                            this._timelineRequests[data.request](data.timeline);
                        }
                        else {
                        }
                    }
                };
                return WindowEaselHost;
            })(GFX.EaselHost);
            Window.WindowEaselHost = WindowEaselHost;
        })(Window = GFX.Window || (GFX.Window = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Test;
        (function (Test) {
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var TestEaselHost = (function (_super) {
                __extends(TestEaselHost, _super);
                function TestEaselHost(easel) {
                    _super.call(this, easel);
                    // TODO this is temporary worker to test postMessage tranfers
                    this._worker = Shumway.Player.Test.FakeSyncWorker.instance;
                    this._worker.addEventListener('message', this._onWorkerMessage.bind(this));
                    this._worker.addEventListener('syncmessage', this._onSyncWorkerMessage.bind(this));
                }
                TestEaselHost.prototype.onSendUpdates = function (updates, assets) {
                    var bytes = updates.getBytes();
                    this._worker.postMessage({
                        type: 'gfx',
                        updates: bytes,
                        assets: assets
                    }, [bytes.buffer]);
                };
                TestEaselHost.prototype.onDisplayParameters = function (params) {
                    this._worker.postMessage({
                        type: 'displayParameters',
                        params: params
                    });
                };
                TestEaselHost.prototype.onVideoPlaybackEvent = function (id, eventType, data) {
                    this._worker.postMessage({
                        type: 'videoPlayback',
                        id: id,
                        eventType: eventType,
                        data: data
                    });
                };
                TestEaselHost.prototype.requestTimeline = function (type, cmd) {
                    var buffer;
                    switch (type) {
                        case 'AVM2':
                            buffer = Shumway.AVM2.timelineBuffer;
                            break;
                        case 'Player':
                            buffer = Shumway.Player.timelineBuffer;
                            break;
                        case 'SWF':
                            buffer = Shumway.SWF.timelineBuffer;
                            break;
                    }
                    if (cmd === 'clear' && buffer) {
                        buffer.reset();
                    }
                    return Promise.resolve(buffer);
                };
                TestEaselHost.prototype._sendRegisterFontResponse = function (requestId, result) {
                    this._worker.postMessage({
                        type: 'registerFontResponse',
                        requestId: requestId,
                        result: result
                    });
                };
                TestEaselHost.prototype._sendRegisterImageResponse = function (requestId, result) {
                    this._worker.postMessage({
                        type: 'registerImageResponse',
                        requestId: requestId,
                        result: result
                    });
                };
                TestEaselHost.prototype._onWorkerMessage = function (e, async) {
                    if (async === void 0) { async = true; }
                    var data = e.data;
                    if (typeof data !== 'object' || data === null) {
                        return;
                    }
                    var type = data.type;
                    switch (type) {
                        case 'player':
                            var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
                            if (async) {
                                this.processUpdates(updates, data.assets);
                            }
                            else {
                                var output = new DataBuffer();
                                this.processUpdates(updates, data.assets, output);
                                e.result = output.toPlainObject();
                                e.handled = true;
                            }
                            break;
                        case 'frame':
                            this.processFrame();
                            break;
                        case 'videoControl':
                            e.result = this.processVideoControl(data.id, data.eventType, data.data);
                            e.handled = true;
                            break;
                        case 'registerFont':
                            this.processRegisterFont(data.syncId, data.data, this._sendRegisterFontResponse.bind(this, data.requestId));
                            e.handled = true;
                            break;
                        case 'registerImage':
                            this.processRegisterImage(data.syncId, data.symbolId, data.imageType, data.data, this._sendRegisterImageResponse.bind(this, data.requestId));
                            e.handled = true;
                            break;
                        case 'fscommand':
                            this.processFSCommand(data.command, data.args);
                            break;
                        default:
                    }
                };
                TestEaselHost.prototype._onSyncWorkerMessage = function (e) {
                    return this._onWorkerMessage(e, false);
                };
                return TestEaselHost;
            })(GFX.EaselHost);
            Test.TestEaselHost = TestEaselHost;
        })(Test = GFX.Test || (GFX.Test = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Test;
        (function (Test) {
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var PlainObjectDataBuffer = Shumway.ArrayUtilities.PlainObjectDataBuffer;
            var MovieRecordObjectType;
            (function (MovieRecordObjectType) {
                MovieRecordObjectType[MovieRecordObjectType["Undefined"] = 0] = "Undefined";
                MovieRecordObjectType[MovieRecordObjectType["Null"] = 1] = "Null";
                MovieRecordObjectType[MovieRecordObjectType["True"] = 2] = "True";
                MovieRecordObjectType[MovieRecordObjectType["False"] = 3] = "False";
                MovieRecordObjectType[MovieRecordObjectType["Number"] = 4] = "Number";
                MovieRecordObjectType[MovieRecordObjectType["String"] = 5] = "String";
                MovieRecordObjectType[MovieRecordObjectType["Array"] = 6] = "Array";
                MovieRecordObjectType[MovieRecordObjectType["Object"] = 7] = "Object";
                MovieRecordObjectType[MovieRecordObjectType["ArrayBuffer"] = 8] = "ArrayBuffer";
                MovieRecordObjectType[MovieRecordObjectType["Uint8Array"] = 9] = "Uint8Array";
                MovieRecordObjectType[MovieRecordObjectType["PlainObjectDataBufferLE"] = 10] = "PlainObjectDataBufferLE";
                MovieRecordObjectType[MovieRecordObjectType["PlainObjectDataBufferBE"] = 11] = "PlainObjectDataBufferBE";
                MovieRecordObjectType[MovieRecordObjectType["Int32Array"] = 12] = "Int32Array";
            })(MovieRecordObjectType || (MovieRecordObjectType = {}));
            function writeUint8Array(buffer, data) {
                buffer.writeInt(data.length);
                buffer.writeRawBytes(data);
            }
            function serializeObj(obj) {
                function serialize(item) {
                    switch (typeof item) {
                        case 'undefined':
                            buffer.writeByte(0 /* Undefined */);
                            break;
                        case 'boolean':
                            buffer.writeByte(item ? 2 /* True */ : 3 /* False */);
                            break;
                        case 'number':
                            buffer.writeByte(4 /* Number */);
                            buffer.writeDouble(item);
                            break;
                        case 'string':
                            buffer.writeByte(5 /* String */);
                            buffer.writeUTF(item);
                            break;
                        default:
                            if (item === null) {
                                buffer.writeByte(1 /* Null */);
                                break;
                            }
                            if (Array.isArray(item) && (item instanceof Int32Array)) {
                                buffer.writeByte(6 /* Array */);
                                buffer.writeInt(item.length);
                                for (var i = 0; i < item.length; i++) {
                                    serialize(item[i]);
                                }
                            }
                            else if (item instanceof Uint8Array) {
                                buffer.writeByte(9 /* Uint8Array */);
                                writeUint8Array(buffer, item);
                            }
                            else if (('length' in item) && ('buffer' in item) && ('littleEndian' in item)) {
                                buffer.writeByte(item.littleEndian ? 10 /* PlainObjectDataBufferLE */ : 11 /* PlainObjectDataBufferBE */);
                                writeUint8Array(buffer, new Uint8Array(item.buffer, 0, item.length));
                            }
                            else if (item instanceof ArrayBuffer) {
                                buffer.writeByte(8 /* ArrayBuffer */);
                                writeUint8Array(buffer, new Uint8Array(item));
                            }
                            else if (item instanceof Int32Array) {
                                buffer.writeByte(12 /* Int32Array */);
                                writeUint8Array(buffer, new Uint8Array(item.buffer, item.byteOffset, item.byteLength));
                            }
                            else {
                                if (item.buffer instanceof ArrayBuffer && (typeof item.byteOffset === 'number')) {
                                    throw new Error('Some unsupported TypedArray is used');
                                }
                                buffer.writeByte(7 /* Object */);
                                for (var key in item) {
                                    buffer.writeUTF(key);
                                    serialize(item[key]);
                                }
                                buffer.writeUTF('');
                            }
                            break;
                    }
                }
                var buffer = new DataBuffer();
                serialize(obj);
                return buffer.getBytes();
            }
            (function (MovieRecordType) {
                MovieRecordType[MovieRecordType["None"] = 0] = "None";
                MovieRecordType[MovieRecordType["PlayerCommand"] = 1] = "PlayerCommand";
                MovieRecordType[MovieRecordType["PlayerCommandAsync"] = 2] = "PlayerCommandAsync";
                MovieRecordType[MovieRecordType["Frame"] = 3] = "Frame";
                MovieRecordType[MovieRecordType["Font"] = 4] = "Font";
                MovieRecordType[MovieRecordType["Image"] = 5] = "Image";
                MovieRecordType[MovieRecordType["FSCommand"] = 6] = "FSCommand";
            })(Test.MovieRecordType || (Test.MovieRecordType = {}));
            var MovieRecordType = Test.MovieRecordType;
            var MovieRecorder = (function () {
                function MovieRecorder(maxRecordingSize) {
                    this._maxRecordingSize = maxRecordingSize;
                    this._recording = new DataBuffer();
                    this._recordingStarted = Date.now();
                    this._recording.writeRawBytes(new Uint8Array([0x4D, 0x53, 0x57, 0x46]));
                    this._stopped = false;
                }
                MovieRecorder.prototype.stop = function () {
                    this._stopped = true;
                };
                MovieRecorder.prototype.getRecording = function () {
                    return new Blob([this._recording.getBytes()], { type: 'application/octet-stream' });
                };
                MovieRecorder.prototype.dump = function () {
                    var parser = new MovieRecordParser(this._recording.getBytes());
                    parser.dump();
                };
                MovieRecorder.prototype._createRecord = function (type, buffer) {
                    if (this._stopped) {
                        return;
                    }
                    if (this._recording.length + 8 + (buffer ? buffer.length : 0) >= this._maxRecordingSize) {
                        console.error('Recording limit reached');
                        this._stopped = true;
                        return;
                    }
                    this._recording.writeInt(Date.now() - this._recordingStarted);
                    this._recording.writeInt(type);
                    if (buffer !== null) {
                        this._recording.writeInt(buffer.length);
                        this._recording.writeRawBytes(buffer.getBytes());
                    }
                    else {
                        this._recording.writeInt(0);
                    }
                };
                MovieRecorder.prototype.recordPlayerCommand = function (async, updates, assets) {
                    var buffer = new DataBuffer();
                    writeUint8Array(buffer, updates);
                    buffer.writeInt(assets.length);
                    assets.forEach(function (a) {
                        var data = serializeObj(a);
                        writeUint8Array(buffer, data);
                    });
                    this._createRecord(async ? 2 /* PlayerCommandAsync */ : 1 /* PlayerCommand */, buffer);
                };
                MovieRecorder.prototype.recordFrame = function () {
                    this._createRecord(3 /* Frame */, null);
                };
                MovieRecorder.prototype.recordFont = function (syncId, data) {
                    var buffer = new DataBuffer();
                    buffer.writeInt(syncId);
                    writeUint8Array(buffer, data);
                    this._createRecord(4 /* Font */, buffer);
                };
                MovieRecorder.prototype.recordImage = function (syncId, symbolId, imageType, data) {
                    var buffer = new DataBuffer();
                    buffer.writeInt(syncId);
                    buffer.writeInt(symbolId);
                    buffer.writeInt(imageType);
                    writeUint8Array(buffer, data);
                    this._createRecord(5 /* Image */, buffer);
                };
                MovieRecorder.prototype.recordFSCommand = function (command, args) {
                    var buffer = new DataBuffer();
                    buffer.writeUTF(command);
                    buffer.writeUTF(args || '');
                    this._createRecord(6 /* FSCommand */, buffer);
                };
                return MovieRecorder;
            })();
            Test.MovieRecorder = MovieRecorder;
            function readUint8Array(buffer) {
                var data = new DataBuffer();
                var length = buffer.readInt();
                buffer.readBytes(data, 0, length);
                return data.getBytes();
            }
            function deserializeObj(source) {
                var buffer = new DataBuffer();
                var length = source.readInt();
                source.readBytes(buffer, 0, length);
                return deserializeObjImpl(buffer);
            }
            function deserializeObjImpl(buffer) {
                var type = buffer.readByte();
                switch (type) {
                    case 0 /* Undefined */:
                        return undefined;
                    case 1 /* Null */:
                        return null;
                    case 2 /* True */:
                        return true;
                    case 3 /* False */:
                        return false;
                    case 4 /* Number */:
                        return buffer.readDouble();
                    case 5 /* String */:
                        return buffer.readUTF();
                    case 6 /* Array */:
                        var arr = [];
                        var length = buffer.readInt();
                        for (var i = 0; i < length; i++) {
                            arr[i] = deserializeObjImpl(buffer);
                        }
                        return arr;
                    case 7 /* Object */:
                        var obj = {};
                        var key;
                        while ((key = buffer.readUTF())) {
                            obj[key] = deserializeObjImpl(buffer);
                        }
                        return obj;
                    case 8 /* ArrayBuffer */:
                        return readUint8Array(buffer).buffer;
                    case 9 /* Uint8Array */:
                        return readUint8Array(buffer);
                    case 11 /* PlainObjectDataBufferBE */:
                    case 10 /* PlainObjectDataBufferLE */:
                        var data = readUint8Array(buffer);
                        return new PlainObjectDataBuffer(data.buffer, data.length, type === 10 /* PlainObjectDataBufferLE */);
                    case 12 /* Int32Array */:
                        return new Int32Array(readUint8Array(buffer).buffer);
                }
            }
            var MovieRecordParser = (function () {
                function MovieRecordParser(data) {
                    this._buffer = new DataBuffer();
                    this._buffer.writeRawBytes(data);
                    this._buffer.position = 4;
                }
                MovieRecordParser.prototype.readNextRecord = function () {
                    if (this._buffer.position >= this._buffer.length) {
                        return 0 /* None */;
                    }
                    var timestamp = this._buffer.readInt();
                    var type = this._buffer.readInt();
                    var length = this._buffer.readInt();
                    var data = null;
                    if (length > 0) {
                        data = new DataBuffer();
                        this._buffer.readBytes(data, 0, length);
                    }
                    this.currentTimestamp = timestamp;
                    this.currentType = type;
                    this.currentData = data;
                    return type;
                };
                MovieRecordParser.prototype.parsePlayerCommand = function () {
                    var updates = readUint8Array(this.currentData);
                    var assetsLength = this.currentData.readInt();
                    var assets = [];
                    for (var i = 0; i < assetsLength; i++) {
                        assets.push(deserializeObj(this.currentData));
                    }
                    return { updates: updates, assets: assets };
                };
                MovieRecordParser.prototype.parseFSCommand = function () {
                    var command = this.currentData.readUTF();
                    var args = this.currentData.readUTF();
                    return { command: command, args: args };
                };
                MovieRecordParser.prototype.parseFont = function () {
                    var syncId = this.currentData.readInt();
                    var data = deserializeObj(this.currentData);
                    return { syncId: syncId, data: data };
                };
                MovieRecordParser.prototype.parseImage = function () {
                    var syncId = this.currentData.readInt();
                    var symbolId = this.currentData.readInt();
                    var imageType = this.currentData.readInt();
                    var data = deserializeObj(this.currentData);
                    return { syncId: syncId, symbolId: symbolId, imageType: imageType, data: data };
                };
                MovieRecordParser.prototype.dump = function () {
                    var type;
                    while ((type = this.readNextRecord())) {
                        console.log('record ' + type + ' @' + this.currentTimestamp);
                        debugger;
                        switch (type) {
                            case 1 /* PlayerCommand */:
                            case 2 /* PlayerCommandAsync */:
                                console.log(this.parsePlayerCommand());
                                break;
                            case 6 /* FSCommand */:
                                console.log(this.parseFSCommand());
                                break;
                            case 4 /* Font */:
                                console.log(this.parseFont());
                                break;
                            case 5 /* Image */:
                                console.log(this.parseImage());
                                break;
                        }
                    }
                };
                return MovieRecordParser;
            })();
            Test.MovieRecordParser = MovieRecordParser;
        })(Test = GFX.Test || (GFX.Test = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Test;
        (function (Test) {
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var MINIMAL_TIMER_INTERVAL = 5;
            var PlaybackEaselHost = (function (_super) {
                __extends(PlaybackEaselHost, _super);
                function PlaybackEaselHost(easel) {
                    _super.call(this, easel);
                    this.ignoreTimestamps = false;
                    this.alwaysRenderFrame = false;
                    this.cpuTimeUpdates = 0;
                    this.cpuTimeRendering = 0;
                    this.onComplete = null;
                }
                Object.defineProperty(PlaybackEaselHost.prototype, "cpuTime", {
                    get: function () {
                        return this.cpuTimeUpdates + this.cpuTimeRendering;
                    },
                    enumerable: true,
                    configurable: true
                });
                PlaybackEaselHost.prototype.playUrl = function (url) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.responseType = 'arraybuffer';
                    xhr.onload = function () {
                        this.playBytes(new Uint8Array(xhr.response));
                    }.bind(this);
                    xhr.send();
                };
                PlaybackEaselHost.prototype.playBytes = function (data) {
                    this._parser = new Test.MovieRecordParser(data);
                    this._lastTimestamp = 0;
                    this._parseNext();
                };
                PlaybackEaselHost.prototype.onSendUpdates = function (updates, assets) {
                    // Ignoring
                };
                PlaybackEaselHost.prototype.onDisplayParameters = function (params) {
                    // Ignoring
                };
                PlaybackEaselHost.prototype.onVideoPlaybackEvent = function (id, eventType, data) {
                    // Ignoring
                };
                PlaybackEaselHost.prototype.requestTimeline = function (type, cmd) {
                    return Promise.resolve(undefined);
                };
                PlaybackEaselHost.prototype._parseNext = function () {
                    var type = this._parser.readNextRecord();
                    if (type !== 0 /* None */) {
                        var runRecordBound = this._runRecord.bind(this);
                        var interval = this._parser.currentTimestamp - this._lastTimestamp;
                        this._lastTimestamp = this._parser.currentTimestamp;
                        if (interval < MINIMAL_TIMER_INTERVAL) {
                            // Records are too close to each other, running on next script turn.
                            Promise.resolve(undefined).then(runRecordBound);
                        }
                        else if (this.ignoreTimestamps) {
                            setTimeout(runRecordBound);
                        }
                        else {
                            setTimeout(runRecordBound, interval);
                        }
                    }
                    else {
                        if (this.onComplete) {
                            this.onComplete();
                        }
                    }
                };
                PlaybackEaselHost.prototype._runRecord = function () {
                    var data;
                    var start = performance.now();
                    switch (this._parser.currentType) {
                        case 1 /* PlayerCommand */:
                        case 2 /* PlayerCommandAsync */:
                            data = this._parser.parsePlayerCommand();
                            var async = this._parser.currentType === 2 /* PlayerCommandAsync */;
                            var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
                            if (async) {
                                this.processUpdates(updates, data.assets);
                            }
                            else {
                                var output = new DataBuffer();
                                this.processUpdates(updates, data.assets, output);
                            }
                            break;
                        case 3 /* Frame */:
                            this.processFrame();
                            break;
                        case 4 /* Font */:
                            data = this._parser.parseFont();
                            this.processRegisterFont(data.syncId, data.data, function () {
                            });
                            break;
                        case 5 /* Image */:
                            data = this._parser.parseImage();
                            this.processRegisterImage(data.syncId, data.symbolId, data.imageType, data.data, function () {
                            });
                            break;
                        case 6 /* FSCommand */:
                            data = this._parser.parseFSCommand();
                            this.processFSCommand(data.command, data.args);
                            break;
                        default:
                            throw new Error('Invalid movie record type');
                    }
                    this.cpuTimeUpdates += performance.now() - start;
                    if (this._parser.currentType === 3 /* Frame */ && this.alwaysRenderFrame) {
                        requestAnimationFrame(this._renderFrameJustAfterRAF.bind(this));
                    }
                    else {
                        this._parseNext();
                    }
                };
                PlaybackEaselHost.prototype._renderFrameJustAfterRAF = function () {
                    var start = performance.now();
                    this.easel.render();
                    this.cpuTimeRendering += performance.now() - start;
                    this._parseNext();
                };
                return PlaybackEaselHost;
            })(GFX.EaselHost);
            Test.PlaybackEaselHost = PlaybackEaselHost;
        })(Test = GFX.Test || (GFX.Test = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/**
 * Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Test;
        (function (Test) {
            var RecordingEaselHost = (function (_super) {
                __extends(RecordingEaselHost, _super);
                function RecordingEaselHost(easel, recordingLimit) {
                    if (recordingLimit === void 0) { recordingLimit = 0; }
                    _super.call(this, easel);
                    this._recorder = null;
                    this._recorder = new Test.MovieRecorder(recordingLimit);
                }
                Object.defineProperty(RecordingEaselHost.prototype, "recorder", {
                    get: function () {
                        return this._recorder;
                    },
                    enumerable: true,
                    configurable: true
                });
                RecordingEaselHost.prototype._onWorkerMessage = function (e, async) {
                    if (async === void 0) { async = true; }
                    var data = e.data;
                    if (typeof data !== 'object' || data === null) {
                        return;
                    }
                    var type = data.type;
                    switch (type) {
                        case 'player':
                            this._recorder.recordPlayerCommand(async, data.updates, data.assets);
                            break;
                        case 'frame':
                            this._recorder.recordFrame();
                            break;
                        case 'registerFont':
                            this._recorder.recordFont(data.syncId, data.data);
                            break;
                        case 'registerImage':
                            this._recorder.recordImage(data.syncId, data.symbolId, data.imageType, data.data);
                            break;
                        case 'fscommand':
                            this._recorder.recordFSCommand(data.command, data.args);
                            break;
                    }
                    _super.prototype._onWorkerMessage.call(this, e, async);
                };
                return RecordingEaselHost;
            })(Test.TestEaselHost);
            Test.RecordingEaselHost = RecordingEaselHost;
        })(Test = GFX.Test || (GFX.Test = {}));
    })(GFX = Shumway.GFX || (Shumway.GFX = {}));
})(Shumway || (Shumway = {}));
/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference path='../../build/ts/base.d.ts' />
/// <reference path='../../build/ts/tools.d.ts' />
/// <reference path='../../build/ts/gfx-base.d.ts' />
/// <reference path='gl/glContext.ts'/>
/// <reference path='gl/core.ts'/>
/// <reference path='gl/surface.ts'/>
/// <reference path='gl/gl.ts'/>
/// <reference path='gl/brush.ts'/>
/// <reference path='2d/debug.ts'/>
/// <reference path='2d/surface.ts'/>
/// <reference path='2d/2d.ts'/>
/// <reference path='easel.ts'/>
/// <reference path='debug/tree.ts'/>
/// <reference path='remotingGfx.ts' />
/// <reference path='easelHost.ts' />
/// <reference path='window/windowEaselHost.ts' />
/// <reference path='test/testEaselHost.ts' />
/// <reference path='test/recorder.ts' />
/// <reference path='test/playbackEaselHost.ts' />
/// <reference path='test/recordingEaselHost.ts' />
//# sourceMappingURL=gfx.js.map