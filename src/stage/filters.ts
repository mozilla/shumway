/// <reference path='all.ts'/>
module Shumway.Layers {
  import Rectangle = Shumway.Geometry.Rectangle;
  import Point = Shumway.Geometry.Point;
  import Matrix = Shumway.Geometry.Matrix;
  import DirtyRegion = Shumway.Geometry.DirtyRegion;

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

  export class ColorTransform {
    private _m: Float32Array;
    constructor (m: number []) {
      assert (m.length === 20);
      this._m = new Float32Array(m);
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

    public static createIdentity(): ColorTransform {
      return new ColorTransform ([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
        0, 0, 0, 0
      ]);
    }

    public static fromMultipliersAndOffsets(redMultiplier: number, greenMultiplier: number, blueMultiplier: number, alphaMultiplier: number,
                                            redOffset: number, greenOffset: number, blueOffset: number, alphaOffset: number): ColorTransform {
      return new ColorTransform ([
        redMultiplier, 0, 0, 0,
        0, greenMultiplier, 0, 0,
        0, 0, blueMultiplier, 0,
        0, 0, 0, alphaMultiplier,
        redOffset, greenOffset, blueOffset, alphaOffset
      ]);
    }

    public multiply(other: ColorTransform) {
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

    public equals(other: ColorTransform): boolean {
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
