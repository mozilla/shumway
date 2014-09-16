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

module Shumway.GFX {
  import Rectangle = Geometry.Rectangle;
  import Point = Geometry.Point;
  import Matrix = Geometry.Matrix;
  import DirtyRegion = Geometry.DirtyRegion;
  import clampByte = Shumway.ColorUtilities.clampByte;

  import assert = Shumway.Debug.assert;

  export class Filter {

  }

  export class BlurFilter extends Filter {
    blurX: number;
    blurY: number;
    quality: number;
    constructor(blurX: number, blurY: number, quality: number) {
      super();
      this.blurX = blurX;
      this.blurY = blurY;
      this.quality = quality;
    }
  }

  export class DropshadowFilter extends Filter {
    alpha: number;
    angle: number;
    blurX: number;
    blurY: number;
    color: number;
    distance: number;
    hideObject: boolean;
    inner: boolean;
    knockout: boolean;
    quality: number;
    strength: number;
    constructor(alpha: number, angle: number, blurX: number, blurY: number,
                color: number, distance: number,
                hideObject: boolean, inner: boolean, knockout: boolean,
                quality: number, strength: number) {
      super();
      this.alpha = alpha;
      this.angle = angle;
      this.blurX = blurX;
      this.blurY = blurY;
      this.color = color;
      this.distance = distance;
      this.hideObject = hideObject;
      this.inner = inner;
      this.knockout = knockout;
      this.quality = quality;
      this.strength = strength;
    }
  }

  export class GlowFilter extends Filter {
    alpha: number;
    blurX: number;
    blurY: number;
    color: number;
    inner: boolean;
    knockout: boolean;
    quality: number;
    strength: number;
    constructor(alpha: number, blurX: number, blurY: number, color: number,
                inner: boolean, knockout: boolean,
                quality: number, strength: number) {
      super();
      this.alpha = alpha;
      this.blurX = blurX;
      this.blurY = blurY;
      this.color = color;
      this.inner = inner;
      this.knockout = knockout;
      this.quality = quality;
      this.strength = strength;
    }
  }

  export class ColorMatrix {
    private _m: Float32Array;

    constructor (m: any) {
      release || assert (m.length === 20);
      this._m = new Float32Array(m);
    }

    public clone(): ColorMatrix {
      return new ColorMatrix(this._m);
    }

    public copyFrom(other: ColorMatrix) {
      this._m.set(other._m);
    }

    public toWebGLMatrix(): Float32Array {
      return new Float32Array(this._m);
    }

    public asWebGLMatrix(): Float32Array {
      return this._m.subarray(0, 16);
    }

    public asWebGLVector(): Float32Array {
      return this._m.subarray(16, 20);
    }

    public getColorMatrix(): Float32Array {
      var t: Float32Array = new Float32Array(20);
      var m: Float32Array = this._m;
      t[0] = m[0];
      t[1] = m[4];
      t[2] = m[8];
      t[3] = m[12];
      t[4] = m[16] * 255;
      t[5] = m[1];
      t[6] = m[5];
      t[7] = m[9];
      t[8] = m[13];
      t[9] = m[17] * 255;
      t[10] = m[2];
      t[11] = m[6];
      t[12] = m[10];
      t[13] = m[14];
      t[14] = m[18] * 255;
      t[15] = m[3];
      t[16] = m[7];
      t[17] = m[11];
      t[18] = m[15];
      t[19] = m[19] * 255;
      return t;
    }

    public getColorTransform(): Float32Array {
      var t: Float32Array = new Float32Array(8);
      var m: Float32Array = this._m;
      t[0] = m[0];
      t[1] = m[5];
      t[2] = m[10];
      t[3] = m[15];
      t[4] = m[16] * 255;
      t[5] = m[17] * 255;
      t[6] = m[18] * 255;
      t[7] = m[19] * 255;
      return t;
    }

    public isIdentity(): boolean {
      var m = this._m;
      return m[0]  == 1 && m[1]  == 0 && m[2]  == 0 && m[3]  == 0 &&
             m[4]  == 0 && m[5]  == 1 && m[6]  == 0 && m[7]  == 0 &&
             m[8]  == 0 && m[9]  == 0 && m[10] == 1 && m[11] == 0 &&
             m[12] == 0 && m[13] == 0 && m[14] == 0 && m[15] == 1 &&
             m[16] == 0 && m[17] == 0 && m[18] == 0 && m[19] == 0;
    }

    public static createIdentity(): ColorMatrix {
      return new ColorMatrix ([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
        0, 0, 0, 0
      ]);
    }

    public setMultipliersAndOffsets(redMultiplier: number, greenMultiplier: number, blueMultiplier: number, alphaMultiplier: number,
                                    redOffset: number, greenOffset: number, blueOffset: number, alphaOffset: number) {
      var m: Float32Array = this._m;
      for (var i = 0; i < m.length; i++) {
        m[i] = 0;
      }
      m[0] = redMultiplier;
      m[5] = greenMultiplier;
      m[10] = blueMultiplier;
      m[15] = blueMultiplier;
      m[16] = redOffset;
      m[17] = greenOffset;
      m[18] = blueOffset;
      m[19] = alphaOffset;
    }

    public transformRGBA(rgba: number) {
      var r = (rgba >> 24) & 0xff;
      var g = (rgba >> 16) & 0xff;
      var b = (rgba >>  8) & 0xff;
      var a = rgba & 0xff;

      var m: Float32Array = this._m;
      var R = clampByte(r * m[0]  + g * m[1]  + b * m[2]  + a * m[3]  + m[16]);
      var G = clampByte(r * m[4]  + g * m[5]  + b * m[6]  + a * m[7]  + m[17]);
      var B = clampByte(r * m[8]  + g * m[9]  + b * m[10] + a * m[11] + m[18]);
      var A = clampByte(r * m[12] + g * m[13] + b * m[14] + a * m[15] + m[19]);

      return R << 24 | G << 16 | B << 8 | A;
    }

    public multiply(other: ColorMatrix) {
      var a = this._m, b = other._m;
      var a00 = a[0 * 4 + 0];
      var a01 = a[0 * 4 + 1];
      var a02 = a[0 * 4 + 2];
      var a03 = a[0 * 4 + 3];
      var a10 = a[1 * 4 + 0];
      var a11 = a[1 * 4 + 1];
      var a12 = a[1 * 4 + 2];
      var a13 = a[1 * 4 + 3];
      var a20 = a[2 * 4 + 0];
      var a21 = a[2 * 4 + 1];
      var a22 = a[2 * 4 + 2];
      var a23 = a[2 * 4 + 3];
      var a30 = a[3 * 4 + 0];
      var a31 = a[3 * 4 + 1];
      var a32 = a[3 * 4 + 2];
      var a33 = a[3 * 4 + 3];
      var a40 = a[4 * 4 + 0];
      var a41 = a[4 * 4 + 1];
      var a42 = a[4 * 4 + 2];
      var a43 = a[4 * 4 + 3];

      var b00 = b[0 * 4 + 0];
      var b01 = b[0 * 4 + 1];
      var b02 = b[0 * 4 + 2];
      var b03 = b[0 * 4 + 3];
      var b10 = b[1 * 4 + 0];
      var b11 = b[1 * 4 + 1];
      var b12 = b[1 * 4 + 2];
      var b13 = b[1 * 4 + 3];
      var b20 = b[2 * 4 + 0];
      var b21 = b[2 * 4 + 1];
      var b22 = b[2 * 4 + 2];
      var b23 = b[2 * 4 + 3];
      var b30 = b[3 * 4 + 0];
      var b31 = b[3 * 4 + 1];
      var b32 = b[3 * 4 + 2];
      var b33 = b[3 * 4 + 3];
      var b40 = b[4 * 4 + 0];
      var b41 = b[4 * 4 + 1];
      var b42 = b[4 * 4 + 2];
      var b43 = b[4 * 4 + 3];

      a[0 * 4 + 0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
      a[0 * 4 + 1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
      a[0 * 4 + 2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
      a[0 * 4 + 3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
      a[1 * 4 + 0] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
      a[1 * 4 + 1] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
      a[1 * 4 + 2] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
      a[1 * 4 + 3] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
      a[2 * 4 + 0] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
      a[2 * 4 + 1] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
      a[2 * 4 + 2] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
      a[2 * 4 + 3] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
      a[3 * 4 + 0] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
      a[3 * 4 + 1] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
      a[3 * 4 + 2] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
      a[3 * 4 + 3] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

      a[4 * 4 + 0] = a00 * b40 + a10 * b41 + a20 * b42 + a30 * b43 + a40;
      a[4 * 4 + 1] = a01 * b40 + a11 * b41 + a21 * b42 + a31 * b43 + a41;
      a[4 * 4 + 2] = a02 * b40 + a12 * b41 + a22 * b42 + a32 * b43 + a42;
      a[4 * 4 + 3] = a03 * b40 + a13 * b41 + a23 * b42 + a33 * b43 + a43;
    }

    public get alphaMultiplier(): number {
      return this._m[15];
    }

    public hasOnlyAlphaMultiplier(): boolean {
      var m = this._m;
      return m[0]  == 1 && m[1]  == 0 && m[2]  == 0 && m[3]  == 0 &&
             m[4]  == 0 && m[5]  == 1 && m[6]  == 0 && m[7]  == 0 &&
             m[8]  == 0 && m[9]  == 0 && m[10] == 1 && m[11] == 0 &&
             m[12] == 0 && m[13] == 0 && m[14] == 0 && m[16] == 0 &&
             m[17] == 0 && m[18] == 0 && m[19] == 0;
    }

    public equals(other: ColorMatrix): boolean {
      if (!other) {
        return false;
      }
      var a = this._m;
      var b = other._m;
      for (var i = 0; i < 20; i++) {
        if (Math.abs(a[i] - b[i]) > 0.001) {
          return false;
        }
      }
      return true;
    }

  }
}
