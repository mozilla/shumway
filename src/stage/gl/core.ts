/// <reference path='../all.ts'/>
/// <reference path="../WebGL.d.ts" />

module Shumway.GL {
  var release = true;
  
  export class ArrayWriter {
    u8: Uint8Array;
    u16: Uint16Array;
    i32: Int32Array;
    f32: Float32Array;
    u32: Uint32Array;
    offset: number;

    constructor(initialCapacity) {
      this.u8 = null;
      this.u16 = null;
      this.i32 = null;
      this.f32 = null;
      this.offset = 0;
      this.ensureCapacity(initialCapacity);
    }

    public reset() {
      this.offset = 0;
    }

    getIndex(size) {
      release || assert (size === 1 || size === 2 || size === 4 || size === 8 || size === 16);
      var index = this.offset / size;
      release || assert ((index | 0) === index);
      return index;
    }

    ensureAdditionalCapacity(size) {
      this.ensureCapacity(this.offset + size);
    }

    ensureCapacity(minCapacity: number) {
      if (!this.u8) {
        this.u8 = new Uint8Array(minCapacity);
      } else if (this.u8.length > minCapacity) {
        return;
      }
      var oldCapacity = this.u8.length;
      // var newCapacity = (((oldCapacity * 3) >> 1) + 8) & ~0x7;
      var newCapacity = oldCapacity * 2;
      if (newCapacity < minCapacity) {
        newCapacity = minCapacity;
      }
      var u8 = new Uint8Array(newCapacity);
      u8.set(this.u8, 0);
      this.u8 = u8;
      this.u16 = new Uint16Array(u8.buffer);
      this.i32 = new Int32Array(u8.buffer);
      this.f32 = new Float32Array(u8.buffer);
    }

    writeInt(v: number) {
      release || assert ((this.offset & 0x3) === 0);
      this.ensureCapacity(this.offset + 4);
      this.writeIntUnsafe(v);
    }

    writeIntUnsafe(v: number) {
      var index = this.offset >> 2;
      this.i32[index] = v;
      this.offset += 4;
    }

    writeFloat(v: number) {
      release || assert ((this.offset & 0x3) === 0);
      this.ensureCapacity(this.offset + 4);
      this.writeFloatUnsafe(v);
    }

    writeFloatUnsafe(v: number) {
      var index = this.offset >> 2;
      this.f32[index] = v;
      this.offset += 4;
    }

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

    subF32View(): Float32Array {
      return this.f32.subarray(0, this.offset >> 2);
    }

    subU16View(): Uint16Array {
      return this.u16.subarray(0, this.offset >> 1);
    }

    subU8View(): Uint8Array {
      return this.u8.subarray(0, this.offset);
    }

    hashWords(hash: number, offset: number, length: number) {
      var i32 = this.i32;
      for (var i = 0; i < length; i++) {
        hash = (((31 * hash) | 0) + i32[i]) | 0;
      }
      return hash;
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

  /*
  export class WebGLGeometry2 {
    context: WebGLContext;
    attributes: { [name: string]: WebGLGeometryAttribute };
    public triangleCount: number = 0;
    private _elementOffset: number = 0;

    private _attribute(name: string) {
      return this.attributes[name];
    }
    
    constructor(context) {
      this.context = context;
      this.attributes = Object.create(null);
      this.attributes["position"] = new WebGLGeometryAttribute(this.context, WebGLGeometryAttributeType.Vertex);
      this.attributes["coordinate"] = new WebGLGeometryAttribute(this.context, WebGLGeometryAttributeType.Vertex);
      this.attributes["color"] = new WebGLGeometryAttribute(this.context, WebGLGeometryAttributeType.Color);
      this.attributes["element"] = new WebGLGeometryAttribute(this.context, WebGLGeometryAttributeType.Index, this.context.gl.ELEMENT_ARRAY_BUFFER);
    }

    public clear() {
      for (var k in this.attributes) {
        this.attributes[k].array.reset();
      }
      this.triangleCount = 0;
      this.resetElementOffset();
    }

    public resetElementOffset() {
      this._elementOffset = 0;
    }

    public addVertices(vertices: Vertex [], count: number = vertices.length) {
      var position = this._attribute("position");
      var coordinate = this._attribute("coordinate");
      var color = this._attribute("color");
      position.array.ensureVertexCapacity(count);
      coordinate.array.ensureVertexCapacity(count);
      color.array.ensureColorCapacity(count);
      for (var i = 0; i < count; i++) {
        var vertex = vertices[i];
        position.array.writeVertexUnsafe(vertex.x, vertex.y);
        coordinate.array.writeVertexUnsafe(vertex.coordinate.x, vertex.coordinate.y);
        color.array.writeColorUnsafe(vertex.color.r, vertex.color.g, vertex.color.b, vertex.color.a);
      }
    }

    public addQuad() {
      var element = this._attribute("element");
      var offset = this._elementOffset;
      element.array.writeTriangleElements(offset, offset + 1, offset + 2);
      element.array.writeTriangleElements(offset, offset + 2, offset + 3);
      this.triangleCount += 2;
      this._elementOffset += 4;
    }

    public addTriangle(a: number, b: number, c: number) {
      var element = this._attribute("element");
      var offset = this._elementOffset;
      element.array.writeTriangleElements(offset + a, offset + b, offset + c);
      this.triangleCount ++;
      this._elementOffset += 3;
    }

    public uploadBuffers() {
      var gl = this.context.gl;

      var vertices = this._attribute("position").getArrayView();
      var coordinates = this._attribute("coordinate").getArrayView();
      var colors = this._attribute("color").getArrayView();
      assert (vertices.length === coordinates.length);
      assert (vertices.length * 2 === colors.length);
      var elements = this._attribute("element").getArrayView();
      assert ((vertices.length % 2) === 0);
      assert ((elements.length % 3) === 0);

      if (!release) {
        for (var i = 0; i < elements.length; i++) {
          var element = elements[i];
          assert (element >= 0 && element < vertices.length);
        }
      }

      var usage = gl.DYNAMIC_DRAW;

      for (var k in this.attributes) {
        var attribute = this.attributes[k];
        gl.bindBuffer(attribute.target, attribute.buffer);
        gl.bufferData(attribute.target, attribute.getArrayView(), usage);
      }
    }
  }
  */
}