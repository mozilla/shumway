/// <reference path='references.ts'/>
module Shumway.GFX {
  import Rectangle = Geometry.Rectangle;
  import Point = Geometry.Point;
  import Matrix = Geometry.Matrix;
  import DirtyRegion = Geometry.DirtyRegion;
  import Filter = Shumway.GFX.Filter;
  import TileCache = Geometry.TileCache;
  import Tile = Geometry.Tile;
  import OBB = Geometry.OBB;

  export enum BlendMode {
    Normal     = 1,
    Layer      = 2,
    Multiply   = 3,
    Screen     = 4,
    Lighten    = 5,
    Darken     = 6,
    Difference = 7,
    Add        = 8,
    Subtract   = 9,
    Invert     = 10,
    Alpha      = 11,
    Erase      = 12,
    Overlay    = 13,
    HardLight  = 14
  }

  /**
   * Controls how the visitor walks the display tree.
   */
  export enum VisitorFlags {
    None         = 0,

    /**
     * Continue with normal traversal.
     */
    Continue     = 0,

    /**
     * Not used yet, should probably just stop the visitor.
     */
    Stop         = 1,

    /**
     * Skip processing current frame.
     */
    Skip         = 2,

    /**
     * Only visit visible frames.
     */
    VisibleOnly  = 4,

    /**
     * Visit front to back.
     */
    FrontToBack  = 8
  }

  function getRandomIntInclusive(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  export class StageRendererOptions {
    debug: boolean = false;
    disable: boolean = false;
    paintBounds: boolean = false;
    paintFlashing: boolean = false;
  }

  export enum Backend {
    Canvas2D = 0,
    WebGL = 1,
    DOM = 2,
    SVG = 3
  }

  export class StageRenderer {
    _canvas: HTMLCanvasElement;
    _stage: Stage;
    constructor(canvas: HTMLCanvasElement, stage: Stage) {
      this._canvas = canvas;
      this._stage = stage;
    }
    public render() {

    }
  }

  export class Stage extends FrameContainer {
    public trackDirtyRegions: boolean;
    public dirtyRegion: DirtyRegion;
    public w: number;
    public h: number;

    constructor(w: number, h: number, trackDirtyRegions: boolean = false) {
      super();
      this.w = w;
      this.h = h;
      this.dirtyRegion = new DirtyRegion(w, h);
      this.trackDirtyRegions = trackDirtyRegions;
      this._setFlags(FrameFlags.Dirty);
    }

    gatherMarkedDirtyRegions(transform: Matrix) {
      var self = this;
      // Find all invalid frames.
      this.visit(function (frame: Frame, transform?: Matrix, flags?: FrameFlags): VisitorFlags {
        frame._removeFlags(FrameFlags.Dirty);
        if (frame instanceof FrameContainer) {
          return VisitorFlags.Continue;
        }
        if (flags & FrameFlags.Dirty) {
          var rectangle = frame.getBounds().clone();
          transform.transformRectangleAABB(rectangle);
          self.dirtyRegion.addDirtyRectangle(rectangle);
          if (frame._previouslyRenderedAABB) {
            // Add last render position to dirty list.
            self.dirtyRegion.addDirtyRectangle(frame._previouslyRenderedAABB);
          }
        }
        return VisitorFlags.Continue;
      }, transform, FrameFlags.Empty);
    }

    gatherFrames() {
      var frames = [];
      this.visit(function (frame: Frame, transform?: Matrix): VisitorFlags {
        if (!(frame instanceof FrameContainer)) {
          frames.push(frame);
        }
        return VisitorFlags.Continue;
      }, this.matrix);
      return frames;
    }

    gatherLayers() {
      var layers = [];
      var currentLayer;
      this.visit(function (frame: Frame, transform?: Matrix): VisitorFlags {
        if (frame instanceof FrameContainer) {
          return VisitorFlags.Continue;
        }
        var rectangle = frame.getBounds().clone();
        transform.transformRectangleAABB(rectangle);
        if (frame._hasFlags(FrameFlags.Dirty)) {
          if (currentLayer) {
            layers.push(currentLayer);
          }
          layers.push(rectangle.clone());
          currentLayer = null;
        } else {
          if (!currentLayer) {
            currentLayer = rectangle.clone();
          } else {
            currentLayer.union(rectangle);
          }
        }
        return VisitorFlags.Continue;
      }, this.matrix);

      if (currentLayer) {
        layers.push(currentLayer);
      }

      return layers;
    }
  }

  export class SolidRectangle extends Frame {
    fillStyle: string = randomStyle();
    constructor() {
      super();
    }
  }

  export class Shape extends Frame {
    source: IRenderable;
    constructor(source: IRenderable) {
      super();
      this.source = source;
    }

    public getBounds(): Rectangle {
      return this.source.getBounds();
    }
  }

  export class Renderable implements IRenderable {
    private _bounds: Rectangle;
    properties: {[name: string]: any} = {};
    render: (context: CanvasRenderingContext2D, clipBounds?: Rectangle) => void;
    isDynamic: boolean = true;
    isInvalid: boolean = true;
    isScalable: boolean = true;
    isTileable: boolean = false;
    constructor(bounds: Rectangle, render: (context: CanvasRenderingContext2D, clipBounds?: Rectangle) => void) {
      this.render = render;
      this._bounds = bounds.clone();
    }
    getBounds (): Rectangle {
      return this._bounds;
    }
  }

  export class Label implements IRenderable {
    properties: {[name: string]: any} = {};
    private _text: string;
    private _bounds: Rectangle;

    get text (): string {
      return this._text;
    }

    set text (value: string) {
      this._text = value;
    }

    isDynamic: boolean = true;
    isInvalid: boolean = false;
    isScalable: boolean = true;
    isTileable: boolean = false;
    constructor(w: number, h: number) {
      this._bounds = new Rectangle(0, 0, w, h);
    }
    getBounds (): Rectangle {
      return this._bounds;
    }
    render (context: CanvasRenderingContext2D, clipBounds?: Rectangle) {
      context.save();
      context.textBaseline = "top";
      context.fillStyle = "white";
      context.fillText(this.text, 0, 0);
      context.restore();
    }
  }

  export class Grid implements IRenderable {
    properties: {[name: string]: any} = {};
    isDynamic: boolean = false;
    isInvalid: boolean = true;
    isScalable: boolean = true;
    isTileable: boolean = true;

    private _maxBounds = Rectangle.createMaxI16();

    constructor() {

    }

    getBounds (): Rectangle {
      return this._maxBounds;
    }

    render (context: CanvasRenderingContext2D, clipBounds?: Rectangle) {
      context.save();

      var gridBounds = clipBounds || this.getBounds();

      context.fillStyle = ColorStyle.VeryDark;
      context.fillRect(gridBounds.x, gridBounds.y, gridBounds.w, gridBounds.h);

      function gridPath(level) {
        var vStart = Math.floor(gridBounds.x / level) * level;
        var vEnd   = Math.ceil((gridBounds.x + gridBounds.w) / level) * level;

        for (var x = vStart; x < vEnd; x += level) {
          context.moveTo(x + 0.5, gridBounds.y);
          context.lineTo(x + 0.5, gridBounds.y + gridBounds.h);
        }

        var hStart = Math.floor(gridBounds.y / level) * level;
        var hEnd   = Math.ceil((gridBounds.y + gridBounds.h) / level) * level;

        for (var y = hStart; y < hEnd; y += level) {
          context.moveTo(gridBounds.x, y + 0.5);
          context.lineTo(gridBounds.x + gridBounds.w, y + 0.5);
        }
      }

      context.beginPath();
      gridPath(100);
      context.lineWidth = 1;
      context.strokeStyle = ColorStyle.Dark;
      context.stroke();

      context.beginPath();
      gridPath(500);
      context.lineWidth = 1;
      context.strokeStyle = ColorStyle.TabToolbar;
      context.stroke();

      context.beginPath();
      gridPath(1000);
      context.lineWidth = 3;
      context.strokeStyle = ColorStyle.Toolbars;
      context.stroke();

      var MAX = 1024 * 1024;
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(-MAX, 0.5);
      context.lineTo(MAX , 0.5);
      context.moveTo(0.5, -MAX);
      context.lineTo(0.5, MAX);
      context.strokeStyle = ColorStyle.Orange;
      context.stroke();

      context.restore();
    }
  }
}