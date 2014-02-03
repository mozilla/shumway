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
    constructor(blurX: number, blurY: number) {
      super();
      this.blurX = blurX;
      this.blurY = blurY;
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

    public ColorTransform(): ColorTransform {
      return new ColorTransform ([
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
      ]);
    }

    public equals(other: ColorTransform): boolean {
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