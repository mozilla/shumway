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

/// <reference path='references.ts'/>
module Shumway.GFX {
  import Point = Geometry.Point;
  import Rectangle = Geometry.Rectangle;
  import PathCommand = Shumway.PathCommand;
  import Matrix = Shumway.ShapeMatrix;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import swap32 = Shumway.IntegerUtilities.swap32;
  import memorySizeToString = Shumway.StringUtilities.memorySizeToString;
  import assertUnreachable = Shumway.Debug.assertUnreachable;
  import unpremultiplyARGB = Shumway.ColorUtilities.unpremultiplyARGB;
  import tableLookupUnpremultiplyARGB = Shumway.ColorUtilities.tableLookupUnpremultiplyARGB;

  export enum RenderableFlags {
    None          = 0,

    /**
     * Whether source has dynamic content.
     */
    Dynamic       = 1,

    /**
     * Whether the source's dynamic content has changed. This is only defined if |isDynamic| is true.
     */
    Dirty         = 2,

    /**
     * Whether the source's content can be scaled and drawn at a higher resolution.
     */
    Scalable      = 4,

    /**
     * Whether the source's content should be tiled.
     */
    Tileable      = 8
  }

  /**
   * Represents some source renderable content.
   */
  export class Renderable {
    /**
     * Flags
     */
    _flags: RenderableFlags = RenderableFlags.None;

    setFlags(flags: RenderableFlags) {
      this._flags |= flags;
    }

    hasFlags(flags: RenderableFlags): boolean {
      return (this._flags & flags) === flags;
    }

    removeFlags(flags: RenderableFlags) {
      this._flags &= ~flags;
    }

    /**
     * Property bag used to attach dynamic properties to this object.
     */
    properties: {[name: string]: any} = {};

    _bounds: Rectangle;

    constructor(bounds: Rectangle) {
      this._bounds = bounds.clone();
    }

    /**
     * Bounds of the source content. This should never change.
     */
    getBounds (): Rectangle {
      return this._bounds;
    }

    /**
     * Render source content.
     */
    render(context: CanvasRenderingContext2D, clipBounds?: Shumway.GFX.Geometry.Rectangle): void {

    }
  }

  export class CustomRenderable extends Renderable {
    constructor(bounds: Rectangle, render: (context: CanvasRenderingContext2D, clipBounds: Shumway.GFX.Geometry.Rectangle) => void) {
      super(bounds);
      this.render = render;
    }
  }

  export class RenderableBitmap extends Renderable {
    _flags = RenderableFlags.Dynamic | RenderableFlags.Dirty;
    properties: {[name: string]: any} = {};
    _canvas: HTMLCanvasElement;
    private fillStyle: ColorStyle;

    private static _convertImage(sourceFormat: ImageType, targetFormat: ImageType, source: Int32Array, target: Int32Array) {
      if (source !== target) {
        release || assert (source.buffer !== target.buffer, "Can't handle overlapping views.");
      }
      if (sourceFormat === targetFormat) {
        if (source === target) {
          return;
        }
        var length = source.length;
        for (var i = 0; i < length; i++) {
          target[i] = source[i];
        }
        return;
      }
      var timelineDetails = "convertImage: " + ImageType[sourceFormat] + " to " + ImageType[targetFormat] + " (" + memorySizeToString(source.length) + ")";
      enterTimeline(timelineDetails);

      if (sourceFormat === ImageType.PremultipliedAlphaARGB &&
          targetFormat === ImageType.StraightAlphaRGBA) {
        Shumway.ColorUtilities.ensureUnpremultiplyTable();
        var length = source.length;
        for (var i = 0; i < length; i++) {
          var pARGB = swap32(source[i]);
          // TODO: Make sure this is inlined!
          var uARGB = tableLookupUnpremultiplyARGB(pARGB);
          var uABGR = (uARGB & 0xFF00FF00)  | // A_G_
                      (uARGB >> 16) & 0xff  | // A_GR
                      (uARGB & 0xff) << 16;   // ABGR
          target[i] = uABGR;
        }
      } else if (sourceFormat === ImageType.StraightAlphaARGB &&
                 targetFormat === ImageType.StraightAlphaRGBA) {
        for (var i = 0; i < length; i++) {
          target[i] = swap32(source[i]);
        }
      } else {
        notImplemented("Image Format Conversion: " + ImageType[sourceFormat] + " -> " + ImageType[targetFormat]);
      }
      leaveTimeline(timelineDetails);
    }

    public static FromDataBuffer(type: ImageType, dataBuffer: DataBuffer, bounds: Rectangle): RenderableBitmap {
      enterTimeline("RenderableBitmap.FromDataBuffer");
      var canvas = document.createElement("canvas");
      canvas.width = bounds.w;
      canvas.height = bounds.h;
      var renderableBitmap = new RenderableBitmap(canvas, bounds);
      renderableBitmap.updateFromDataBuffer(type, dataBuffer);
      leaveTimeline("RenderableBitmap.FromDataBuffer");
      return renderableBitmap;
    }

    public updateFromDataBuffer(type: ImageType, dataBuffer: DataBuffer) {
      enterTimeline("RenderableBitmap.updateFromDataBuffer");

      var context = this._canvas.getContext("2d");

      if (type === ImageType.JPEG ||
          type === ImageType.PNG ||
          type === ImageType.GIF)
      {
        var img = new Image();
        img.src = URL.createObjectURL(dataBuffer.toBlob());
        img.onload = function () {
          context.drawImage(img, 0, 0);
        };
        img.onerror = function () {
          throw "img error";
        };
      } else {
        var imageData: ImageData = context.createImageData(this._bounds.w, this._bounds.h);

        RenderableBitmap._convertImage (
          type,
          ImageType.StraightAlphaRGBA,
          new Int32Array(dataBuffer.buffer),
          new Int32Array(imageData.data.buffer)
        );

        enterTimeline("putImageData");
        context.putImageData(imageData, 0, 0);
        leaveTimeline("putImageData");
      }

      this.setFlags(RenderableFlags.Dirty);
      leaveTimeline("RenderableBitmap.updateFromDataBuffer");
    }

    constructor(canvas: HTMLCanvasElement, bounds: Rectangle) {
      super(bounds);
      this._canvas = canvas;
    }

    render(context: CanvasRenderingContext2D, clipBounds: Rectangle): void {
      context.save();
      if (this._canvas) {
        context.drawImage(this._canvas, 0, 0);
      } else {
        this._renderFallback(context);
      }
      context.restore();
    }

    draw(source: RenderableBitmap, matrix: Shumway.GFX.Geometry.Matrix, colorMatrix: Shumway.GFX.ColorMatrix, blendMode: number, clipRect: Rectangle): void {
      var context = this._canvas.getContext('2d');
      context.save();
      if (clipRect) {
        context.rect(clipRect.x, clipRect.y, clipRect.w, clipRect.h);
        context.clip();
      }
      var bounds = source.getBounds();
      if (bounds.x || bounds.y) {
        matrix.translate(bounds.x, bounds.y);
      }
      if (matrix) {
        context.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
      }
      context.drawImage(source._canvas, 0, 0);
      context.restore();
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

  export class RenderableShape extends Renderable {
    _flags: RenderableFlags = RenderableFlags.Dirty | RenderableFlags.Scalable | RenderableFlags.Tileable;
    properties: {[name: string]: any} = {};

    private fillStyle: ColorStyle;
    private _pathData: ShapeData;
    private _textures: RenderableBitmap[];

    private static LINE_CAP_STYLES = ['round', 'butt', 'square'];
    private static LINE_JOINT_STYLES = ['round', 'bevel', 'miter'];

    constructor(pathData: ShapeData, textures: RenderableBitmap[], bounds: Rectangle) {
      super(bounds);
      this._pathData = pathData;
      this._textures = textures;
    }

    getBounds(): Shumway.GFX.Geometry.Rectangle {
      return this._bounds;
    }

    render(context: CanvasRenderingContext2D, clipBounds: Rectangle): void {
      context.save();
      context.fillStyle = context.strokeStyle = 'transparent';

      var data = this._pathData;
      if (!data || data.commandsPosition === 0) {
        this._renderFallback(context);
        return;
      }
      enterTimeline("RenderableShape.render");
      // TODO: Optimize path handling to use only one path if possible.
      // If both line and fill style are set at the same time, we don't need to duplicate the
      // geometry.
      // TODO: cache Path2D and style objects.
      // We really only need to process the shape data once, and can then cache the results and
      // discard the original buffer. That should vastly improve performance of subsequent
      // renderings of the same shape.
      // TODO: correctly handle style changes.
      // Flash allows switching line and fill styles at arbitrary points, so you can have a
      // shape with a single fill but varying line styles. We support that, but don't yet
      // delay stroking of the lines until the fill is finished. Probably by pushing all
      // stroke paths onto a stack.
      var fillPath: Path2D = null;
      var strokePath: Path2D = null;
      var fillTransform: Matrix = null;
      var strokeTransform: Matrix = null;
      // We have to alway store the last position because Flash keeps the drawing cursor where it
      // was when changing fill or line style, whereas Canvas forgets it on beginning a new path.
      var x = 0;
      var y = 0;
      var cpX: number;
      var cpY: number;
      var formOpen = false;
      var formOpenX = 0;
      var formOpenY = 0;
      var commands = data.commands;
      var coordinates = data.coordinates;
      var styles = data.styles;
      styles.position = 0;
      var commandIndex = 0;
      var coordinatesIndex = 0;
      var commandsCount = data.commandsPosition;
      // Description of serialization format can be found in flash.display.Graphics.
      while (commandIndex < commandsCount) {
        var command = commands[commandIndex++];
        switch (command) {
          case PathCommand.MoveTo:
            assert(coordinatesIndex <= data.coordinatesPosition - 2);
            if (formOpen && fillPath) {
              fillPath.lineTo(formOpenX, formOpenY);
              strokePath && strokePath.lineTo(formOpenX, formOpenY);
            }
            formOpen = true;
            x = formOpenX = coordinates[coordinatesIndex++] / 20;
            y = formOpenY = coordinates[coordinatesIndex++] / 20;
            fillPath && fillPath.moveTo(x, y);
            strokePath && strokePath.moveTo(x, y);
            break;
          case PathCommand.LineTo:
            assert(coordinatesIndex <= data.coordinatesPosition - 2);
            x = coordinates[coordinatesIndex++] / 20;
            y = coordinates[coordinatesIndex++] / 20;
            fillPath && fillPath.lineTo(x, y);
            strokePath && strokePath.lineTo(x, y);
            break;
          case PathCommand.CurveTo:
            assert(coordinatesIndex <= data.coordinatesPosition - 4);
            cpX = coordinates[coordinatesIndex++] / 20;
            cpY = coordinates[coordinatesIndex++] / 20;
            x = coordinates[coordinatesIndex++] / 20;
            y = coordinates[coordinatesIndex++] / 20;
            fillPath && fillPath.quadraticCurveTo(cpX, cpY, x, y);
            strokePath && strokePath.quadraticCurveTo(cpX, cpY, x, y);
            break;
          case PathCommand.CubicCurveTo:
            assert(coordinatesIndex <= data.coordinatesPosition - 6);
            cpX = coordinates[coordinatesIndex++] / 20;
            cpY = coordinates[coordinatesIndex++] / 20;
            var cpX2 = coordinates[coordinatesIndex++] / 20;
            var cpY2 = coordinates[coordinatesIndex++] / 20;
            x = coordinates[coordinatesIndex++] / 20;
            y = coordinates[coordinatesIndex++] / 20;
            fillPath && fillPath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
            strokePath && strokePath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
            break;
          case PathCommand.BeginSolidFill:
            assert(styles.bytesAvailable >= 4);
            if (fillPath) {
              context.fill(fillPath, 'evenodd');
            }
            fillPath = new Path2D();
            fillPath.moveTo(x, y);
            context.fillStyle = ColorUtilities.rgbaToCSSStyle(styles.readUnsignedInt());
            break;
          case PathCommand.BeginBitmapFill:
            assert(styles.bytesAvailable >= 6 + 6 * 8 /* matrix fields as floats */ + 1 + 1);
            if (fillPath) {
              context.fill(fillPath, 'evenodd');
            }
            fillPath = new Path2D();
            fillPath.moveTo(x, y);
            var textureIndex = styles.readUnsignedInt();
            fillTransform = this._readMatrix(styles);
            var repeat = styles.readBoolean() ? 'repeat' : 'no-repeat';
            var smooth = styles.readBoolean();
            var texture = this._textures[textureIndex];
            assert(texture._canvas);
            context.fillStyle = context.createPattern(texture._canvas, repeat);
            context.msImageSmoothingEnabled = context.msImageSmoothingEnabled =
                                              context['imageSmoothingEnabled'] = smooth;
            break;
          case PathCommand.BeginGradientFill:
            // Assert at least one color stop.
            assert(styles.bytesAvailable >= 1 + 1 + 6 * 8 /* matrix fields as floats */ +
                                            1 + 1 + 4 + 1 + 1);
            if (fillPath) {
              context.fill(fillPath, 'evenodd');
            }
            fillPath = new Path2D();
            fillPath.moveTo(x, y);
            var gradientType = styles.readUnsignedByte();
            var focalPoint = styles.readByte() * 2 / 0xff;
            assert(focalPoint >= -1 && focalPoint <= 1);
            fillTransform = this._readMatrix(styles);
            // This effectively applies the matrix to the line the gradient is drawn along:
            var x1 = fillTransform.tx - fillTransform.a;
            var y1 = fillTransform.ty - fillTransform.b;
            var x2 = fillTransform.tx + fillTransform.a;
            var y2 = fillTransform.ty + fillTransform.b;

            var gradient = gradientType === GradientType.Linear ?
                           context.createLinearGradient(x1, y1, x2, y2) :
                           context.createRadialGradient(focalPoint, 0, 0, 0, 0, 1);
            var colorStopsCount = styles.readUnsignedByte();
            for (var i = 0; i < colorStopsCount; i++) {
              var ratio = styles.readUnsignedByte() / 0xff;
              var cssColor = ColorUtilities.rgbaToCSSStyle(styles.readUnsignedInt());
              gradient.addColorStop(ratio, cssColor);
            }
            context.fillStyle = gradient;

            // Skip spread and interpolation modes for now.
            styles.position += 2;
            break;
          case PathCommand.EndFill:
            if (fillPath) {
              context.fill(fillPath, 'evenodd');
              context.fillStyle = null;
              fillPath = null;
            }
            break;
          case PathCommand.LineStyleSolid:
            if (strokePath) {
              this._strokePath(context, strokePath);
            }
            strokePath = new Path2D();
            strokePath.moveTo(x, y);
            context.lineWidth = styles.readUnsignedByte();
            context.strokeStyle = ColorUtilities.rgbaToCSSStyle(styles.readUnsignedInt());
            // Skip pixel hinting and scale mode for now.
            styles.position += 2;
            context.lineCap = RenderableShape.LINE_CAP_STYLES[styles.readByte()];
            context.lineJoin = RenderableShape.LINE_JOINT_STYLES[styles.readByte()];
            context.miterLimit = styles.readByte();
            break;
          case PathCommand.LineEnd:
            if (strokePath) {
              this._strokePath(context, strokePath);
              context.strokeStyle = null;
              strokePath = null;
            }
            break;
          default:
            assertUnreachable('Invalid command ' + command + ' encountered at position' +
                              (commandIndex - 1) + ' of ' + commandsCount);
        }
      }
      if (formOpen && fillPath) {
        fillPath.lineTo(formOpenX, formOpenY);
        strokePath && strokePath.lineTo(formOpenX, formOpenY);
      }
      if (fillPath) {
        context.fill(fillPath, 'evenodd');
        context.fillStyle = null;
      }
      if (strokePath) {
        this._strokePath(context, strokePath);
        context.strokeStyle = null;
      }
      context.restore();
      leaveTimeline("RenderableShape.render");
    }

    // Special-cases 1px and 3px lines by moving the drawing position down/right by 0.5px.
    // Flash apparently does this to create sharp, non-aliased lines in the normal case of thin
    // lines drawn on round pixel values.
    // Our handling doesn't always create the same results: for drawing coordinates with
    // fractional values, Flash draws blurry lines. We do, too, but we still move the line
    // down/right. Flash does something slightly different, with the result that a line drawn
    // on coordinates slightly below round pixels (0.8, say) will be moved up/left.
    // Properly fixing this would probably have to happen in the rasterizer. Or when replaying
    // all the drawing commands, which seems expensive.
    private _strokePath(context: CanvasRenderingContext2D, path: Path2D): void {
      var lineWidth = context.lineWidth;
      if (lineWidth === 1 || lineWidth === 3) {
        context.translate(0.5, 0.5);
      }
      context.stroke(path);
      if (lineWidth === 1 || lineWidth === 3) {
        context.translate(-0.5, -0.5);
      }
    }

    private _readMatrix(data: DataBuffer): Matrix
    {
      return {a: data.readFloat(), b: data.readFloat(), c: data.readFloat(), d: data.readFloat(),
              tx: data.readFloat(), ty: data.readFloat()};
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

  export class Label extends Renderable {
    _flags: RenderableFlags = RenderableFlags.Dynamic | RenderableFlags.Scalable;
    properties: {[name: string]: any} = {};
    private _text: string;

    get text (): string {
      return this._text;
    }

    set text (value: string) {
      this._text = value;
    }

    constructor(w: number, h: number) {
      super(new Rectangle(0, 0, w, h));
    }

    render (context: CanvasRenderingContext2D, clipBounds?: Rectangle) {
      context.save();
      context.textBaseline = "top";
      context.fillStyle = "white";
      context.fillText(this.text, 0, 0);
      context.restore();
    }
  }

  export class Grid extends Renderable {
    _flags: RenderableFlags = RenderableFlags.Dirty | RenderableFlags.Scalable | RenderableFlags.Tileable;
    properties: {[name: string]: any} = {};

    constructor() {
      super(Rectangle.createMaxI16());
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
