/// <reference path='../all.ts'/>
/// <reference path="../WebGL.d.ts" />

module Shumway.GL {
  var release = false;

  export class ArrayWriter extends Util.ArrayWriter {
    ensureVertexCapacity(count: number) {
      release || assert ((this.offset & 0x3) === 0);
      this.ensureCapacity(this.offset + count * 8);
    }

    writeVertex(x: number, y: number) {
      release || assert ((this.offset & 0x3) === 0);
      this.ensureCapacity(this.offset + 8);
      this.writeVertexUnsafe(x, y);
    }

    writeVertexUnsafe(x: number, y: number) {
      var index = this.offset >> 2;
      this.f32[index] = x;
      this.f32[index + 1] = y;
      this.offset += 8;
    }

    writeVertex3D(x: number, y: number, z: number) {
      release || assert ((this.offset & 0x3) === 0);
      this.ensureCapacity(this.offset + 12);
      this.writeVertex3DUnsafe(x, y, z);
    }

    writeVertex3DUnsafe(x: number, y: number, z: number) {
      var index = this.offset >> 2;
      this.f32[index] = x;
      this.f32[index + 1] = y;
      this.f32[index + 2] = z;
      this.offset += 12;
    }

    writeTriangleElements(a: number, b: number, c: number) {
      release || assert ((this.offset & 0x1) === 0);
      this.ensureCapacity(this.offset + 6);
      var index = this.offset >> 1;
      this.u16[index] = a;
      this.u16[index + 1] = b;
      this.u16[index + 2] = c;
      this.offset += 6;
    }

    ensureColorCapacity(count: number) {
      release || assert ((this.offset & 0x2) === 0);
      this.ensureCapacity(this.offset + count * 16);
    }

    writeColorFloats(r: number, g: number, b: number, a: number) {
      release || assert ((this.offset & 0x2) === 0);
      this.ensureCapacity(this.offset + 16);
      this.writeColorFloatsUnsafe(r, g, b, a);
    }

    writeColorFloatsUnsafe(r: number, g: number, b: number, a: number) {
      var index = this.offset >> 2;
      this.f32[index] = r;
      this.f32[index + 1] = g;
      this.f32[index + 2] = b;
      this.f32[index + 3] = a;
      this.offset += 16;
    }

    writeColor(r: number, g: number, b: number, a: number) {
      release || assert ((this.offset & 0x3) === 0);
      this.ensureCapacity(this.offset + 4);
      var index = this.offset >> 2;
      this.i32[index] = a << 24 | b << 16 | g << 8 | r;
      this.offset += 4;
    }

    writeColorUnsafe(r: number, g: number, b: number, a: number) {
      var index = this.offset >> 2;
      this.i32[index] = a << 24 | b << 16 | g << 8 | r;
      this.offset += 4;
    }

    writeRandomColor() {
      this.writeColor(Math.random(), Math.random(), Math.random(), Math.random() / 2);
    }
  }

  export class WebGLGeometryPosition {
    color: number;
    element : number;
    vertex : number;
    coordinate: number;
    triangles: number;
    constructor(triangles, element, vertex, coordinate, color) {
      this.triangles = triangles;
      this.element = element;
      this.vertex = vertex;
      this.coordinate = coordinate;
      this.color = color;
    }
    toString() {
      return "{" +
        "triangles: " + this.triangles + ", " +
        "element: " + this.element + ", " +
        "vertex: " + this.vertex + ", " +
        "coordinate: " + this.coordinate + ", " +
        "color: " + this.color + "}";
    }
  }

  export enum WebGLGeometryAttributeType {
    Vertex,
    Color,
    Index,
    I32,
  }

  export class WebGLAttributeList {
    attributes: WebGLAttribute [];
    size: number = 0;
    constructor(attributes: WebGLAttribute []) {
      this.attributes = attributes;
    }
    initialize(context: WebGLContext) {
      var offset = 0;
      for (var i = 0; i < this.attributes.length; i++) {
        this.attributes[i].offset = offset;
        offset += context.sizeOf(this.attributes[i].type) * this.attributes[i].size;
      }
      this.size = offset;
    }
  }

  export class WebGLAttribute {
    name: string;
    size: number;
    type: number;
    normalized: boolean;
    offset: number;

    constructor (name: string, size: number, type: number, normalized: boolean = false) {
      this.name = name;
      this.size = size;
      this.type = type;
      this.normalized = normalized;
    }
  }

  export class WebGLGeometry {
    array: ArrayWriter;
    buffer: WebGLBuffer;

    elementArray: ArrayWriter;
    elementBuffer: WebGLBuffer;

    context: WebGLContext;

    triangleCount: number = 0;
    private _elementOffset: number = 0;

    get elementOffset() {
      return this._elementOffset;
    }

    constructor(context: WebGLContext) {
      this.context = context;
      this.array = new ArrayWriter(8);
      this.buffer = context.gl.createBuffer();

      this.elementArray = new ArrayWriter(8);
      this.elementBuffer = context.gl.createBuffer();
    }

    public addQuad() {
      var offset = this._elementOffset;
      this.elementArray.writeTriangleElements(offset, offset + 1, offset + 2);
      this.elementArray.writeTriangleElements(offset, offset + 2, offset + 3);
      this.triangleCount += 2;
      this._elementOffset += 4;
    }

    public resetElementOffset() {
      this._elementOffset = 0;
    }

    public reset() {
      this.array.reset();
      this.elementArray.reset();
      this.resetElementOffset();
      this.triangleCount = 0;
    }

    public uploadBuffers() {
      var gl = this.context.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.array.subU8View(), gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.elementArray.subU8View(), gl.DYNAMIC_DRAW);
    }
  }
}