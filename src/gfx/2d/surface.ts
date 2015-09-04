module Shumway.GFX.Canvas2D {
  import Rectangle = Shumway.GFX.Geometry.Rectangle;

  import assert = Shumway.Debug.assert;
  import clamp = Shumway.NumberUtilities.clamp;

  declare var registerScratchCanvas;

  var isFirefox = navigator.userAgent.indexOf('Firefox') != -1;

  /**
    * Scale blur radius for each quality level. The scale constants were gathered
    * experimentally.
    */
  function getBlurScale(ratio: number, quality: number) {
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
    static _svgDropshadowMergeNode: Element;

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
      svg.setAttribute("style", "display:block;width:0px;height:0px");
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
      var feComposite = document.createElementNS("http://www.w3.org/2000/svg", "feComposite");
      feComposite.setAttribute("in2", "SourceAlpha");
      feComposite.setAttribute("operator", "out");
      feComposite.setAttribute("result", "outer");
      dropShadowFilter.appendChild(feComposite);

      var feMerge = document.createElementNS("http://www.w3.org/2000/svg", "feMerge");
      var feMergeNode = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
      feMerge.appendChild(feMergeNode);
      var feMergeNode = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
      feMerge.appendChild(feMergeNode);
      Filters._svgDropshadowMergeNode = feMergeNode;
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
      
      var feComposite = document.createElementNS("http://www.w3.org/2000/svg", "feComposite");
      feComposite.setAttribute("in2", "SourceAlpha");
      feComposite.setAttribute("operator", "in");
      colorMatrixFilter.appendChild(feComposite);
      
      defs.appendChild(colorMatrixFilter);
      Filters._svgColorMatrixFilter = feColorMatrix;
      svg.appendChild(defs);
      document.documentElement.appendChild(svg);
    }

    static _applyFilter(ratio: number, context: CanvasRenderingContext2D, filter: Filter) {
      if (!Filters._svgFiltersAreSupported) {
        return;
      }
      Filters._prepareSVGFilters();
      Filters._removeFilter(context);
      var scale = ratio;
      if (filter instanceof BlurFilter) {
        var blurFilter = <BlurFilter>filter;
        var blurScale = getBlurScale(ratio, blurFilter.quality);
        Filters._svgBlurFilter.setAttribute("stdDeviation",
          blurFilter.blurX * blurScale + " " +
            blurFilter.blurY * blurScale);
        context.filter = "url(#svgBlurFilter)";
      } else if (filter instanceof DropshadowFilter) {
        var dropshadowFilter = <DropshadowFilter>filter;
        var blurScale = getBlurScale(ratio, dropshadowFilter.quality);
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
        Filters._svgDropshadowMergeNode.setAttribute("in",
          dropshadowFilter.knockout ? "outer" : "SourceGraphic");
        context.filter = "url(#svgDropShadowFilter)";
      } else if (filter instanceof ColorMatrix) {
        var colorMatrix = <ColorMatrix>filter;
        Filters._svgColorMatrixFilter.setAttribute("values", colorMatrix.toSVGFilterMatrix());
        context.filter = "url(#svgColorMatrixFilter)";
      }
    }

    static _removeFilter(context: CanvasRenderingContext2D) {
      // For some reason, setting this to the default empty string "" does
      // not work, it expects "none".
      context.filter = "none";
    }

    static _applyColorMatrix(context: CanvasRenderingContext2D, colorMatrix: ColorMatrix) {
      if (colorMatrix.isIdentity()) {
        context.globalAlpha = 1;
        context.globalColorMatrix = null;
      } else if (colorMatrix.hasOnlyAlphaMultiplier()) {
        context.globalAlpha = clamp(colorMatrix.alphaMultiplier, 0, 1);
        context.globalColorMatrix = null;
      } else {
        context.globalAlpha = 1;
        if (Filters._svgFiltersAreSupported) {
          Filters._applyFilter(1, context, colorMatrix);
          context.globalColorMatrix = null;
        } else {
          context.globalColorMatrix = colorMatrix;
        }
      }
    }
  }
  
  if (filters && Filters._svgFiltersAreSupported) {
    // Temporary hack to work around a bug that prevents SVG filters to work for off-screen canvases.
    if (!('registerScratchCanvas' in window)) {
      window['registerScratchCanvas'] = function (scratchCanvas) {
        scratchCanvas.style.display = 'none';
        document.body.appendChild(scratchCanvas);
      }
    }
  }

  /**
   * Match up FLash blend modes with Canvas blend operations:
   *
   * See: http://kaourantin.net/2005/09/some-word-on-blend-modes-in-flash.html
   */
  function getCompositeOperation(blendMode: BlendMode): string {
    // TODO:

    // These Flash blend modes have no canvas equivalent:
    // - BlendMode.Subtract
    // - BlendMode.Invert
    // - BlendMode.Shader
    // - BlendMode.Add is similar to BlendMode.Screen

    // These blend modes are actually Porter-Duff compositing operators.
    // The backdrop is the nearest parent with blendMode set to layer.
    // When there is no LAYER parent, they are ignored (treated as NORMAL).
    // - BlendMode.Alpha (destination-in)
    // - BlendMode.Erase (destination-out)
    // - BlendMode.Layer [defines backdrop]

    var compositeOp: string = "source-over";
    switch (blendMode) {
      case BlendMode.Normal:
      case BlendMode.Layer:
        return compositeOp;
      case BlendMode.Multiply:   compositeOp = "multiply";        break;
      case BlendMode.Add:
      case BlendMode.Screen:     compositeOp = "screen";          break;
      case BlendMode.Lighten:    compositeOp = "lighten";         break;
      case BlendMode.Darken:     compositeOp = "darken";          break;
      case BlendMode.Difference: compositeOp = "difference";      break;
      case BlendMode.Overlay:    compositeOp = "overlay";         break;
      case BlendMode.HardLight:  compositeOp = "hard-light";      break;
      case BlendMode.Alpha:      compositeOp = "destination-in";  break;
      case BlendMode.Erase:      compositeOp = "destination-out"; break;
      default:
        release || Shumway.Debug.somewhatImplemented("Blend Mode: " + BlendMode[blendMode]);
    }
    return compositeOp;
  }

  /**
   * Clip target? Some blend modes like destination-in that affect all target pixels are very slow otherwise.
   */
  function blendModeShouldClip(blendMode: BlendMode) {
    switch (blendMode) {
      case BlendMode.Alpha:
        return true;
      default:
        return false;
    }
  }

  export class Canvas2DSurfaceRegion implements ISurfaceRegion {

    /**
     * Draw image is really slow if the soruce and destination are the same. We use
     * a temporary canvas for all such copy operations.
     */
    private static _copyCanvasContext: CanvasRenderingContext2D;

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

    private static _ensureCopyCanvasSize(w: number, h: number) {
      var canvas;
      if (!Canvas2DSurfaceRegion._copyCanvasContext) {
        canvas = document.createElement("canvas");
        if (typeof registerScratchCanvas !== "undefined") {
          registerScratchCanvas(canvas);
        }
        canvas.width = IntegerUtilities.nearestPowerOfTwo(w);
        canvas.height = IntegerUtilities.nearestPowerOfTwo(h);
        Canvas2DSurfaceRegion._copyCanvasContext = canvas.getContext("2d");
      } else {
        canvas = Canvas2DSurfaceRegion._copyCanvasContext.canvas;
        if (canvas.width < w || canvas.height < h) {
          canvas.width = IntegerUtilities.nearestPowerOfTwo(w);
          canvas.height = IntegerUtilities.nearestPowerOfTwo(h);
        }
      }
    }

    public draw(source: Canvas2DSurfaceRegion, x: number, y: number, w: number, h: number,
                colorMatrix: ColorMatrix, blendMode: BlendMode, filters: Filter [],
                devicePixelRatio: number) {
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      var sourceContext, copyContext, sx = 0, sy = 0;
      // Handle copying from and to the same canvas.
      if (source.context.canvas === this.context.canvas) {
        Canvas2DSurfaceRegion._ensureCopyCanvasSize(w, h);
        copyContext = Canvas2DSurfaceRegion._copyCanvasContext;
        copyContext.clearRect(0, 0, w, h);
        copyContext.drawImage(
          source.surface.canvas,
          source.region.x, source.region.y, w, h,
          0, 0, w, h
        );
        sourceContext = copyContext;
        sx = 0;
        sy = 0;
      } else {
        sourceContext = source.surface.context;
        sx = source.region.x;
        sy = source.region.y;
      }
      var canvas = this.context.canvas;
      var clip = blendModeShouldClip(blendMode);
      if (clip) {
        this.context.save();
        this.context.beginPath();
        this.context.rect(x, y, w, h);
        this.context.clip();
      }
      this.context.globalAlpha = 1;
      this.context.globalCompositeOperation = getCompositeOperation(blendMode);
      
      if (filters) {
        if (colorMatrix && !colorMatrix.isIdentity()) {
          filters = filters.concat(colorMatrix);
        }
        var i = 0;
        if (filters.length > 1) {
          // If there are more than one filter defined on this node, we create another temporary
          // surface and keep drawing back and forth between them till all filters are applied,
          // except of the last one which gets applied when actually drawing into the target after
          // this block, to safe a drawImage call.
          var dx, dy, _cc, _sx, _sy;
          if (copyContext) {
            _cc = copyContext;
            copyContext = sourceContext;
            sourceContext = _cc;
          } else {
            Canvas2DSurfaceRegion._ensureCopyCanvasSize(w, h);
            copyContext = Canvas2DSurfaceRegion._copyCanvasContext;
            dx = 0;
            dy = 0;
          }
          for (;i < filters.length - 1; i++) {
            copyContext.clearRect(0, 0, w, h);
            Filters._applyFilter(devicePixelRatio, copyContext, filters[i]);
            copyContext.drawImage(sourceContext.canvas, sx, sy, w, h, dx, dy, w, h);
            Filters._removeFilter(copyContext);
            _cc = copyContext;
            _sx = sx;
            _sy = sy;
            copyContext = sourceContext;
            sourceContext = _cc;
            sx = dx;
            sy = dx;
            dx = _sx;
            dy = _sy;
          }
          Filters._removeFilter(sourceContext);
          Filters._removeFilter(copyContext);
        }
        Filters._applyFilter(devicePixelRatio, this.context, filters[i]);
      }
      
      this.context.drawImage(sourceContext.canvas, sx, sy, w, h, x, y, w, h);
      
      this.context.globalCompositeOperation = getCompositeOperation(BlendMode.Normal);
      Filters._removeFilter(this.context);
      if (clip) {
        this.context.restore();
      }
    }

    get context(): CanvasRenderingContext2D {
      return this.surface.context;
    }

    public resetTransform() {
      this.surface.context.setTransform(1, 0, 0, 1, 0, 0);
    }

    public reset() {
      var context = this.surface.context;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.fillStyle = '#000000';
      context.strokeStyle = '#000000';
      context.globalAlpha = 1;
      context.globalColorMatrix = null;
      context.globalCompositeOperation = getCompositeOperation(BlendMode.Normal);
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
