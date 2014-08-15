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
  import Color = Shumway.Color;
  import Point = Geometry.Point;
  import Matrix = Geometry.Matrix;
  import Matrix3D = Geometry.Matrix3D;
  import Rectangle = Geometry.Rectangle;

  export class WebGLBrush {
    _target: WebGLSurface;
    _context: WebGLContext;
    _geometry: WebGLGeometry;

    constructor(context: WebGLContext, geometry: WebGLGeometry, target: WebGLSurface) {
      this._target = target;
      this._context = context;
      this._geometry = geometry;
    }

    public reset() {
      Shumway.Debug.abstractMethod("reset");
    }

    public flush() {
      Shumway.Debug.abstractMethod("flush");
    }

    public set target(target: WebGLSurface) {
      if (this._target !== target) {
        this.flush();
      }
      this._target = target;
    }

    public get target(): WebGLSurface {
      return this._target;
    }
  }

  export enum WebGLCombinedBrushKind {
    FillColor,
    FillTexture,
    FillTextureWithColorMatrix
  }

  export class WebGLCombinedBrushVertex extends Vertex {
    static attributeList: WebGLAttributeList;
    static initializeAttributeList(context) {
      var gl = context.gl;
      if (WebGLCombinedBrushVertex.attributeList) {
        return;
      }
      WebGLCombinedBrushVertex.attributeList = new WebGLAttributeList([
        new WebGLAttribute("aPosition", 3, gl.FLOAT),
        new WebGLAttribute("aCoordinate", 2, gl.FLOAT),
        new WebGLAttribute("aColor", 4, gl.UNSIGNED_BYTE, true),
        new WebGLAttribute("aKind", 1, gl.FLOAT),
        new WebGLAttribute("aSampler", 1, gl.FLOAT)
      ]);
      WebGLCombinedBrushVertex.attributeList.initialize(context);
    }
    kind: WebGLCombinedBrushKind = WebGLCombinedBrushKind.FillColor;
    color: Color = new Color(0, 0, 0, 0);
    sampler: number = 0;
    coordinate: Point = new Point(0, 0);
    constructor (x: number, y: number, z: number) {
      super(x, y, z);
    }
    public writeTo(geometry: WebGLGeometry) {
      var array = geometry.array;
      array.ensureAdditionalCapacity(68);
      array.writeVertex3DUnsafe(this.x, this.y, this.z);
      array.writeVertexUnsafe(this.coordinate.x, this.coordinate.y);
      array.writeColorUnsafe(this.color.r * 255, this.color.g * 255, this.color.b * 255, this.color.a * 255);
      array.writeFloatUnsafe(this.kind);
      array.writeFloatUnsafe(this.sampler);
    }
  }

  export class WebGLCombinedBrush extends WebGLBrush {
    private static _tmpVertices: WebGLCombinedBrushVertex [] = Vertex.createEmptyVertices(WebGLCombinedBrushVertex, 4);
    private _program: WebGLProgram;
    private _surfaces: WebGLSurface [];
    private _colorMatrix: ColorMatrix;
    private _blendMode: BlendMode = BlendMode.Normal;
    private static _depth: number = 1;
    constructor(context: WebGLContext, geometry: WebGLGeometry, target: WebGLSurface = null) {
      super(context, geometry, target);
      this._program = context.createProgramFromFiles("combined.vert", "combined.frag");
      this._surfaces = [];
      WebGLCombinedBrushVertex.initializeAttributeList(this._context);
    }

    public reset() {
      this._surfaces = [];
      this._geometry.reset();
    }

    public drawImage (
      src: WebGLSurfaceRegion,
      dstRectangle: Rectangle,
      color: Color,
      colorMatrix: ColorMatrix,
      matrix: Matrix,
      depth: number = 0,
      blendMode: BlendMode = BlendMode.Normal): boolean {

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
      matrix.transformRectangle(dstRectangle, <Point[]><any>tmpVertices);
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
        vertex.kind = colorMatrix ?
          WebGLCombinedBrushKind.FillTextureWithColorMatrix :
          WebGLCombinedBrushKind.FillTexture;
        vertex.color.set(color);
        vertex.sampler = sampler;
        vertex.writeTo(this._geometry);
      }
      this._geometry.addQuad();
      return true;
    }

    public fillRectangle(rectangle: Rectangle, color: Color, matrix: Matrix, depth: number = 0) {
      matrix.transformRectangle(rectangle, <Point[]><any>WebGLCombinedBrush._tmpVertices);
      for (var i = 0; i < 4; i++) {
        var vertex = WebGLCombinedBrush._tmpVertices[i];
        vertex.kind = WebGLCombinedBrushKind.FillColor;
        vertex.color.set(color);
        vertex.z = depth;
        vertex.writeTo(this._geometry);
      }
      this._geometry.addQuad();
    }

    public flush() {
      enterTimeline("WebGLCombinedBrush.flush");
      var g = this._geometry;
      var p = this._program;
      var gl = this._context.gl;
      var matrix;

      g.uploadBuffers();
      gl.useProgram(p);
      if (this._target) {
        matrix = Matrix3D.create2DProjection(this._target.w, this._target.h, 2000);
         matrix = Matrix3D.createMultiply(matrix, Matrix3D.createScale(1, -1, 1));
      } else {
        matrix = this._context.modelViewProjectionMatrix;
       }
      gl.uniformMatrix4fv(p.uniforms.uTransformMatrix3D.location, false, matrix.asWebGLMatrix());
      if (this._colorMatrix) {
        gl.uniformMatrix4fv(p.uniforms.uColorMatrix.location, false, this._colorMatrix.asWebGLMatrix());
        gl.uniform4fv(p.uniforms.uColorVector.location, this._colorMatrix.asWebGLVector());
      }
      // Bind textures.
      for (var i = 0; i < this._surfaces.length; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, this._surfaces[i].texture);
      }
      gl.uniform1iv(p.uniforms["uSampler[0]"].location, [0, 1, 2, 3, 4, 5, 6, 7]);
      // Bind vertex buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, g.buffer);
      var size = WebGLCombinedBrushVertex.attributeList.size;
      var attributeList = WebGLCombinedBrushVertex.attributeList;
      var attributes: WebGLAttribute [] = attributeList.attributes;
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
      leaveTimeline("WebGLCombinedBrush.flush");
    }
  }
}
