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

interface CanvasRenderingContext2D {
  globalColorMatrix: Shumway.GFX.ColorMatrix;
}

interface CanvasGradient {
  _template: any;
}

module Shumway.GFX {
  export enum TraceLevel {
    None,
    Brief,
    Verbose,
  }

  var counter = Shumway.Metrics.Counter.instance;
  export var frameCounter = new Shumway.Metrics.Counter(true);

  export var traceLevel = TraceLevel.Verbose;
  export var writer: IndentingWriter = null;

  export function frameCount(name) {
    counter.count(name);
    frameCounter.count(name);
  }

  export var timelineBuffer = new Shumway.Tools.Profiler.TimelineBuffer("GFX");

  export function enterTimeline(name: string, data?: any) {
    profile && timelineBuffer && timelineBuffer.enter(name, data);
  }

  export function leaveTimeline(name?: string, data?: any) {
    profile && timelineBuffer && timelineBuffer.leave(name, data);
  }

  var nativeAddColorStop = null;
  var nativeCreateLinearGradient = null;
  var nativeCreateRadialGradient = null;

  /**
   * Transforms a fill or stroke style by the given color matrix.
   */
  function transformStyle(context: CanvasRenderingContext2D, style: any, colorMatrix: Shumway.GFX.ColorMatrix): string {
    if (!polyfillColorTransform || !colorMatrix) {
      return style;
    }
    if (typeof style === "string") {
      // Parse CSS color styles and transform them.
      var rgba = Shumway.ColorUtilities.cssStyleToRGBA(style);
      return Shumway.ColorUtilities.rgbaToCSSStyle(colorMatrix.transformRGBA(rgba));
    } else if (style instanceof CanvasGradient) {
      if (style._template) {
        // If gradient style has a template, construct a new gradient style from it whith
        // its color stops transformed.
        return style._template.createCanvasGradient(context, colorMatrix);
      }
    }
    return style; // "#ff69b4"
  }

  /**
   * Whether to polyfill color transforms. This adds a |globalColorMatrix| property on |CanvasRenderingContext2D|
   * that is used to transform all stroke and fill styles before a drawing operation happens.
   */
  var polyfillColorTransform = true;

  /**
   * Gradients are opaque objects and their properties cannot be inspected. Here we hijack gradient style constructors
   * and attach "template" objects on gradients so that we can keep track of their position attributes and color stops.
   * Using these "template" objects, we can clone and transform gradients.
   */
  if (polyfillColorTransform && typeof CanvasRenderingContext2D !== 'undefined') {
    nativeAddColorStop = CanvasGradient.prototype.addColorStop;
    nativeCreateLinearGradient = CanvasRenderingContext2D.prototype.createLinearGradient;
    nativeCreateRadialGradient = CanvasRenderingContext2D.prototype.createRadialGradient;

    CanvasRenderingContext2D.prototype.createLinearGradient = function (x0: number, y0: number, x1: number, y1: number) {
      var gradient = new CanvasLinearGradient(x0, y0, x1, y1);
      return gradient.createCanvasGradient(this, null);
    };

    CanvasRenderingContext2D.prototype.createRadialGradient = function (x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) {
      var gradient = new CanvasRadialGradient(x0, y0, r0, x1, y1, r1);
      return gradient.createCanvasGradient(this, null);
    };

    CanvasGradient.prototype.addColorStop = function (offset: number, color: string) {
      nativeAddColorStop.call(this, offset, color);
      this._template.addColorStop(offset, color);
    }
  }

  class ColorStop {
    constructor (public offset: number, public color: string) {
      // ...
    }
  }

  /**
   * Template for linear gradients.
   */
  class CanvasLinearGradient {
    _transform: SVGMatrix;
    constructor (
      public x0: number, public y0: number,
      public x1: number, public y1: number) {
      // ...
    }
    colorStops: ColorStop [] = [];
    addColorStop(offset: number, color: string) {
      this.colorStops.push(new ColorStop(offset, color));
    }
    createCanvasGradient(context: CanvasRenderingContext2D, colorMatrix: Shumway.GFX.ColorMatrix): CanvasGradient {
      var gradient = nativeCreateLinearGradient.call(context, this.x0, this.y0, this.x1, this.y1);
      var colorStops = this.colorStops;
      for (var i = 0; i < colorStops.length; i++) {
        var colorStop = colorStops[i];
        var offset = colorStop.offset;
        var color = colorStop.color;
        color = colorMatrix ? transformStyle(context, color, colorMatrix) : color;
        nativeAddColorStop.call(gradient, offset, color);
      }
      gradient._template = this;
      gradient._transform = this._transform;
      return gradient;
    }
  }

  /**
   * Template for radial gradients.
   */
  class CanvasRadialGradient {
    _transform: SVGMatrix;
    constructor (
      public x0: number, public y0: number, public r0: number,
      public x1: number, public y1: number, public r1: number) {
      // ...
    }
    colorStops: ColorStop [] = [];
    addColorStop(offset: number, color: string) {
      this.colorStops.push(new ColorStop(offset, color));
    }
    createCanvasGradient(context: CanvasRenderingContext2D, colorMatrix: Shumway.GFX.ColorMatrix): CanvasGradient {
      var gradient = nativeCreateRadialGradient.call(context, this.x0, this.y0, this.r0, this.x1, this.y1, this.r1);
      var colorStops = this.colorStops;
      for (var i = 0; i < colorStops.length; i++) {
        var colorStop = colorStops[i];
        var offset = colorStop.offset;
        var color = colorStop.color;
        color = colorMatrix ? transformStyle(context, color, colorMatrix) : color;
        nativeAddColorStop.call(gradient, offset, color);
      }
      gradient._template = this;
      gradient._transform = this._transform;
      return gradient;
    }
  }

  enum PathCommand {
    ClosePath = 1,
    MoveTo,
    LineTo,
    QuadraticCurveTo,
    BezierCurveTo,
    ArcTo,
    Rect,
    Arc,
    Save,
    Restore,
    Transform
  }

  /**
   * Polyfill for missing |Path2D|. An instance of this class keeps a record of all drawing commands
   * ever called on it.
   */
  export class Path {
    private _commands: Uint8Array;
    private _commandPosition: number;
    private _data: Float64Array;
    private _dataPosition: number;

    private static _arrayBufferPool = new ArrayBufferPool();

    /**
     * Takes a |Path2D| instance and a 2d context to replay the recorded drawing commands.
     */
    static _apply(path: Path, context: CanvasRenderingContext2D) {
      var commands = path._commands;
      var d = path._data;
      var i = 0;
      var j = 0;
      context.beginPath();
      var commandPosition = path._commandPosition;
      while (i < commandPosition) {
        switch (commands[i++]) {
          case PathCommand.ClosePath:
            context.closePath();
            break;
          case PathCommand.MoveTo:
            context.moveTo(d[j++], d[j++]);
            break;
          case PathCommand.LineTo:
            context.lineTo(d[j++], d[j++]);
            break;
          case PathCommand.QuadraticCurveTo:
            context.quadraticCurveTo(d[j++], d[j++], d[j++], d[j++]);
            break;
          case PathCommand.BezierCurveTo:
            context.bezierCurveTo(d[j++], d[j++], d[j++], d[j++], d[j++], d[j++]);
            break;
          case PathCommand.ArcTo:
            context.arcTo(d[j++], d[j++], d[j++], d[j++], d[j++]);
            break;
          case PathCommand.Rect:
            context.rect(d[j++], d[j++], d[j++], d[j++]);
            break;
          case PathCommand.Arc:
            context.arc(d[j++], d[j++], d[j++], d[j++], d[j++], !!d[j++]);
            break;
          case PathCommand.Save:
            context.save();
            break;
          case PathCommand.Restore:
            context.restore();
            break;
          case PathCommand.Transform:
            context.transform(d[j++], d[j++], d[j++], d[j++], d[j++], d[j++]);
            break;
        }
      }
    }

    constructor(arg: any) {
      this._commands = new Uint8Array(Path._arrayBufferPool.acquire(8), 0, 8);
      this._commandPosition = 0;

      this._data = new Float64Array(Path._arrayBufferPool.acquire(8 * Float64Array.BYTES_PER_ELEMENT), 0, 8);
      this._dataPosition = 0;

      if (arg instanceof Path) {
        this.addPath(arg);
      }
    }

    private _ensureCommandCapacity(length: number) {
      this._commands = Path._arrayBufferPool.ensureUint8ArrayLength(this._commands, length);
    }

    private _ensureDataCapacity(length: number) {
      this._data = Path._arrayBufferPool.ensureFloat64ArrayLength(this._data, length);
    }

    private _writeCommand(command: number) {
      if (this._commandPosition >= this._commands.length) {
        this._ensureCommandCapacity(this._commandPosition + 1);
      }
      this._commands[this._commandPosition++] = command;
    }

    private _writeData(a: number, b: number, c?: number, d?: number, e?: number, f?: number, g?: number) {
      var argc = arguments.length;
      if (this._dataPosition + argc >= this._data.length) {
        this._ensureDataCapacity(this._dataPosition + argc);
      }
      var data = this._data;
      var p = this._dataPosition;
      data[p] = a;
      data[p + 1] = b;
      if (argc > 2) {
        data[p + 2] = c;
        data[p + 3] = d;
        if (argc > 4) {
          data[p + 4] = e;
          data[p + 5] = f;
          if (argc > 5) {
            data[p + 6] = g;
          }
        }
      }
      this._dataPosition += argc;
    }

    closePath() {
      this._writeCommand(PathCommand.ClosePath);
    }

    moveTo(x: number, y: number) {
      this._writeCommand(PathCommand.MoveTo);
      this._writeData(x, y);
    }

    lineTo(x: number, y:number) {
      this._writeCommand(PathCommand.LineTo);
      this._writeData(x, y);
    }

    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
      this._writeCommand(PathCommand.QuadraticCurveTo);
      this._writeData(cpx, cpy, x, y);
    }

    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
      this._writeCommand(PathCommand.BezierCurveTo);
      this._writeData(cp1x, cp1y, cp2x, cp2y, x, y);
    }

    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
      this._writeCommand(PathCommand.ArcTo);
      this._writeData(x1, y1, x2, y2, radius);
    }

    rect(x: number, y: number, width: number, height: number) {
      this._writeCommand(PathCommand.Rect);
      this._writeData(x, y, width, height);
    }

    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean) {
      this._writeCommand(PathCommand.Arc);
      this._writeData(x, y, radius, startAngle, endAngle, +anticlockwise);
    }

    /**
     * Copies and transforms all drawing commands stored in |path|.
     */
    addPath(path: Path, transformation?: SVGMatrix) {
      if (transformation) {
        this._writeCommand(PathCommand.Save);
        this._writeCommand(PathCommand.Transform);
        this._writeData(
          transformation.a,
          transformation.b,
          transformation.c,
          transformation.d,
          transformation.e,
          transformation.f
        );
      }

      // Copy commands.
      var newCommandPosition = this._commandPosition + path._commandPosition;
      if (newCommandPosition >= this._commands.length) {
        this._ensureCommandCapacity(newCommandPosition);
      }
      var commands = this._commands;
      var pathCommands = path._commands;
      for (var i = this._commandPosition, j = 0; i < newCommandPosition; i++) {
        commands[i] = pathCommands[j++];
      }
      this._commandPosition = newCommandPosition;

      // Copy data.
      var newDataPosition = this._dataPosition + path._dataPosition;
      if (newDataPosition >= this._data.length) {
        this._ensureDataCapacity(newDataPosition);
      }
      var data = this._data;
      var pathData = path._data;
      for (var i = this._dataPosition, j = 0; i < newDataPosition; i++) {
        data[i] = pathData[j++];
      }
      this._dataPosition = newDataPosition;

      if (transformation) {
        this._writeCommand(PathCommand.Restore);
      }
    }
  }

  // Polyfill |Path2D| if it is not defined or if its |addPath| method doesn't exist. This means that we
  // always need to polyfill this in FF until addPath lands which sucks.
  if (typeof CanvasRenderingContext2D !== 'undefined' && (typeof Path2D === 'undefined' || !Path2D.prototype.addPath)) {
    /**
     * We override all methods of |CanvasRenderingContext2D| that accept a |Path2D| object as one
     * of its arguments, so that we can apply all recorded drawing commands before calling the
     * original function.
     */
    var nativeFill = CanvasRenderingContext2D.prototype.fill;
    CanvasRenderingContext2D.prototype.fill = <any>(function (path?: any, fillRule?: any) {
      if (arguments.length) {
        if (path instanceof Path) {
          Path._apply(path, this);
        } else {
          fillRule = path;
        }
      }
      if (fillRule) {
        nativeFill.call(this, fillRule);
      } else {
        nativeFill.call(this);
      }
    });
    var nativeStroke = CanvasRenderingContext2D.prototype.stroke;
    CanvasRenderingContext2D.prototype.stroke = <any>(function (path?: any, fillRule?: any) {
      if (arguments.length) {
        if (path instanceof Path) {
          Path._apply(path, this);
        } else {
          fillRule = path;
        }
      }
      if (fillRule) {
        nativeStroke.call(this, fillRule);
      } else {
        nativeStroke.call(this);
      }
    });
    var nativeClip = CanvasRenderingContext2D.prototype.clip;
    CanvasRenderingContext2D.prototype.clip = <any>(function (path?: any, fillRule?: any) {
      if (arguments.length) {
        if (path instanceof Path) {
          Path._apply(path, this);
        } else {
          fillRule = path;
        }
      }
      if (fillRule) {
        nativeClip.call(this, fillRule);
      } else {
        nativeClip.call(this);
      }
    });

    // Expose our pollyfill to the global object.
    window['Path2D'] = Path;
  }

  if (typeof CanvasPattern !== "undefined") {
    /**
     * Polyfill |setTransform| on |CanvasPattern| and |CanvasGradient|. Firefox implements this for |CanvasPattern|
     * in Nightly but doesn't for |CanvasGradient| yet.
     *
     * This polyfill uses |Path2D|, which is polyfilled above. You can get a native implementaiton of |Path2D| in
     * Chrome if you enable experimental canvas features in |chrome://flags/|. In Firefox you'll have to wait for
     * https://bugzilla.mozilla.org/show_bug.cgi?id=985801 to land.
     */
    if (Path2D.prototype.addPath) {
      function setTransform(matrix: SVGMatrix) {
        this._transform = matrix;
        if (this._template) {
          this._template._transform = matrix;
        }
      }
      if (!CanvasPattern.prototype.setTransform) {
        CanvasPattern.prototype.setTransform = setTransform;
      }
      if (!CanvasGradient.prototype.setTransform) {
        CanvasGradient.prototype.setTransform = setTransform;
      }
      var originalFill = CanvasRenderingContext2D.prototype.fill;
      var originalStroke = CanvasRenderingContext2D.prototype.stroke;
      /**
       * If the current fillStyle is a |CanvasPattern| or |CanvasGradient| that has a SVGMatrix transformed applied to it, we
       * first apply the pattern's transform to the current context and then draw the path with the
       * inverse fillStyle transform applied to it so that it is drawn in the expected original location.
       */
      CanvasRenderingContext2D.prototype.fill = <any>(function fill(path: Path2D, fillRule?: string): void {
        var supportsStyle = this.fillStyle instanceof CanvasPattern || this.fillStyle instanceof CanvasGradient;
        var hasStyleTransformation = !!this.fillStyle._transform;
        if (supportsStyle && hasStyleTransformation && path instanceof Path2D) {
          var m = this.fillStyle._transform;
          var i = m.inverse();
          // Transform the context by the style transform ...
          this.transform(m.a, m.b, m.c, m.d, m.e, m.f);
          // transform the path by the inverse of the style transform ...
          var transformedPath = new Path2D();
          transformedPath.addPath(path, i);
          // draw the transformed path, which should render it in its original position but with a transformed style.
          originalFill.call(this, transformedPath, fillRule);
          this.transform(i.a, i.b, i.c, i.d, i.e, i.f);
          return;
        }
        if (arguments.length === 0) {
          originalFill.call(this);
        } else if (arguments.length === 1) {
          originalFill.call(this, path);
        } else if (arguments.length === 2) {
          originalFill.call(this, path, fillRule);
        }
      });

      /**
       * Same as for |fill| above.
       */
      CanvasRenderingContext2D.prototype.stroke = <any>(function fill(path: Path2D): void {
        var supportsStyle = this.strokeStyle instanceof CanvasPattern || this.strokeStyle instanceof CanvasGradient;
        var hasStyleTransformation = !!this.strokeStyle._transform;
        if (supportsStyle && hasStyleTransformation && path instanceof Path2D) {
          var m = this.strokeStyle._transform;
          var i = m.inverse();
          // Transform the context by the style transform ...
          this.transform(m.a, m.b, m.c, m.d, m.e, m.f);
          // transform the path by the inverse of the style transform ...
          var transformedPath = new Path2D();
          transformedPath.addPath(path, i);
          // draw the transformed path, which should render it in its original position but with a transformed style.
          var oldLineWidth = this.lineWidth;
          this.lineWidth *= (i.a + i.d) / 2; // Scale the lineWidth down since it will be scaled up by the current transform.
          originalStroke.call(this, transformedPath);
          this.transform(i.a, i.b, i.c, i.d, i.e, i.f);
          this.lineWidth = oldLineWidth;
          return;
        }
        if (arguments.length === 0) {
          originalStroke.call(this);
        } else if (arguments.length === 1) {
          originalStroke.call(this, path);
        }
      });
    }
  }

  /**
   * Polyfill |globalColorMatrix| on |CanvasRenderingContext2D|.
   */
  if (typeof CanvasRenderingContext2D !== 'undefined' && CanvasRenderingContext2D.prototype.globalColorMatrix === undefined) {
    var previousFill = CanvasRenderingContext2D.prototype.fill;
    var previousStroke = CanvasRenderingContext2D.prototype.stroke;
    var previousFillText = CanvasRenderingContext2D.prototype.fillText;
    var previousStrokeText = CanvasRenderingContext2D.prototype.strokeText;

    Object.defineProperty(CanvasRenderingContext2D.prototype, "globalColorMatrix", {
      get: function (): ColorMatrix {
        if (this._globalColorMatrix) {
          return this._globalColorMatrix.clone();
        }
        return null;
      },
      set: function (matrix: ColorMatrix) {
        if (!matrix) {
          this._globalColorMatrix = null;
          return;
        }
        if (this._globalColorMatrix) {
          this._globalColorMatrix.copyFrom(matrix);
        } else {
          this._globalColorMatrix = matrix.clone();
        }
      },
      enumerable: true,
      configurable: true
    });

    /**
     * Intercept calls to |fill| and transform fill style if a |globalColorMatrix| is set.
     */
    CanvasRenderingContext2D.prototype.fill = <any>(function (a?: any, b?: any) {
      var oldFillStyle = null;
      if (this._globalColorMatrix) {
        oldFillStyle = this.fillStyle;
        this.fillStyle = transformStyle(this, this.fillStyle, this._globalColorMatrix);
      }
      if (arguments.length === 0) {
        previousFill.call(this);
      } else if (arguments.length === 1) {
        previousFill.call(this, a);
      } else if (arguments.length === 2) {
        previousFill.call(this, a, b);
      }
      if (oldFillStyle) {
        this.fillStyle = oldFillStyle;
      }
    });

    /**
     * Same as |fill| above.
     */
    CanvasRenderingContext2D.prototype.stroke = <any>(function (a?: any, b?: any) {
      var oldStrokeStyle = null;
      if (this._globalColorMatrix) {
        oldStrokeStyle = this.strokeStyle;
        this.strokeStyle = transformStyle(this, this.strokeStyle, this._globalColorMatrix);
      }
      if (arguments.length === 0) {
        previousStroke.call(this);
      } else if (arguments.length === 1) {
        previousStroke.call(this, a);
      }
      if (oldStrokeStyle) {
        this.strokeStyle = oldStrokeStyle;
      }
    });

    /**
     * Same as |fill| above.
     */
    CanvasRenderingContext2D.prototype.fillText = <any>(function (text: string, x: number, y: number, maxWidth?: number) {
      var oldFillStyle = null;
      if (this._globalColorMatrix) {
        oldFillStyle = this.fillStyle;
        this.fillStyle = transformStyle(this, this.fillStyle, this._globalColorMatrix);
      }
      if (arguments.length === 3) {
        previousFillText.call(this, text, x, y);
      } else if (arguments.length === 4) {
        previousFillText.call(this, text, x, y, maxWidth);
      } else {
        Debug.unexpected();
      }
      if (oldFillStyle) {
        this.fillStyle = oldFillStyle;
      }
    });

    /**
     * Same as |fill| above.
     */
    CanvasRenderingContext2D.prototype.strokeText = <any>(function (text: string, x: number, y: number, maxWidth?: number) {
      var oldStrokeStyle = null;
      if (this._globalColorMatrix) {
        oldStrokeStyle = this.strokeStyle;
        this.strokeStyle = transformStyle(this, this.strokeStyle, this._globalColorMatrix);
      }
      if (arguments.length === 3) {
        previousStrokeText.call(this, text, x, y);
      } else if (arguments.length === 4) {
        previousStrokeText.call(this, text, x, y, maxWidth);
      } else {
        Debug.unexpected();
      }
      if (oldStrokeStyle) {
        this.strokeStyle = oldStrokeStyle;
      }
    });
  }
}

module Shumway.GFX {

  export interface ISurface {
    w: number;
    h: number;
    allocate(w: number, h: number): ISurfaceRegion;
    free(surfaceRegion: ISurfaceRegion);
  }

  export interface ISurfaceRegion {
    surface: ISurface;
    region: RegionAllocator.Region;
  }
}