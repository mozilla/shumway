/// <reference path='../references.ts'/>

module Shumway.GFX.Canvas2D {

  import assert = Shumway.Debug.assert;

  export class Canvas2DSurfaceRegion implements ISurfaceRegion {
    constructor (
      public surface: Canvas2DSurface,
      public region: RegionAllocator.Region) {
      // ...
    }
  }

  export class Canvas2DSurface implements ISurface {
    w: number;
    h: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    private _regionAllocator: RegionAllocator.IRegionAllocator;
    constructor(canvas: HTMLCanvasElement, regionAllocator: RegionAllocator.IRegionAllocator) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.w = canvas.width;
      this.h = canvas.height;
      this._regionAllocator = regionAllocator;
    }
    allocate(w: number, h: number): Canvas2DSurfaceRegion {
      var region = this._regionAllocator.allocate(w, h);
      if (region) {
        return new Canvas2DSurfaceRegion(this, region);
      }
      return null;
    }
    free(surfaceRegion: Canvas2DSurfaceRegion) {
      this._regionAllocator.free(surfaceRegion.region);
    }
  }
}
