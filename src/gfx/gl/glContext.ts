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
module Shumway.GFX.GL {
  import Point = Geometry.Point;
  import Point3D = Geometry.Point3D;
  import Matrix = Geometry.Matrix;
  import Matrix3D = Geometry.Matrix3D;
  import Rectangle = Geometry.Rectangle;
  import RegionAllocator = Geometry.RegionAllocator;

  import radianToDegrees = Geometry.radianToDegrees;
  import degreesToRadian = Geometry.degreesToRadian;

  import notImplemented = Shumway.Debug.notImplemented;

  export var SHADER_ROOT = "shaders/";

  function endsWith(str, end) {
    return str.indexOf(end, this.length - end.length) !== -1;
  }

  export class WebGLContext {
    private static MAX_TEXTURES = 8;

    public gl: WebGLRenderingContext;
    private _canvas: HTMLCanvasElement;
    private _options: WebGLStageRendererOptions;
    private _w: number;
    private _h: number;
    private _programCache: {};
    private _maxTextures: number;
    private _maxTextureSize: number;
    public _backgroundColor: Color;

    private _geometry: WebGLGeometry;
    private _tmpVertices: Vertex [];
    private _fillColor: Color = Color.Red;

    private _textures: WebGLTexture [];
    textureRegionCache: any = new LRUList<WebGLTextureRegion>();

    private _isTextureMemoryAvailable:boolean = true;

    public modelViewProjectionMatrix: Matrix3D = Matrix3D.createIdentity();

    public isTextureMemoryAvailable() {
      return this._isTextureMemoryAvailable;
    }

    getTextures(): WebGLTexture [] {
      return this._textures;
    }

    scratch: WebGLTexture [];

    set fillStyle(value: any) {
      this._fillColor.set(Color.parseColor(value));
    }

    constructor (canvas: HTMLCanvasElement, options: WebGLStageRendererOptions) {
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
      assert (this.gl, "Cannot create WebGL context.");
      this._programCache = Object.create(null);
      canvas.addEventListener('resize', this.resize.bind(this), false);
      this.resize();
      this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.unpackPremultiplyAlpha ? this.gl.ONE : this.gl.ZERO);
      this._backgroundColor = Color.Black;

      this._geometry = new WebGLGeometry(this);
      this._tmpVertices = Vertex.createEmptyVertices(Vertex, 64);

      this._textures = [];
      this._maxTextures = options.maxTextures;
      this._maxTextureSize = options.maxTextureSize;

      // this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.enable(this.gl.BLEND);
      // this.gl.enable(this.gl.DEPTH_TEST);
      this.modelViewProjectionMatrix = Matrix3D.create2DProjection(this._w, this._h, 2000);
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
      traceLevel >= TraceLevel.Verbose && writer.writeLn("Discard Cache");
      var count = this.textureRegionCache.count / 2 | 0;
      for (var i = 0; i < count; i++) {
        var textureRegion = this.textureRegionCache.pop();
        traceLevel >= TraceLevel.Verbose && writer.writeLn("Discard: " + textureRegion);
        textureRegion.texture.atlas.remove(textureRegion.region);
        textureRegion.texture = null;
      }
    }

    public cacheImage(image: any): WebGLTextureRegion {
      var w = image.width;
      var h = image.height;
      var textureRegion = this.allocateTextureRegion(w, h);
      traceLevel >= TraceLevel.Verbose && writer.writeLn("Uploading Image: @ " + textureRegion.region);
      this.textureRegionCache.use(textureRegion);
      this.updateTextureRegion(image, textureRegion);
      return textureRegion;
    }

    public allocateTextureRegion(w: number, h: number, discardCache: boolean = true): WebGLTextureRegion {
      var imageIsTileSized = (w === h) && (w === TILE_SIZE);
      var texture, region;
      for (var i = 0; i < this._textures.length; i++) {
        texture = this._textures[i];
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
        } else if (this._textures.length === this._maxTextures) {
          if (discardCache) {
            this.discardCachedImages();
            return this.allocateTextureRegion(w, h, false);
          }
          return null;
        } else {
          texture = this.createTexture(this._maxTextureSize, this._maxTextureSize, !imageIsTileSized);
        }
        this._textures.push(texture);
        region = texture.atlas.add(null, w, h);
        assert (region);
      }
      return new WebGLTextureRegion(texture, region);
    }

    public freeTextureRegion(textureRegion: WebGLTextureRegion) {
      if (textureRegion.region instanceof RegionAllocator.Region) {
        var region = <RegionAllocator.Region>textureRegion.region;
        textureRegion.texture.atlas.remove(region);
      }
    }

    public updateTextureRegion(image: any, textureRegion: WebGLTextureRegion) {
      var gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, textureRegion.texture);
      enterTimeline("texSubImage2D");
      gl.texSubImage2D(gl.TEXTURE_2D, 0, textureRegion.region.x, textureRegion.region.y, gl.RGBA, gl.UNSIGNED_BYTE, image);
      leaveTimeline("texSubImage2D");
    }

    /**
     * Find a texture with available space.
     */
    private recycleTexture(): WebGLTexture {
      traceLevel >= TraceLevel.Verbose && writer.writeLn("Recycling Texture");
      // var texture: WebGLTexture = this._textures.shift();
      var texture: WebGLTexture = this._textures.splice(Math.random() * this._textures.length | 0, 1)[0];
      var regions = texture.regions;
      for (var i = 0; i < regions.length; i++) {
        regions[i].texture = null;
      }
      texture.atlas.reset();
      frameCount("evictTexture");
      return texture;
    }

    private resize() {
      var gl = this.gl;
      this._w = this._canvas.width;
      this._h = this._canvas.height;
      gl.viewport(0, 0, this._w, this._h);
      for (var k in this._programCache) {
        this.initializeProgram(this._programCache[k]);
      }
    }

    private initializeProgram(program: WebGLProgram) {
      var gl = this.gl;
      gl.useProgram(program);
      // gl.uniform2f(program.uniforms.uResolution.location, this._w, this._h);
    }

    private createShaderFromFile(file: string) {
      var path = SHADER_ROOT + file;
      var gl = this.gl;
      var request = new XMLHttpRequest();
      request.open("GET", path, false);
      request.send();
      assert (request.status === 200, "File : " + path + " not found.");
      var shaderType;
      if (endsWith(path, ".vert")) {
        shaderType = gl.VERTEX_SHADER;
      } else if (endsWith(path, ".frag")) {
        shaderType = gl.FRAGMENT_SHADER;
      } else {
        throw "Shader Type: not supported.";
      }
      return this.createShader(shaderType, request.responseText);
    }

    public createProgramFromFiles(vertex: string, fragment: string) {
      var key = vertex + "-" + fragment;
      var program = this._programCache[key];
      if (!program) {
        program = this.createProgram([
          this.createShaderFromFile(vertex),
          this.createShaderFromFile(fragment)
        ]);
        this.queryProgramAttributesAndUniforms(program);
        this.initializeProgram(program);
        this._programCache[key] = program;

      }
      return program;
    }

    private createProgram(shaders): WebGLProgram {
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

    private createShader(shaderType, shaderSource): WebGLShader {
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

    public createTexture(w: number, h: number, compact: boolean): WebGLTexture {
      var gl = this.gl;
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      texture.w = w;
      texture.h = h;
      texture.atlas = new WebGLTextureAtlas(this, texture, w, h, compact);
      texture.framebuffer = this.createFramebuffer(texture);
      texture.regions = [];
      return texture;
    }

    createFramebuffer(texture: WebGLTexture): WebGLFramebuffer {
      var gl = this.gl;
      var framebuffer: WebGLFramebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      return framebuffer;
    }

    private queryProgramAttributesAndUniforms(program) {
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

    public set target(target: WebGLTexture) {
      var gl = this.gl;
      if (target) {
        gl.viewport(0, 0, target.w, target.h);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
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

    public clearTextureRegion(textureRegion: WebGLTextureRegion, color: Color = Color.None) {
      var gl = this.gl;
      var region = textureRegion.region;
      this.target = textureRegion.texture;
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

    public beginPath() {

    }

    public closePath() {

    }

    public stroke() {

    }

    public rect() {

    }
  }
}