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
module Shumway.Tools.Profiler {

  export const enum FlameChartDragTarget {
    NONE,
    WINDOW,
    HANDLE_LEFT,
    HANDLE_RIGHT,
    HANDLE_BOTH
  }

  export interface FlameChartDragInfo {
    windowStartInitial: number;
    windowEndInitial: number;
    target: FlameChartDragTarget;
  }

  export class FlameChartBase implements MouseControllerTarget {

    _controller: Controller;
    _mouseController: MouseController;

    _canvas: HTMLCanvasElement;
    _context: CanvasRenderingContext2D;

    _width: number;
    _height: number;

    _windowStart: number;
    _windowEnd: number;
    _rangeStart: number;
    _rangeEnd: number;

    _initialized: boolean;

    _dragInfo: FlameChartDragInfo;

    static DRAGHANDLE_WIDTH = 4;
    static MIN_WINDOW_LEN = 0.1;

    constructor(controller: Controller) {
      this._controller = controller;
      this._initialized = false;
      this._canvas = document.createElement("canvas");
      this._context = this._canvas.getContext("2d");
      this._mouseController = new MouseController(this, this._canvas);
      var container = controller.container;
      container.appendChild(this._canvas);
      var rect = container.getBoundingClientRect();
      this.setSize(rect.width);
    }

    get canvas(): HTMLCanvasElement {
      return this._canvas;
    }

    public setSize(width: number, height: number = 20) {
      this._width = width;
      this._height = height;
      this._resetCanvas();
      this.draw();
    }

    public initialize(rangeStart: number, rangeEnd: number) {
      this._initialized = true;
      this.setRange(rangeStart, rangeEnd, false);
      this.setWindow(rangeStart, rangeEnd, false);
      this.draw();
    }

    public setWindow(start: number, end: number, draw: boolean = true) {
      this._windowStart = start;
      this._windowEnd = end;
      !draw || this.draw();
    }

    public setRange(start: number, end: number, draw: boolean = true) {
      this._rangeStart = start;
      this._rangeEnd = end;
      !draw || this.draw();
    }

    public destroy() {
      this._mouseController.destroy();
      this._mouseController = null;
      this._controller.container.removeChild(this._canvas);
      this._controller = null;
    }

    _resetCanvas() {
      var ratio = window.devicePixelRatio;
      var canvas = this._canvas;
      canvas.width = this._width * ratio;
      canvas.height = this._height * ratio;
      canvas.style.width = this._width + "px";
      canvas.style.height = this._height + "px";
    }

    draw() {}

    _almostEq(a: number, b: number, precision: number = 10): boolean {
      var pow10 = Math.pow(10, precision);
      return Math.abs(a - b) < (1 / pow10);
    }

    _windowEqRange(): boolean {
      return (this._almostEq(this._windowStart, this._rangeStart) && this._almostEq(this._windowEnd, this._rangeEnd));
    }

    _decimalPlaces(value: number): number {
      return ((+value).toFixed(10)).replace(/^-?\d*\.?|0+$/g, '').length;
    }

    _toPixelsRelative(time: number): number { return 0; }
    _toPixels(time: number): number { return 0; }
    _toTimeRelative(px: number): number { return 0; }
    _toTime(px: number): number { return 0; }

    onMouseWheel(x: number, y: number, delta: number) {
      var time = this._toTime(x);
      var windowStart = this._windowStart;
      var windowEnd = this._windowEnd;
      var windowLen = windowEnd - windowStart;
      /*
       * Find maximum allowed delta
       * (windowEnd + (windowEnd - time) * delta) - (windowStart + (windowStart - time) * delta) = LEN
       * (windowEnd - windowStart) + ((windowEnd - time) * delta) - ((windowStart - time) * delta) = LEN
       * (windowEnd - windowStart) + ((windowEnd - time) - (windowStart - time)) * delta = LEN
       * (windowEnd - windowStart) + (windowEnd - windowStart) * delta = LEN
       * (windowEnd - windowStart) * delta = LEN - (windowEnd - windowStart)
       * delta = (LEN - (windowEnd - windowStart)) / (windowEnd - windowStart)
       */
      var maxDelta = Math.max((FlameChartBase.MIN_WINDOW_LEN - windowLen) / windowLen, delta);
      var start = windowStart + (windowStart - time) * maxDelta;
      var end = windowEnd + (windowEnd - time) * maxDelta;
      this._controller.setWindow(start, end);
      this.onHoverEnd();
    }

    onMouseDown(x:number, y:number):void {}
    onMouseMove(x:number, y:number):void {}
    onMouseOver(x:number, y:number):void {}
    onMouseOut():void {}
    onDrag(startX:number, startY:number, currentX:number, currentY:number, deltaX:number, deltaY:number):void {}
    onDragEnd(startX:number, startY:number, currentX:number, currentY:number, deltaX:number, deltaY:number):void {}
    onClick(x:number, y:number):void {}
    onHoverStart(x:number, y:number):void {}
    onHoverEnd():void {}

  }

}
