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
    private _ops: string[];
    private _args: number[];

    /**
     * Takes a |Path2D| instance and a 2d context to replay the recorded drawing commands.
     */
    static _apply(path: Path, context: CanvasRenderingContext2D) {
      var ops = path._ops;
      var args = path._args;
      var i = 0;
      var j = 0;
      context.beginPath();
      while (i < ops.length) {
        switch (ops[i++]) {
          case 'closePath':
            context.closePath();
            break;
          case 'moveTo':
            context.moveTo(args[j++], args[j++]);
            break;
          case 'lineTo':
            context.lineTo(args[j++], args[j++]);
            break;
          case 'quadraticCurveTo':
            context.quadraticCurveTo(args[j++], args[j++], args[j++], args[j++]);
            break;
          case 'bezierCurveTo':
            context.bezierCurveTo(
              args[j++], args[j++], args[j++], args[j++], args[j++], args[j++]
            );
            break;
          case 'arcTo':
            context.arcTo(args[j++], args[j++], args[j++], args[j++], args[j++]);
            break;
          case 'rect':
            context.rect(args[j++], args[j++], args[j++], args[j++]);
            break;
          case 'arc':
            context.arc(
              args[j++], args[j++], args[j++], args[j++], args[j++], !!args[j++]
            );
            break;
          case 'save':
            context.save();
            break;
          case 'restore':
            context.restore();
            break;
          case 'transform':
            context.transform(
              args[j++], args[j++], args[j++], args[j++], args[j++], args[j++]
            );
            break;
        }
      }
    }

    constructor(arg: any) {
      this._ops = [];
      this._args = [];
      if (arg instanceof Path) {
        this.addPath(arg);
      }
    }

    /**
     * Copies all drawing commands stored in |path|.
     */
    addPath(path: Path, transformation?: SVGMatrix) {
      var ops = this._ops;
      var args = this._args;
      if (transformation) {
        ops.push('save');
        ops.push('transform');
        args.push(
          transformation.a,
          transformation.b,
          transformation.c,
          transformation.d,
          transformation.e,
          transformation.f
        );
      }
      ops.push.apply(ops, path._ops);
      args.push.apply(args, path._args);
      if (transformation) {
        ops.push('restore');
      }
    }
  }

  if (typeof Path2D === 'undefined') {
    /**
     * Here we define all the path methods available on the |Path2D| polyfill. They simply store
     * their function name and passed arguments.
     */
    [
      ['closePath'],
      ['moveTo', 2],
      ['lineTo', 2],
      ['quadraticCurveTo', 4],
      ['bezierCurveTo', 6],
      ['arcTo', 5],
      ['rect', 4],
      ['arc', 6]
    ].forEach(function (info: any[]) {
      var name = info[0];
      var numArgs = info[1];
      Path.prototype[name] = function (...args: number[]) {
        this._ops.push(name);
        for (var i = 0; i < numArgs; i++) {
          this._args.push(args[i]);
        }
      };
    });
    /**
     * We override all methods of |CanvasRenderingContext2D| that accept a |Path2D| object as one
     * of its arguments, so that we can apply all recorded drawing commands before calling the
     * original function.
     */
    [
      'fill',
      'stroke',
      'clip',
      'isPointInPath',
      'isPointInStroke'
    ].forEach(function (name: string) {
      var original = CanvasRenderingContext2D.prototype[name];
      CanvasRenderingContext2D.prototype[name] = function (...args: any[]) {
        if (args[0] instanceof Path) {
          Path._apply(args.shift(), this);
        }
        original.apply(this, args);
      };
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