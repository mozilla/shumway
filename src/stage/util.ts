/// <reference path='all.ts'/>
module Shumway.Util {
  var release = false;

  export class Color {
    private static colorCache;

    public static colorToNumber(color) {
      return color[0] << 24 | color[1] << 16 | color[2] << 8 | color[3];
    }

    public static parseColor(color) {
      if (!Color.colorCache) {
        Color.colorCache = Object.create(null);
      }
      if (Color.colorCache[color]) {
        return Color.colorCache[color];
      }
      // TODO: Obviously slow, but it will do for now.
      var span = document.createElement('span');
      document.body.appendChild(span);
      span.style.backgroundColor = color;
      var rgb = getComputedStyle(span).backgroundColor;
      document.body.removeChild(span);
      var m = /^rgb\((\d+), (\d+), (\d+)\)$/.exec(rgb);
      if (!m) m = /^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/.exec(rgb);
      var result = new Float32Array(4);
      result[0] = parseFloat(m[1]) / 255;
      result[1] = parseFloat(m[2]) / 255;
      result[2] = parseFloat(m[3]) / 255;
      result[3] = m[4] ? parseFloat(m[4]) / 255 : 1;
      return Color.colorCache[color] = result;
    }
  }

  export function clamp(x: number, min: number, max: number): number {
    if (x < min) {
      return min;
    } else if (x > max) {
      return max;
    }
    return x;
  }

  export function pow2(exponent: number): number {
    if (exponent === (exponent | 0)) {
      if (exponent < 0) {
        return 1 / (1 << -exponent);
      }
      return 1 << exponent;
    }
    return Math.pow(2, exponent);
  }

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

    subF32View(): Float32Array {
      return this.f32.subarray(0, this.offset >> 2);
    }

    subI32View(): Int32Array {
      return this.i32.subarray(0, this.offset >> 2);
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

    reserve(size) {
      size = (size + 3) & ~0x3; // Round up to multiple of 4.
      this.ensureCapacity(this.offset + size);
      this.offset += size;
    }
  }
}