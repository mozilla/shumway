/// <reference path='../references.ts'/>

interface CanvasRenderingContext2D {
  stackDepth: number;
}

module Shumway.GFX {

  declare var FILTERS;

  import Rectangle = Shumway.GFX.Geometry.Rectangle;
  import Point = Shumway.GFX.Geometry.Point;
  import Matrix = Shumway.GFX.Geometry.Matrix;
  import DirtyRegion = Shumway.GFX.Geometry.DirtyRegion;
  import Filter = Shumway.GFX.Filter;
  import BlendMode = Shumway.GFX.BlendMode;
  import TileCache = Shumway.GFX.Geometry.TileCache;
  import Tile = Shumway.GFX.Geometry.Tile;
  import OBB = Shumway.GFX.Geometry.OBB;
  import GridAllocator = Shumway.GFX.Geometry.RegionAllocator.GridAllocator;
  import GridCell = Shumway.GFX.Geometry.RegionAllocator.GridCell;
  import Region = Shumway.GFX.Geometry.RegionAllocator.Region;
  import IRegionAllocator = Shumway.GFX.Geometry.RegionAllocator.IRegionAllocator;

  export enum FillRule {
    NONZERO,
    EVENODD
  }

  export enum RenderTarget {
    Default        = 0,
    Mask           = 1,
    Maskee         = 2,
    BlendMode      = 4,
    ColorMatrix    = 8,
    Filters        = 16
  }

  var originalSave = CanvasRenderingContext2D.prototype.save;
  var originalRestore = CanvasRenderingContext2D.prototype.restore;


  class CanvasGrid extends Shumway.GFX.Geometry.RegionAllocator.GridAllocator {
    private _context: CanvasRenderingContext2D;

    constructor(canvasSize: number, gridSize: number) {
      super(canvasSize, canvasSize, gridSize);
      var canvas = document.createElement("canvas");
      canvas.width = canvas.height = canvasSize | 0;
      this._context = canvas.getContext("2d", { willReadFrequently: true });
      //document.getElementById("settingsContainer").appendChild(canvas);
      //canvas.setAttribute("style", "display: block; transform: scale(0.5, 0.5);")
    }

    get context(): CanvasRenderingContext2D {
      return this._context;
    }
  }

  class CanvasGridSimple implements IRegionAllocator {
    private _context: CanvasRenderingContext2D;
    private _cell: GridCell = null;

    constructor(w:number, h:number) {
      var canvas = document.createElement("canvas");
      canvas.width = w | 0;
      canvas.height = h | 0;
      this._context = canvas.getContext("2d", { willReadFrequently: true });
    }

    get context():CanvasRenderingContext2D {
      return this._context;
    }

    allocate(w:number, h:number):Region {
      if (this._cell == null && w <= this._context.canvas.width && h <= this._context.canvas.height) {
        this._cell = new GridCell(0, 0, w, h);
        return this._cell;
      }
      return null;
    }

    free(region: Region) {
      var cell = <GridCell>region;
      assert (cell.allocator === this);
      this._cell = null;
    }
  }

  class CanvasCache {
    private canvasSize: number;
    private gridSizes: number[];
    private allocators: IRegionAllocator[][];
    private allocatorsNoFit: IRegionAllocator[];

    maxCanvasCount: number = 0;

    constructor(canvasSize: number = 512, gridSizes: number[] = [128, 256, 512]) {
      gridSizes.sort();
      this.canvasSize = canvasSize;
      this.gridSizes = gridSizes;
      this.allocators = [];
      this.allocatorsNoFit = [];
      var gridSize: number;
      for (var i = 0; i < this.gridSizes.length; i++) {
        gridSize = this.gridSizes[i];
        assert(canvasSize >= gridSize, "CanvasCache: gridSize (" + gridSize + ") > canvasSize (" + canvasSize + ")");
        assert(canvasSize % gridSize == 0, "CanvasCache: gridSize (" + gridSize + ") not optimal");
        this.allocators[i] = [];
      }
      if (gridSize != canvasSize) {
        this.gridSizes[i] = canvasSize;
        this.allocators[i] = [];
      }
    }

    allocate(w: number, h: number, i: number = -1): Region {
      if (i == -1) {
        i = this.getOptimalGridSizeIndex(w, h);
      }
      var allocators: IRegionAllocator[] = (i != -1) ? this.allocators[i] : this.allocatorsNoFit;
      var region: Region = null;
      var j: number = 0;
      while (j < allocators.length && region == null) {
        region = allocators[j++].allocate(w, h);
      }
      if (region == null && (this.maxCanvasCount == 0 || this.maxCanvasCount > allocators.length)) {
        var allocator: IRegionAllocator = allocators[j] =
          (i != -1)
            ? new CanvasGrid(this.canvasSize, this.gridSizes[i])
            : new CanvasGridSimple(w, h);
        region = allocator.allocate(w, h);
      }
      //console.log("allocate", region.w.toFixed(2), region.h.toFixed(2), i, j-1);
      return region;
    }

    free(region: Region) {
      //console.log("free", region.w.toFixed(2), region.h.toFixed(2));
      region.allocator.free(region);
    }

    allocateOrUpdate(w: number, h: number, region: Region = null): Region {
      if (region) {
        if (region.w != w || region.h != h) {
          var oldIndex: number = this.getOptimalGridSizeIndex(region.w, region.h);
          var newIndex: number = this.getOptimalGridSizeIndex(w, h);
          if (oldIndex != newIndex) {
            this.free(region);
            region = this.allocate(w, h, newIndex);
          } else {
            region.w = w;
            region.h = h;
          }
        //} else {
          //console.log("noop");
        }
      } else {
        region = this.allocate(w, h);
      }
      return region;
    }

    private getOptimalGridSizeIndex(w: number, h: number): number {
      var minSize: number = Math.max(w, h);
      for (var i = 0; i < this.gridSizes.length; i++) {
        if (minSize <= this.gridSizes[i]) {
          return i;
        }
      }
      return -1;
    }
  }

  /**
   * Computes an opaquness grid by rendering a shape at a lower resolution and testing the alpha channel for each pixel.
   */
  class OpaqueRegionFactory {
    w: number;
    h: number;
    sx: number;
    sy: number;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    constructor(w: number, h: number, sx: number, sy: number) {
      this.canvas = document.createElement("canvas");
      // document.getElementById("stageContainer").appendChild(this.canvas);
      this.w = this.canvas.width = w | 0;
      this.h = this.canvas.height = h | 0;
      this.sx = sx;
      this.sy = sy;
      this.context = this.canvas.getContext("2d", {
        willReadFrequently: true
      });
    }

    public createOpaqueRegion(source: IRenderable) {
      if (source.getBounds().isEmpty()) {
        return new OpaqueRegion(Rectangle.createEmpty(), Rectangle.createEmpty(), null);
      }
      this.context.save();
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      this.context.scale(1 / this.sx, 1 / this.sy);
      var sourceBounds = new Rectangle(0, 0, source.getBounds().w, source.getBounds().h);
      var scaledBounds = sourceBounds.clone().scale(1 / this.sx, 1 / this.sy);
      this.context.clearRect(sourceBounds.x, sourceBounds.y, sourceBounds.w, sourceBounds.h);
      source.render(this.context);
      this.context.restore();
      var imageData: ImageData = this.context.getImageData(scaledBounds.x, scaledBounds.y, scaledBounds.w, scaledBounds.h);
      var allChannels = imageData.data;
      var alphaChannel = new Uint8Array(imageData.width * imageData.height);
      var allOpaque = true;
      for (var i = 0; i < alphaChannel.length; i ++) {
        alphaChannel[i] = allChannels[3 + (i << 2)];
        if (alphaChannel[i] < 255) {
          allOpaque = false;
        }
      }
      return new OpaqueRegion(sourceBounds, new Rectangle(0, 0, imageData.width, imageData.height), allOpaque ? null : alphaChannel);
    }
  }

  /**
   * Describes an opaque region which is effectively an array of alpha values.
   */
  class OpaqueRegion {
    bounds: Rectangle;
    sourceBounds: Rectangle;
    private _alphaChannel: Uint8Array; // Null means it's all opaque.

    constructor(sourceBounds: Rectangle, bounds: Rectangle, alphaChannel: Uint8Array) {
      this.bounds = bounds;
      this.sourceBounds = sourceBounds;
      this._alphaChannel = alphaChannel;
    }

    isOpaque(rectangle: Rectangle) {
      if (!this._alphaChannel) {
        return true;
      }
      // Query rectangle is larger than the region, so it can't all be opaque.
      if (!this.sourceBounds.contains(rectangle)) {
        return false;
      }

      var scaledRectangle = rectangle.clone();
      scaledRectangle.scale(this.bounds.w / this.sourceBounds.w, this.bounds.h / this.sourceBounds.h);
      scaledRectangle.snap();

      var buffer = this._alphaChannel;
      var stride = this.bounds.w;
      var offsetX = scaledRectangle.x;
      var offsetY = scaledRectangle.y;

      for (var y = 0; y < scaledRectangle.h; y++) {
        for (var x = 0; x < scaledRectangle.w; x++) {
          var v = buffer[(offsetY + y) * stride + offsetX + x];
          if (v < 255) {
            return false;
          }
        }
      }

      return true;
    }
  }

  CanvasRenderingContext2D.prototype.save = function () {
    if (this.stackDepth === undefined) {
      this.stackDepth = 0;
    }
    this.stackDepth ++;
    originalSave.call(this);
  };

  CanvasRenderingContext2D.prototype.restore = function () {
    this.stackDepth --;
    originalRestore.call(this);
  };

  function findIntersectingIndex(rectangle: Rectangle, others: Rectangle []): number {
    for (var i = 0; i < others.length; i++) {
      if (others[i] && others[i].intersects(rectangle)) {
        return i;
      }
    }
    return -1;
  }

  export class Canvas2DStageRendererOptions extends StageRendererOptions {
    disable: boolean;
    clipDirtyRegions: boolean;
    clipCanvas: boolean;
    cull: boolean;
    drawLayers: boolean
  }

  export class Canvas2DStageRenderer extends StageRenderer {
    private _options: Canvas2DStageRendererOptions;
    private _viewport: Rectangle;
    private _fillRule: string;
    private canvasCache: CanvasCache;

    context: CanvasRenderingContext2D;
    count = 0;

    constructor(canvas: HTMLCanvasElement,
                stage: Stage,
                options: Canvas2DStageRendererOptions = new Canvas2DStageRendererOptions()) {
      super(canvas, stage);
      this._options = options;
      var fillRule: FillRule = FillRule.NONZERO
      var context = this.context = canvas.getContext("2d");
      this.canvasCache = new CanvasCache(512);
      this._viewport = new Rectangle(0, 0, context.canvas.width, context.canvas.height);
      this._fillRule = fillRule === FillRule.EVENODD ? 'evenodd' : 'nonzero';
      context.fillRule = context.mozFillRule = this._fillRule;
    }

    private createScratchContext(context: CanvasRenderingContext2D): CanvasRenderingContext2D {
      var canvas = document.createElement("canvas");
      canvas.width = context.canvas.width;
      canvas.height = context.canvas.height;
      var canvasContext = canvas.getContext("2d", { willReadFrequently: true });
      canvasContext.fillRule = canvasContext.mozFillRule = this._fillRule;
      return canvasContext;
    }

    /**
     * Walks the display list front to back marking the frames that should be rendered given the list of culling rectangles.
     */
    cullFrame(root: Frame, transform: Matrix, cullRectanglesAABB: Rectangle []) {
      var inverseTransform: Matrix = Matrix.createIdentity();
      root.visit(function visitFrame(frame: Frame, transform?: Matrix, flags?: FrameFlags): VisitorFlags {
        var frameBoundsAABB = frame.getBounds().clone();
        transform.transformRectangleAABB(frameBoundsAABB);
        var index = findIntersectingIndex(frameBoundsAABB, cullRectanglesAABB);
        if (index < 0) {
          frame._setFlags(FrameFlags.Culled);
        } else if (frame instanceof Shape) {
          /* Not ready yet
          var shape = <Shape>frame;
          transform.inverse(inverseTransform);
          var cullRectangleLocalAABB = cullRectanglesAABB[index];
          inverseTransform.transformRectangleAABB(cullRectangleLocalAABB);
          var opaqueRegion: OpaqueRegion = shape.source.properties["opaqueRegion"];
          if (opaqueRegion && opaqueRegion.isOpaque(cullRectangleLocalAABB)) {
            cullRectanglesAABB[index] = null;
          }
          */
        }
        return VisitorFlags.Continue;
      }, transform, FrameFlags.Empty, VisitorFlags.VisibleOnly | VisitorFlags.FrontToBack);
    }

    public render() {
      var stage = this._stage;
      var options = this._options;
      if (options.disable) {
        return;
      }
      var context = this.context;
      context.save();

      var lastDirtyRectangles: Rectangle[] = [];
      if (stage.trackDirtyRegions) {
        stage.gatherMarkedDirtyRegions(stage.matrix);
        stage.dirtyRegion.gatherRegions(lastDirtyRectangles);
        if (options.clipDirtyRegions) {
          if (!lastDirtyRectangles.length) {
            // Nothing is dirty, so skip rendering.
            context.restore();
            return;
          }
          if (options.clipCanvas) {
            context.beginPath();
            /**
             * If we have overlapping clipping regions we don't want to use even-odd fill rules.
             */
            var savedFillRule = context.mozFillRule;
            context.fillRule = context.mozFillRule = 'nonzero';
            for (var i = 0; i < lastDirtyRectangles.length; i++) {
              var rectangle = lastDirtyRectangles[i];
              rectangle.expand(2, 2);
              context.rect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
            }
            context.clip();
            context.fillRule = context.mozFillRule = savedFillRule;
          }
        }

      }

      var dirtyRectangles = lastDirtyRectangles.slice(0);

      context.globalAlpha = 1;

      if (options.cull) {
        this.cullFrame(stage, stage.matrix, dirtyRectangles.slice(0));
      }

      this.renderFrame(context, stage, stage.matrix, null, dirtyRectangles, 0, options);

      if (stage.trackDirtyRegions) {
        stage.dirtyRegion.clear();
      }

      if (options && options.drawLayers) {
        function drawRectangle(rectangle: Rectangle) {
          context.rect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
        }
        context.strokeStyle = "#FF4981";
      }

      context.restore();
    }

    static clearContext(context: CanvasRenderingContext2D, rectangle: Rectangle) {
      var canvas = context.canvas;
      context.clearRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
    }

    renderFrame(context: CanvasRenderingContext2D, root: Frame, transform: Matrix, clipRectangle: Rectangle, cullRectanglesAABB: Rectangle [], target: RenderTarget, options: any) {
      var self = this;

      if (clipRectangle) {
        context.save();
        context.beginPath();
        context.rect(clipRectangle.x, clipRectangle.y, clipRectangle.w, clipRectangle.h);
        context.clip();
      }

      root.visit(function visitFrame(frame: Frame, transform?: Matrix, flags?: FrameFlags): VisitorFlags {

        context.save();
        context.setTransform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
        context.globalAlpha = frame.getConcatenatedAlpha();

        if ((flags & FrameFlags.IsMask) && !(target & RenderTarget.Mask)) {
          context.restore();
          return VisitorFlags.Skip;
        }

        var hasFilters: boolean = (frame.filters.length > 0 && !(target & RenderTarget.Filters));
        var hasColorMatrix: boolean = (!frame.colorMatrix.isIdentity() && !(target & RenderTarget.ColorMatrix));
        var hasBlendMode: boolean = (frame.blendMode > 1 && !(target & RenderTarget.BlendMode));

        if (hasFilters || hasColorMatrix || hasBlendMode) {
          var boundsAABB = frame.getBounds().clone();
          transform.transformRectangleAABB(boundsAABB);
          var tx = boundsAABB.x;
          var ty = boundsAABB.y;
          boundsAABB.snap();
          var tx = boundsAABB.x - tx;
          var ty = boundsAABB.y - ty;
          //console.log(fbx.toFixed(3), fby.toFixed(3), fbw.toFixed(3), fbh.toFixed(3), boundsAABB.x, boundsAABB.y, boundsAABB.w, boundsAABB.h);

          var region: Region = frame.properties["regionCanvas2D"]
                             = self.canvasCache.allocateOrUpdate(boundsAABB.w,
                                                                 boundsAABB.h,
                                                                 frame.properties["regionCanvas2D"]);
          if (region) {
            var needsImageData: boolean = false;
            if (hasFilters) {
              target |= RenderTarget.Filters;
              needsImageData = true;
            }
            if (hasColorMatrix) {
              target |= RenderTarget.ColorMatrix;
              needsImageData = true;
            }
            if (hasBlendMode) {
              target |= RenderTarget.BlendMode;
            }

            var allocator: CanvasGrid = <CanvasGrid>region.allocator;
            var scratchContext: CanvasRenderingContext2D = allocator.context;
            Canvas2DStageRenderer.clearContext(scratchContext, region);
            transform.translate(region.x + tx - boundsAABB.x, region.y + ty - boundsAABB.y);
            self.renderFrame(scratchContext, frame, transform, region, null, target, options);
            transform.translate(-region.x - tx + boundsAABB.x, -region.y - ty + boundsAABB.y);

            var image;
            var imageData;
            if (needsImageData) {
              image = scratchContext.getImageData(region.x, region.y, region.w, region.h);
              imageData = image.data;
            }

            if (hasFilters) {
              //for (var i = 0, n = filters.length; i < n; i++) {
              //  filters[i].applyFilter(imageData);
              //}
            }

            if (hasColorMatrix) {
              var ct = frame.colorMatrix.getColorTransform();
              FILTERS.colortransform(imageData, image.width, image.height, ct[0], ct[1], ct[2], ct[4], ct[5], ct[6]);
            }

            if (needsImageData) {
              scratchContext.putImageData(image, region.x, region.y);
            }

            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);

            if (hasBlendMode) {
              context.globalCompositeOperation = self.getCompositeOperation(frame.blendMode);
            }

            tx = boundsAABB.x;
            ty = boundsAABB.y;
            boundsAABB.intersect(self._viewport);
            tx = boundsAABB.x - tx;
            ty = boundsAABB.y - ty;
            //console.log(boundsAABB.x, boundsAABB.y, boundsAABB.w, boundsAABB.h, region.x, region.y, region.w, region.h)

            context.drawImage(scratchContext.canvas, region.x + tx, region.y + ty, boundsAABB.w, boundsAABB.h, boundsAABB.x, boundsAABB.y, boundsAABB.w, boundsAABB.h);

            context.restore();
            context.restore();
            return VisitorFlags.Skip;
          }
        }

        if (!options.disableMasking && frame.mask && !frame._hasFlags(FrameFlags.IgnoreMask) && !(target & RenderTarget.Mask)) {
          frame._setFlags(FrameFlags.IgnoreMask);

          var maskCanvasContext = self.createScratchContext(context); // TODO: FIX THIS!
          var maskeeCanvasContext = self.createScratchContext(context); // TODO: FIX THIS!

          var maskTransform = frame.mask.getConcatenatedMatrix();
          var maskBoundsAABB = frame.mask.getBounds().clone();
          maskTransform.transformRectangleAABB(maskBoundsAABB);
          maskBoundsAABB.intersect(self._viewport);

          var frameBoundsAABB = frame.getBounds().clone();
          transform.transformRectangleAABB(frameBoundsAABB);
          maskBoundsAABB.intersect(frameBoundsAABB);
          maskBoundsAABB.snap();

          //Canvas2DStageRenderer.clearContext(maskCanvasContext, maskBoundsAABB);
          self.renderFrame(maskCanvasContext, frame.mask, maskTransform, maskBoundsAABB, null, target | RenderTarget.Mask, options);

          //Canvas2DStageRenderer.clearContext(maskeeCanvasContext, maskBoundsAABB);
          maskeeCanvasContext.globalCompositeOperation = 'source-over';
          self.renderFrame(maskeeCanvasContext, frame, transform, maskBoundsAABB, null, target | RenderTarget.Maskee, options);

          if (options.compositeMask) {
            maskeeCanvasContext.globalCompositeOperation = 'destination-in';
          }
          maskeeCanvasContext.drawImage(maskCanvasContext.canvas, maskBoundsAABB.x, maskBoundsAABB.y, maskBoundsAABB.w, maskBoundsAABB.h, maskBoundsAABB.x, maskBoundsAABB.y, maskBoundsAABB.w, maskBoundsAABB.h);
          context.save();
          context.setTransform(1, 0, 0, 1, 0, 0);
          context.drawImage(maskeeCanvasContext.canvas, maskBoundsAABB.x, maskBoundsAABB.y, maskBoundsAABB.w, maskBoundsAABB.h, maskBoundsAABB.x, maskBoundsAABB.y, maskBoundsAABB.w, maskBoundsAABB.h);
          if (options.debug) {
            context.strokeStyle = "red";
            context.strokeRect(maskBoundsAABB.x, maskBoundsAABB.y, maskBoundsAABB.w, maskBoundsAABB.h);
          }
          context.restore();
          context.restore();
          return VisitorFlags.Skip;
        }

        var inverseTransform: Matrix = Matrix.createIdentity();
        frame.getConcatenatedMatrix().inverse(inverseTransform);
        var clip = self._viewport.clone();
        inverseTransform.transformRectangleAABB(clip);

        var frameBoundsAABB = frame.getBounds().clone();
        transform.transformRectangleAABB(frameBoundsAABB);
        if (frame._hasFlags(FrameFlags.Culled)) {
          frame._removeFlags(FrameFlags.Culled);
        } else {
          if (frame instanceof Shape) {
            frame._previouslyRenderedAABB = frameBoundsAABB;
            var shape = <Shape>frame;
            var bounds = shape.getBounds().clone();
            if (!bounds.isEmpty()) {
              shape.source.render(context, clip);
            }
            if (options.paintFlashing) {
              context.fillStyle = ColorStyle.randomStyle();
              context.globalAlpha = 0.5;
              context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
            }
          } else if (options.paintBounds && frame instanceof FrameContainer) {
            var bounds = frame.getBounds().clone();
            context.strokeStyle = ColorStyle.LightOrange;
            context.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
          }
        }

        context.restore();

        frame._removeFlags(FrameFlags.IgnoreMask);

        return VisitorFlags.Continue;
      }, transform, FrameFlags.Empty);

      if (clipRectangle) {
        context.restore();
      }
    }

    private getCompositeOperation(blendMode: BlendMode): string {
      // TODO:

      // These Flash blend modes have no canvas equivalent:
      // - blendModeClass.SUBTRACT
      // - blendModeClass.INVERT
      // - blendModeClass.SHADER
      // - blendModeClass.ADD

      // These blend modes are actually Porter-Duff compositing operators.
      // The backdrop is the nearest parent with blendMode set to LAYER.
      // When there is no LAYER parent, they are ignored (treated as NORMAL).
      // - blendModeClass.ALPHA (destination-in)
      // - blendModeClass.ERASE (destination-out)
      // - blendModeClass.LAYER [defines backdrop]

      var compositeOp: string = "source-over";

      switch (blendMode) {
        case BlendMode.Multiply:   compositeOp = "multiply";   break;
        case BlendMode.Screen:     compositeOp = "screen";     break;
        case BlendMode.Lighten:    compositeOp = "lighten";    break;
        case BlendMode.Darken:     compositeOp = "darken";     break;
        case BlendMode.Difference: compositeOp = "difference"; break;
        case BlendMode.Overlay:    compositeOp = "overlay";    break;
        case BlendMode.HardLight:  compositeOp = "hard-light"; break;
      }

      return compositeOp;
    }

  }
}
