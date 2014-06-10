/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

interface CanvasRenderingContext2D {
  stackDepth: number;
  fill(path: Path2D, fillRule?: string): void;
  clip(path: Path2D, fillRule?: string): void;
  stroke(path: Path2D): void;
}

declare class Path2D {
  constructor();
  constructor(path:Path2D);
  constructor(paths: Path2D[], fillRule?: string);
  constructor(d: any);

  addPath(path: Path2D, transform?: SVGMatrix): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  rect(x: number, y: number, w: number, h: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  closePath(): void;
}

/// <reference path='references.ts'/>
module Shumway.GFX {
  export enum TraceLevel {
    None,
    Brief,
    Verbose,
  }

  var counter = Shumway.Metrics.Counter.instance;
  export var frameCounter = new Shumway.Metrics.Counter(true);

  export var traceLevel = TraceLevel.Verbose;
  export var release = true;
  export var writer: IndentingWriter = null;

  export function frameCount(name) {
    counter.count(name);
    frameCounter.count(name);
  }

  export var timelineBuffer = new Shumway.Tools.Profiler.TimelineBuffer("GFX");

  export function enterTimeline(name: string) {
    timelineBuffer && timelineBuffer.enter(name);
  }

  export function leaveTimeline(name: string) {
    timelineBuffer && timelineBuffer.leave(name);
  }

  /**
   * Polyfill for missing |setTransform| on CanvasPatterns. Firefox implements this in a special build
   * that you can download from here:
   *
   * https://bugzilla.mozilla.org/show_bug.cgi?id=1019257
   *
   * Otherwise you'll have to fall back on this polyfill that depends on yet another canvas feature that
   * is not implemented across all browsers, namely |Path2D.addPath|. You can get this working in Chrome
   * if you enable experimental canvas features in |chrome://flags/|. In Firefox you'll have to wait for
   * https://bugzilla.mozilla.org/show_bug.cgi?id=985801 to land.
   *
   * You shuold at least be able to get a build of Firefox or Chrome where setTransform works. Eventually,
   * we'll have to polyfill Path2D, we can work around the addPath limitation at that point.
   */
  if (!CanvasPattern.prototype.setTransform) {
    /**
     * Save the transform matrix on the CanvasPattern.
     */
    CanvasPattern.prototype.setTransform = function (matrix: SVGMatrix) {
      this._transform = matrix;
    };
    var originalFill = CanvasRenderingContext2D.prototype.fill;
    /**
     * If the current fillStyle is a CanvasPattern that has a SVGMatrix transformed applied to it, we
     * first apply the pattern's transform to the current context and then draw the path with the
     * inverse fillStyle transform applied to it so that it is drawn in the expected original location.
     */
    CanvasRenderingContext2D.prototype.fill = <any>(function fill(path: Path2D, fillRule?: string): void {
      if (this.fillStyle instanceof CanvasPattern &&
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