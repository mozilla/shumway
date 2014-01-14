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

}