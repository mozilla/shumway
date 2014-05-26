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
  import PathCommand = Geometry.PathCommand;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;

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
    forcePaint: boolean = false;
    paintBounds: boolean = false;
    paintFlashing: boolean = false;
    paintViewport: boolean = false;
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

  export class Bitmap implements IRenderable {
    properties: {[name: string]: any} = {};
    isDynamic: boolean = false;
    isInvalid: boolean = false;
    isScalable: boolean = false;
    isTileable: boolean = false;

    private _bounds: Rectangle;
    private _dataBuffer: DataBuffer;
    private fillStyle: ColorStyle;

    getBounds (): Rectangle {
      return this._bounds;
    }

    constructor(dataBuffer: DataBuffer, bounds: Rectangle) {
      this._bounds = bounds;
      this._dataBuffer = dataBuffer;
    }

    render(context: CanvasRenderingContext2D, clipBounds: Shumway.GFX.Geometry.Rectangle): void {
      this._renderFallback(context);
    }

    private _renderFallback(context: CanvasRenderingContext2D) {
      if (!this.fillStyle) {
        this.fillStyle = Shumway.ColorStyle.randomStyle();
      }
      var bounds = this._bounds;
      context.save();
      context.beginPath();
      context.lineWidth = 2;
      context.fillStyle = this.fillStyle;
      context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
      context.restore();
    }
  }

  export class ShapeGraphics implements IRenderable {
    properties: {[name: string]: any} = {};
    isDynamic: boolean = false;
    isInvalid: boolean = true;
    isScalable: boolean = true;
    isTileable: boolean = true;

    private fillStyle: ColorStyle;
    private _pathData: DataBuffer;
    private _bounds: Rectangle;

    private static LINE_CAP_STYLES = ['round', 'butt', 'square'];
    private static LINE_JOINT_STYLES = ['round', 'bevel', 'miter'];

    constructor(pathData: DataBuffer, bounds: Rectangle) {
      this._pathData = pathData;
      this._bounds = bounds;
    }

    getBounds(): Shumway.GFX.Geometry.Rectangle {
      return this._bounds;
    }

    render(context: CanvasRenderingContext2D, clipBounds: Shumway.GFX.Geometry.Rectangle): void {
      context.save();
      context.fillRule = context.mozFillRule = "evenodd";

      var data = this._pathData;
      if (!data || data.length === 0) {
        this._renderFallback(context);
        return;
      }
      // TODO: Optimize path handling to use only one path if possible.
      // If both line and fill style are set at the same time, we don't need to duplicate the
      // geometry.
      // TODO: correctly handle style changes.
      // Flash allows switching line and fill styles at arbitrary points, so you can have a
      // shape with a single fill but varying line styles. In that case, it's necessary to
      // delay stroking of the lines until the fill is finished. Probably by pushing all
      // stroke paths onto a stack.
      var fillPath = null;
      var strokePath = null;
      data.position = 0;
      // We have to alway store the last position because Flash keeps the drawing cursor where it
      // was when changing fill or line style, whereas Canvas forgets it on beginning a new path.
      var x = 0;
      var y = 0;
      var cpX: number;
      var cpY: number;
      // Description of serialization format can be found in flash.display.Graphics.
      while (data.bytesAvailable > 0) {
        var command = data.readUnsignedByte();
        switch (command) {
          case PathCommand.MoveTo:
            assert(data.bytesAvailable >= 8);
            x = data.readInt() / 20;
            y = data.readInt() / 20;
            fillPath && fillPath.moveTo(x, y);
            strokePath && strokePath.moveTo(x, y);
            break;
          case PathCommand.LineTo:
            assert(data.bytesAvailable >= 8);
            x = data.readInt() / 20;
            y = data.readInt() / 20;
            fillPath && fillPath.lineTo(x, y);
            strokePath && strokePath.lineTo(x, y);
            break;
          case PathCommand.CurveTo:
            assert(data.bytesAvailable >= 16);
            cpX = data.readInt() / 20;
            cpY = data.readInt() / 20;
            x = data.readInt() / 20;
            y = data.readInt() / 20;
            fillPath && fillPath.quadraticCurveTo(cpX, cpY, x, y);
            strokePath && strokePath.quadraticCurveTo(cpX, cpY, x, y);
            break;
          case PathCommand.CubicCurveTo:
            assert(data.bytesAvailable >= 24);
            cpX = data.readInt() / 20;
            cpY = data.readInt() / 20;
            var cpX2 = data.readInt() / 20;
            var cpY2 = data.readInt() / 20;
            x = data.readInt() / 20;
            y = data.readInt() / 20;
            fillPath && fillPath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
            strokePath && strokePath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
            break;
          case PathCommand.BeginSolidFill:
            assert(data.bytesAvailable >= 4);
            if (fillPath) {
              context.fill(fillPath);
            }
            fillPath = new Path2D();
            fillPath.moveTo(x, y);
            var color = data.readUnsignedInt();
            context.fillStyle = ColorUtilities.rgbaToCSSStyle(color);
            break;
          case PathCommand.EndFill:
            if (fillPath) {
              context.fill(fillPath);
              context.fillStyle = null;
              fillPath = null;
            }
            break;
          case PathCommand.LineStyleSolid:
            if (strokePath) {
              context.stroke(strokePath);
            }
            strokePath = new Path2D();
            strokePath.moveTo(x, y);
            context.lineWidth = data.readUnsignedByte();
            context.strokeStyle = ColorUtilities.rgbaToCSSStyle(data.readUnsignedInt());
            data.readBoolean(); // Skip pixel hinting.
            data.readByte(); // Skip scaleMode.
            context.lineCap = ShapeGraphics.LINE_CAP_STYLES[data.readByte()];
            context.lineJoin = ShapeGraphics.LINE_JOINT_STYLES[data.readByte()];
            context.miterLimit = data.readByte();
            break;
          case PathCommand.LineEnd:
            if (strokePath) {
              context.stroke(strokePath);
              context.strokeStyle = null;
              strokePath = null;
            }
        }
      }
      if (fillPath) {
        context.fill(fillPath);
        context.fillStyle = null;
      }
      if (strokePath) {
        context.stroke(strokePath);
        context.strokeStyle = null;
      }
      context.restore();
      this.isInvalid = false;
    }

    private _renderFallback(context: CanvasRenderingContext2D) {
      if (!this.fillStyle) {
        this.fillStyle = Shumway.ColorStyle.randomStyle();
      }
      var bounds = this._bounds;
      context.save();
      context.beginPath();
      context.lineWidth = 2;
      context.fillStyle = this.fillStyle;
      context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
//      context.textBaseline = "top";
//      context.fillStyle = "white";
//      context.fillText(String(id), bounds.x, bounds.y);
      context.restore();
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
