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

  /**
   * Polyfill for missing |Path2D|. An instance of this class keeps a record of all drawing commands
   * ever called on it.
   */
  class Path {
    private _commands: Uint8Array;
    private _commandPosition: number;
    private _data: Float32Array;
    private _dataPosition: number;

    /**
     * Takes a |Path2D| instance and a 2d context to replay the recorded drawing commands.
     */
    static _apply(path: Path, context: CanvasRenderingContext2D) {
      var commands = path._commands;
      var data = path._data;
      var i = 0;
      var j = 0;
      context.beginPath();
      while (i < commands.length) {
        switch (commands[i++]) {
          case PathCommand.closePath:
            context.closePath();
            break;
          case PathCommand.moveTo:
            context.moveTo(data[j++], data[j++]);
            break;
          case PathCommand.lineTo:
            context.lineTo(data[j++], data[j++]);
            break;
          case PathCommand.quadraticCurveTo:
            context.quadraticCurveTo(data[j++], data[j++], data[j++], data[j++]);
            break;
          case PathCommand.bezierCurveTo:
            context.bezierCurveTo(
              data[j++], data[j++], data[j++], data[j++], data[j++], data[j++]
            );
            break;
          case PathCommand.arcTo:
            context.arcTo(data[j++], data[j++], data[j++], data[j++], data[j++]);
            break;
          case PathCommand.rect:
            context.rect(data[j++], data[j++], data[j++], data[j++]);
            break;
          case PathCommand.arc:
            context.arc(
              data[j++], data[j++], data[j++], data[j++], data[j++], !!data[j++]
            );
            break;
          case PathCommand.save:
            context.save();
            break;
          case PathCommand.restore:
            context.restore();
            break;
          case PathCommand.transform:
            context.transform(
              data[j++], data[j++], data[j++], data[j++], data[j++], data[j++]
            );
            break;
        }
      }
    }

    constructor(arg: any) {
      this._commands = new Uint8Array(128);
      this._commandPosition = 0;
      this._data = new Float32Array(128);
      this._dataPosition = 0;
      if (arg instanceof Path) {
        this.addPath(arg);
      }
    }

    private _writeCommand(command: number) {
      var commands = this._commands;
      if (this._commandPosition >= commands.length) {
        commands = new Uint8Array(commands.length * 2);
        commands.set(this._commands);
        this._commands = commands;
      }
      commands[this._commandPosition++] = command;
    }

    private _writeData(a?: number, b?: number, c?: number, d?: number,
                       e?: number, f?: number, g?: number, h?: number) {
      var data = this._data;
      if (this._dataPosition + arguments.length >= data.length) {
        data = new Float32Array(data.length * 2);
        data.set(this._data);
        this._data = data;
      }
      for (var i = 0; i < arguments.length; i++) {
        data[this._dataPosition++] = arguments[i];
      }
    }

    closePath() {
      this._writeCommand(PathCommand.closePath);
    }

    moveTo(x: number, y: number) {
      this._writeCommand(PathCommand.moveTo);
      this._writeData(x, y);
    }

    lineTo(x: number, y:number) {
      this._writeCommand(PathCommand.lineTo);
      this._writeData(x, y);
    }

    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
      this._writeCommand(PathCommand.quadraticCurveTo);
      this._writeData(cpx, cpy, x, y);
    }

    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
      this._writeCommand(PathCommand.bezierCurveTo);
      this._writeData(cp1x, cp1y, cp2x, cp2y, x, y);
    }

    arcTo(x1: number, y1: number, x2: number, y2: number, radiusX: number, radiusY: number, rotation: number) {
      this._writeCommand(PathCommand.arcTo);
      this._writeData(x1, y1, x2, y2, radiusX, radiusY, rotation);
    }

    rect(x: number, y: number, width: number, height: number) {
      this._writeCommand(PathCommand.rect);
      this._writeData(x, y, width, height);
    }

    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean) {
      this._writeCommand(PathCommand.arc);
      this._writeData(x, y, radius, startAngle, endAngle, +anticlockwise);
    }

    /**
     * Copies all drawing commands stored in |path|.
     */
    addPath(path: Path, transformation?: SVGMatrix) {
      var commands = this._commands;
      var data = this._data;
      if (transformation) {
        this._writeCommand(PathCommand.save);
        this._writeCommand(PathCommand.transform);
        this._writeData(
          transformation.a,
          transformation.b,
          transformation.c,
          transformation.d,
          transformation.e,
          transformation.f
        );
      }
      for (var i = 0; i < path._commands.length; i++) {
        this._writeCommand(path._commands[i]);
      }
      this._writeData.apply(this, path._data);
      if (transformation) {
        this._writeCommand(PathCommand.restore);
      }
    }
  }

  enum PathCommand {
    closePath = 1,
    moveTo = 2,
    lineTo = 3,
    quadraticCurveTo = 4,
    bezierCurveTo = 5,
    arcTo = 6,
    rect = 7,
    arc = 8,
    save = 9,
    restore = 10,
    transform = 11
  }

  if (typeof CanvasRenderingContext2D !== 'undefined' && typeof Path2D === 'undefined') {
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
     * Polyfill for missing |setTransform| on CanvasPattern and CanvasGradient. Firefox implements |CanvasPattern| in nightly
     * but doesn't handle CanvasGradient yet.
     *
     * Otherwise you'll have to fall back on this polyfill that depends on yet another canvas feature that
     * is not implemented across all browsers, namely |Path2D.addPath|. You can get this working in Chrome
     * if you enable experimental canvas features in |chrome://flags/|. In Firefox you'll have to wait for
     * https://bugzilla.mozilla.org/show_bug.cgi?id=985801 to land.
     *
     * You shuold at least be able to get a build of Firefox or Chrome where setTransform works. Eventually,
     * we'll have to polyfill Path2D, we can work around the addPath limitation at that point.
     */
    if (!CanvasPattern.prototype.setTransform &&
        !CanvasGradient.prototype.setTransform &&
        Path2D.prototype.addPath) {
      CanvasPattern.prototype.setTransform  =
      CanvasGradient.prototype.setTransform = function (matrix: SVGMatrix) {
        this._transform = matrix;
      };

      var originalFill = CanvasRenderingContext2D.prototype.fill;
      /**
       * If the current fillStyle is a CanvasPattern that has a SVGMatrix transformed applied to it, we
       * first apply the pattern's transform to the current context and then draw the path with the
       * inverse fillStyle transform applied to it so that it is drawn in the expected original location.
       */
      CanvasRenderingContext2D.prototype.fill = <any>(function fill(path: Path2D, fillRule?: string): void {
        if ((this.fillStyle instanceof CanvasPattern || this.fillStyle instanceof CanvasGradient) &&
            this.fillStyle._transform &&
            path instanceof Path2D) {
          var m = this.fillStyle._transform;
          var i = m.inverse();
          this.transform(m.a, m.b, m.c, m.d, m.e, m.f);
          var transformedPath = new Path2D();
          transformedPath.addPath(path, i);
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
    }
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