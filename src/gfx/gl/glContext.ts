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
module Shumway.GFX.WebGL {
  import Point = Geometry.Point;
  import Point3D = Geometry.Point3D;
  import Matrix = Geometry.Matrix;
  import Matrix3D = Geometry.Matrix3D;
  import Rectangle = Geometry.Rectangle;

  import radianToDegrees = Geometry.radianToDegrees;
  import degreesToRadian = Geometry.degreesToRadian;

  import assert = Shumway.Debug.assert;
  import unexpected = Shumway.Debug.unexpected;
  import notImplemented = Shumway.Debug.notImplemented;

  export var SHADER_ROOT = "shaders/";

  function endsWith(str, end) {
    return str.indexOf(end, this.length - end.length) !== -1;
  }

  export class WebGLContext {
    private static MAX_SURFACES = 8;

    public gl: WebGLRenderingContext;
    private _canvas: HTMLCanvasElement;
    private _options: WebGLRendererOptions;
    private _w: number;
    private _h: number;
    private _programCache: {};
    private _maxSurfaces: number;
    private _maxSurfaceSize: number;
    public _backgroundColor: Color;

    private _geometry: WebGLGeometry;
    private _tmpVertices: Vertex [];
    private _fillColor: Color = Color.Red;

    _surfaceRegionCache: any = new LRUList<WebGLSurfaceRegion>();

    public modelViewProjectionMatrix: Matrix3D = Matrix3D.createIdentity();

    get surfaces(): WebGLSurface [] {
      return <WebGLSurface []>(this._surfaceRegionAllocator.surfaces);
    }

    set fillStyle(value: any) {
      this._fillColor.set(Color.parseColor(value));
    }

    private _surfaceRegionAllocator: SurfaceRegionAllocator.ISurfaceRegionAllocator;

    constructor (canvas: HTMLCanvasElement, options: WebGLRendererOptions) {
      this._canvas = canvas;
      this._options = options;
      this.gl = <WebGLRenderingContext> (
        canvas.getContext("experimental-webgl", {
          // preserveDrawingBuffer: true,
          preserveDrawingBuffer: false,
          antialias: true,
          stencil: true,
          premultipliedAlpha: false
        })
      );
      release || assert (this.gl, "Cannot create WebGL context.");
      this._programCache = Object.create(null);
      this._resize();
      this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.unpackPremultiplyAlpha ? this.gl.ONE : this.gl.ZERO);
      this._backgroundColor = Color.Black;

      this._geometry = new WebGLGeometry(this);
      this._tmpVertices = Vertex.createEmptyVertices(Vertex, 64);

      this._maxSurfaces = options.maxSurfaces;
      this._maxSurfaceSize = options.maxSurfaceSize;

      // this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.enable(this.gl.BLEND);
      // this.gl.enable(this.gl.DEPTH_TEST);
      this.modelViewProjectionMatrix = Matrix3D.create2DProjection(this._w, this._h, 2000);

      var self = this;
      this._surfaceRegionAllocator = new SurfaceRegionAllocator.SimpleAllocator (
        function () {
          var texture = self._createTexture(1024, 1024);
          return new WebGLSurface(1024, 1024, texture);
        }
      );
    }

    public setBlendMode (value: BlendMode) {
      var gl = this.gl;
      switch (value) {
        case BlendMode.Add:
          gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
          break;
        case BlendMode.Multiply:
          gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
          break;
        case BlendMode.Screen:
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
          break;
        case BlendMode.Layer:
        case BlendMode.Normal:
          gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
          break;
        default:
          notImplemented("Blend Mode: " + value);
      }
    }

    public setBlendOptions() {
      this.gl.blendFunc(this._options.sourceBlendFactor, this._options.destinationBlendFactor);
    }

    /**
     * Whether the blend mode can be performed using |blendFunc|.
     */
    public static glSupportedBlendMode(value: BlendMode) {
      switch (value) {
        case BlendMode.Add:
        case BlendMode.Multiply:
        case BlendMode.Screen:
        case BlendMode.Normal:
          return true;
        default:
          return false;
      }
    }

    public create2DProjectionMatrix(): Matrix3D {
      return Matrix3D.create2DProjection(this._w, this._h, -this._w);
    }

    public createPerspectiveMatrix(cameraDistance: number, fov: number, angle: number): Matrix3D {
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
    }

    private discardCachedImages() {
      traceLevel >= TraceLevel.Verbose && writer && writer.writeLn("Discard Cache");
      var count = this._surfaceRegionCache.count / 2 | 0;
      for (var i = 0; i < count; i++) {
        var surfaceRegion = this._surfaceRegionCache.pop();
        traceLevel >= TraceLevel.Verbose && writer && writer.writeLn("Discard: " + surfaceRegion);
        surfaceRegion.texture.atlas.remove(surfaceRegion.region);
        surfaceRegion.texture = null;
      }
    }

    public cacheImage(image: any): WebGLSurfaceRegion {
      var w = image.width;
      var h = image.height;
      var surfaceRegion = this.allocateSurfaceRegion(w, h);
      traceLevel >= TraceLevel.Verbose && writer && writer.writeLn("Uploading Image: @ " + surfaceRegion.region);
      this._surfaceRegionCache.use(surfaceRegion);
      this.updateSurfaceRegion(image, surfaceRegion);
      return surfaceRegion;
    }

    public allocateSurfaceRegion(w: number, h: number, discardCache: boolean = true): WebGLSurfaceRegion {
      return <WebGLSurfaceRegion>this._surfaceRegionAllocator.allocate(w, h);
    }

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

    public updateSurfaceRegion(image: any, surfaceRegion: WebGLSurfaceRegion) {
      var gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, surfaceRegion.surface.texture);
      enterTimeline("texSubImage2D");
      gl.texSubImage2D(gl.TEXTURE_2D, 0, surfaceRegion.region.x, surfaceRegion.region.y, gl.RGBA, gl.UNSIGNED_BYTE, image);
      leaveTimeline("texSubImage2D");
    }

    _resize() {
      var gl = this.gl;
      this._w = this._canvas.width;
      this._h = this._canvas.height;
      gl.viewport(0, 0, this._w, this._h);
      for (var k in this._programCache) {
        this._initializeProgram(this._programCache[k]);
      }
    }

    private _initializeProgram(program: WebGLProgram) {
      var gl = this.gl;
      gl.useProgram(program);
      // gl.uniform2f(program.uniforms.uResolution.location, this._w, this._h);
    }

    private _createShaderFromFile(file: string) {
      var path = SHADER_ROOT + file;
      var gl = this.gl;
      var request = new XMLHttpRequest();
      request.open("GET", path, false);
      request.send();
      release || assert (request.status === 200 || request.status === 0, "File : " + path + " not found.");
      var shaderType;
      if (endsWith(path, ".vert")) {
        shaderType = gl.VERTEX_SHADER;
      } else if (endsWith(path, ".frag")) {
        shaderType = gl.FRAGMENT_SHADER;
      } else {
        throw "Shader Type: not supported.";
      }
      return this._createShader(shaderType, request.responseText);
    }

    public createProgramFromFiles(vertex: string, fragment: string) {
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
    }

    private _createProgram(shaders): WebGLProgram {
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
    }

    private _createShader(shaderType, shaderSource): WebGLShader {
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
    }

    private _createTexture(w: number, h: number): WebGLTexture {
      var gl = this.gl;
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      return texture;
    }

    private _createFramebuffer(texture: WebGLTexture): WebGLFramebuffer {
      var gl = this.gl;
      var framebuffer: WebGLFramebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return framebuffer;
    }

    private _queryProgramAttributesAndUniforms(program) {
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
    }

    public set target(surface: WebGLSurface) {
      var gl = this.gl;
      if (surface) {
        gl.viewport(0, 0, surface.w, surface.h);
        gl.bindFramebuffer(gl.FRAMEBUFFER, surface.framebuffer);
      } else {
        gl.viewport(0, 0, this._w, this._h);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    }

    public clear(color: Color = Color.None) {
      var gl = this.gl;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    public clearTextureRegion(surfaceRegion: WebGLSurfaceRegion, color: Color = Color.None) {
      var gl = this.gl;
      var region = surfaceRegion.region;
      this.target = surfaceRegion.surface;
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(region.x, region.y, region.w, region.h);
      gl.clearColor(color.r, color.g, color.b, color.a);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.SCISSOR_TEST);
    }

    public sizeOf(type): number {
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
    }
  }
}
