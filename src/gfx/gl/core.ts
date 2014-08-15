module Shumway.GFX.WebGL {
  var release = false;

  import assert = Shumway.Debug.assert;
  import Rectangle = Geometry.Rectangle;
  import RenderableTileCache = Geometry.RenderableTileCache;

  /**
   * Utility class to help when writing to GL buffers.
   */
  export class BufferWriter extends Shumway.ArrayUtilities.ArrayWriter {
    ensureVertexCapacity(count: number) {
      release || assert ((this._offset & 0x3) === 0);
      this.ensureCapacity(this._offset + count * 8);
    }

    writeVertex(x: number, y: number) {
      release || assert ((this._offset & 0x3) === 0);
      this.ensureCapacity(this._offset + 8);
      this.writeVertexUnsafe(x, y);
    }

    writeVertexUnsafe(x: number, y: number) {
      var index = this._offset >> 2;
      this._f32[index] = x;
      this._f32[index + 1] = y;
      this._offset += 8;
    }

    writeVertex3D(x: number, y: number, z: number) {
      release || assert ((this._offset & 0x3) === 0);
      this.ensureCapacity(this._offset + 12);
      this.writeVertex3DUnsafe(x, y, z);
    }

    writeVertex3DUnsafe(x: number, y: number, z: number) {
      var index = this._offset >> 2;
      this._f32[index] = x;
      this._f32[index + 1] = y;
      this._f32[index + 2] = z;
      this._offset += 12;
    }

    writeTriangleElements(a: number, b: number, c: number) {
      release || assert ((this._offset & 0x1) === 0);
      this.ensureCapacity(this._offset + 6);
      var index = this._offset >> 1;
      this._u16[index] = a;
      this._u16[index + 1] = b;
      this._u16[index + 2] = c;
      this._offset += 6;
    }

    ensureColorCapacity(count: number) {
      release || assert ((this._offset & 0x2) === 0);
      this.ensureCapacity(this._offset + count * 16);
    }

    writeColorFloats(r: number, g: number, b: number, a: number) {
      release || assert ((this._offset & 0x2) === 0);
      this.ensureCapacity(this._offset + 16);
      this.writeColorFloatsUnsafe(r, g, b, a);
    }

    writeColorFloatsUnsafe(r: number, g: number, b: number, a: number) {
      var index = this._offset >> 2;
      this._f32[index] = r;
      this._f32[index + 1] = g;
      this._f32[index + 2] = b;
      this._f32[index + 3] = a;
      this._offset += 16;
    }

    writeColor(r: number, g: number, b: number, a: number) {
      release || assert ((this._offset & 0x3) === 0);
      this.ensureCapacity(this._offset + 4);
      var index = this._offset >> 2;
      this._i32[index] = a << 24 | b << 16 | g << 8 | r;
      this._offset += 4;
    }

    writeColorUnsafe(r: number, g: number, b: number, a: number) {
      var index = this._offset >> 2;
      this._i32[index] = a << 24 | b << 16 | g << 8 | r;
      this._offset += 4;
    }

    writeRandomColor() {
      this.writeColor(Math.random(), Math.random(), Math.random(), Math.random() / 2);
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

  export class WebGLGeometry {
    array: BufferWriter;
    buffer: WebGLBuffer;

    elementArray: BufferWriter;
    elementBuffer: WebGLBuffer;

    context: WebGLContext;

    triangleCount: number = 0;
    private _elementOffset: number = 0;

    get elementOffset() {
      return this._elementOffset;
    }

    constructor(context: WebGLContext) {
      this.context = context;
      this.array = new BufferWriter(8);
      this.buffer = context.gl.createBuffer();

      this.elementArray = new BufferWriter(8);
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


  export class Vertex extends Geometry.Point3D {
    constructor (x: number, y: number, z: number) {
      super(x, y, z);
    }
    static createEmptyVertices<T extends Vertex>(type: new (x: number, y: number, z: number) => T, count: number): T [] {
      var result = [];
      for (var i = 0; i < count; i++) {
        result.push(new type(0, 0, 0));
      }
      return result;
    }
  }

  export enum WebGLBlendFactor {
    ZERO                       = 0,
    ONE                        = 1,
    SRC_COLOR                  = 768,
    ONE_MINUS_SRC_COLOR        = 769,
    DST_COLOR                  = 774,
    ONE_MINUS_DST_COLOR        = 775,
    SRC_ALPHA                  = 770,
    ONE_MINUS_SRC_ALPHA        = 771,
    DST_ALPHA                  = 772,
    ONE_MINUS_DST_ALPHA        = 773,
    SRC_ALPHA_SATURATE         = 776,
    CONSTANT_COLOR             = 32769,
    ONE_MINUS_CONSTANT_COLOR   = 32770,
    CONSTANT_ALPHA             = 32771,
    ONE_MINUS_CONSTANT_ALPHA   = 32772
  }

}
