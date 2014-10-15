module Shumway.GFX.Canvas2D {
  import Rectangle = Shumway.GFX.Geometry.Rectangle;

  import assert = Shumway.Debug.assert;

  export class Filters {
    /**
     * Reusable blur filter SVG element.
     */
    static _svgBlurFilter: Element;

    /**
     * Reusable dropshadow filter SVG element.
     */
    static _svgDropshadowFilterBlur: Element;
    static _svgDropshadowFilterFlood: Element;
    static _svgDropshadowFilterOffset: Element;

    /**
     * Reusable colormatrix filter SVG element.
     */
    static _svgColorMatrixFilter: Element;

    static _svgFiltersAreSupported = !!Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, "filter");

    /**
     * Creates an SVG element and defines filters that are referenced in |canvas.filter| properties. We cannot
     * inline CSS filters because they don't expose independent blurX and blurY properties.
     * This only works in Firefox, and you have to set the 'canvas.filters.enabled' equal to |true|.
     */
    private static _prepareSVGFilters() {
      if (Filters._svgBlurFilter) {
        return;
      }
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

      // Blur Filter
      var blurFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      blurFilter.setAttribute("id", "svgBlurFilter");
      var feGaussianFilter = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
      feGaussianFilter.setAttribute("stdDeviation", "0 0");
      blurFilter.appendChild(feGaussianFilter);
      defs.appendChild(blurFilter);
      Filters._svgBlurFilter = feGaussianFilter;

      // Drop Shadow Filter
      var dropShadowFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      dropShadowFilter.setAttribute("id", "svgDropShadowFilter");
      var feGaussianFilter = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
      feGaussianFilter.setAttribute("in", "SourceAlpha");
      feGaussianFilter.setAttribute("stdDeviation", "3");
      dropShadowFilter.appendChild(feGaussianFilter);
      Filters._svgDropshadowFilterBlur = feGaussianFilter;

      var feOffset = document.createElementNS("http://www.w3.org/2000/svg", "feOffset");
      feOffset.setAttribute("dx", "0");
      feOffset.setAttribute("dy", "0");
      feOffset.setAttribute("result", "offsetblur");
      dropShadowFilter.appendChild(feOffset);
      Filters._svgDropshadowFilterOffset = feOffset;

      var feFlood = document.createElementNS("http://www.w3.org/2000/svg", "feFlood");
      feFlood.setAttribute("flood-color", "rgba(0,0,0,1)");
      dropShadowFilter.appendChild(feFlood);
      Filters._svgDropshadowFilterFlood = feFlood;

      var feComposite = document.createElementNS("http://www.w3.org/2000/svg", "feComposite");
      feComposite.setAttribute("in2", "offsetblur");
      feComposite.setAttribute("operator", "in");
      dropShadowFilter.appendChild(feComposite);

      var feMerge = document.createElementNS("http://www.w3.org/2000/svg", "feMerge");
      var feMergeNode = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
      feMerge.appendChild(feMergeNode);

      var feMergeNode = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
      feMergeNode.setAttribute("in", "SourceGraphic");
      feMerge.appendChild(feMergeNode);
      dropShadowFilter.appendChild(feMerge);
      defs.appendChild(dropShadowFilter);

      var colorMatrixFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      colorMatrixFilter.setAttribute("id", "svgColorMatrixFilter");
      var feColorMatrix = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
      // Color interpolation in linear RGB doesn't seem to match Flash's results.
      feColorMatrix.setAttribute("color-interpolation-filters", "sRGB");
      feColorMatrix.setAttribute("in", "SourceGraphic");
      feColorMatrix.setAttribute("type", "matrix");
      colorMatrixFilter.appendChild(feColorMatrix);
      defs.appendChild(colorMatrixFilter);
      Filters._svgColorMatrixFilter = feColorMatrix;
      svg.appendChild(defs);
      document.documentElement.appendChild(svg);
    }

    static _applyColorMatrixFilter(context: CanvasRenderingContext2D, colorMatrix: ColorMatrix) {
      Filters._prepareSVGFilters();
      Filters._svgColorMatrixFilter.setAttribute("values", colorMatrix.toSVGFilterMatrix());
      context.filter = "url(#svgColorMatrixFilter)";
    }

    /**
     * This doesn't currently allow you to specify multiple filters. Only the last one is used.
     * To support multiple filters, we need to group them in SVG nodes.
     */
    static _applyFilters(ratio: number, context: CanvasRenderingContext2D, filters: Filter []) {
      Filters._prepareSVGFilters();
      Filters._removeFilters(context);
      var scale = ratio;
      /**
       * Scale blur radius for each quality level. The scale constants were gathered
       * experimentally.
       */
      function getBlurScale(quality: number) {
        var blurScale = ratio / 2; // For some reason we always have to scale by 1/2 first.
        switch (quality) {
          case 0:
            return 0;
          case 1:
            return blurScale / 2.7;
          case 2:
            return blurScale / 1.28;
          case 3:
          default:
            return blurScale;
        }
      }
      for (var i = 0; i < filters.length; i++) {
        var filter = filters[i];
        if (filter instanceof BlurFilter) {
          var blurFilter = <BlurFilter>filter;
          var blurScale = getBlurScale(blurFilter.quality);
          Filters._svgBlurFilter.setAttribute("stdDeviation",
            blurFilter.blurX * blurScale + " " +
              blurFilter.blurY * blurScale);
          context.filter = "url(#svgBlurFilter)";
        } else if (filter instanceof DropshadowFilter) {
          var dropshadowFilter = <DropshadowFilter>filter;
          var blurScale = getBlurScale(dropshadowFilter.quality);
          Filters._svgDropshadowFilterBlur.setAttribute("stdDeviation",
            dropshadowFilter.blurX * blurScale + " " +
              dropshadowFilter.blurY * blurScale
          );
          Filters._svgDropshadowFilterOffset.setAttribute("dx",
            String(Math.cos(dropshadowFilter.angle * Math.PI / 180) * dropshadowFilter.distance * scale));
          Filters._svgDropshadowFilterOffset.setAttribute("dy",
            String(Math.sin(dropshadowFilter.angle * Math.PI / 180) * dropshadowFilter.distance * scale));
          Filters._svgDropshadowFilterFlood.setAttribute("flood-color",
            ColorUtilities.rgbaToCSSStyle(((dropshadowFilter.color << 8) | Math.round(255 * dropshadowFilter.alpha))));
          context.filter = "url(#svgDropShadowFilter)";
        }
      }
    }

    static _removeFilters(context: CanvasRenderingContext2D) {
      // For some reason, setting this to the default empty string "" does
      // not work, it expects "none".
      context.filter = "none";
    }

    static _applyColorMatrix(context: CanvasRenderingContext2D, colorMatrix: ColorMatrix, state: State) {
      Filters._removeFilters(context);
      if (colorMatrix.isIdentity()) {
        context.globalAlpha = 1;
        context.globalColorMatrix = null;
      } else if (colorMatrix.hasOnlyAlphaMultiplier()) {
        context.globalAlpha = colorMatrix.alphaMultiplier;
        context.globalColorMatrix = null;
      } else {
        context.globalAlpha = 1;
        if (Filters._svgFiltersAreSupported && state.options.filters) {
          Filters._applyColorMatrixFilter(context, colorMatrix);
          context.globalColorMatrix = null;
        } else {
          context.globalColorMatrix = colorMatrix;
        }
      }
    }
  }

  export class Canvas2DSurfaceRegion implements ISurfaceRegion {

    constructor (
      public surface: Canvas2DSurface,
      public region: RegionAllocator.Region,
      public w: number,
      public h: number
    ) {
      // ...
    }

    public free() {
      this.surface.free(this)
    }

    public draw(source: Canvas2DSurfaceRegion, x: number, y: number) {
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      this.context.drawImage (
        source.surface.canvas,
        source.region.x,
        source.region.y,
        source.w,
        source.h,
        x,
        y,
        source.w,
        source.h
      );
    }

    get context(): CanvasRenderingContext2D {
      return this.surface.context;
    }

    public resetTransform() {
      this.surface.context.setTransform(1, 0, 0, 1, 0, 0);
    }

    public fill(fillStyle: any) {
      var context = this.surface.context, region = this.region;
      context.fillStyle = fillStyle;
      context.fillRect(region.x, region.y, region.w, region.h);
    }

    public clear(rectangle?: Rectangle) {
      var context = this.surface.context, region = this.region;
      if (!rectangle) {
        rectangle = region;
      }
      context.clearRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
    }
  }

  export class Canvas2DSurface implements ISurface {
    w: number;
    h: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    private _regionAllocator: RegionAllocator.IRegionAllocator;
    constructor(canvas: HTMLCanvasElement, regionAllocator?: RegionAllocator.IRegionAllocator) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.w = canvas.width;
      this.h = canvas.height;
      this._regionAllocator = regionAllocator;
    }
    allocate(w: number, h: number): Canvas2DSurfaceRegion {
      var region = this._regionAllocator.allocate(w, h);
      if (region) {
        return new Canvas2DSurfaceRegion(this, region, w, h);
      }
      return null;
    }
    free(surfaceRegion: Canvas2DSurfaceRegion) {
      this._regionAllocator.free(surfaceRegion.region);
    }
  }
}
