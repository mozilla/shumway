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
  import clamp = NumberUtilities.clamp;

  export enum FlameChartHeaderType {
    OVERVIEW,
    CHART
  }

  enum DragTarget {
    NONE,
    WINDOW,
    HANDLE_LEFT,
    HANDLE_RIGHT,
    HANDLE_BOTH
  }

  interface DragInfo {
    windowStartInitial: number;
    windowEndInitial: number;
    target: DragTarget;
  }

  export class FlameChartHeader implements MouseControllerTarget {

    private _controller: Controller;

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    private _mouseController: MouseController;

    private _width: number;
    private _height: number;

    private _windowStart: number;
    private _windowEnd: number;
    private _rangeStart: number;
    private _rangeEnd: number;

    private _initialized: boolean;
    private _type: FlameChartHeaderType;
    private _dragInfo: DragInfo;

    private static DRAGHANDLE_WIDTH = 4;
    private static TICK_MAX_WIDTH = 75;
    private static MIN_WINDOW_LEN = 10;

    constructor(controller: Controller, type: FlameChartHeaderType) {
      this._controller = controller;
      this._type = type;
      this._initialized = false;
      this._canvas = document.createElement("canvas");
      this._context = this._canvas.getContext("2d");
      this._mouseController = new MouseController(this, this._canvas);
      var container = controller.container;
      container.appendChild(this._canvas);
      var rect = container.getBoundingClientRect();
      this.setSize(rect.width);
    }

    setSize(width: number, height: number = 20) {
      this._width = width;
      this._height = height;
      this._resetCanvas();
      this._draw();
    }

    initialize(rangeStart: number, rangeEnd: number) {
      this._initialized = true;
      this.setRange(rangeStart, rangeEnd, false);
      this.setWindow(rangeStart, rangeEnd, false);
      this._draw();
    }

    setWindow(start: number, end: number, draw: boolean = true) {
      this._windowStart = start;
      this._windowEnd = end;
      if (draw) {
        this._draw();
      }
    }

    setRange(start: number, end: number, draw: boolean = true) {
      this._rangeStart = start;
      this._rangeEnd = end;
      if (draw) {
        this._draw();
      }
    }

    destroy() {
      this._mouseController.destroy();
      this._mouseController = null;
      this._controller = null;
    }

    private _resetCanvas() {
      var ratio = window.devicePixelRatio;
      var canvas = this._canvas;
      canvas.width = this._width * ratio;
      canvas.height = this._height * ratio;
      canvas.style.width = this._width + "px";
      canvas.style.height = this._height + "px";
    }

    private _draw() {
      var context = this._context;
      var ratio = window.devicePixelRatio;
      var width = this._width;
      var height = this._height;

      context.save();
      context.scale(ratio, ratio);
      context.fillStyle = "#252c33";
      context.fillRect(0, 0, width, height);

      if (this._initialized) {
        if (this._type == FlameChartHeaderType.OVERVIEW) {
          var left = this._toPixels(this._windowStart);
          var right = this._toPixels(this._windowEnd);
          context.fillStyle = "#14171a";
          context.fillRect(left, 0, right - left, height);
          this._drawLabels(this._rangeStart, this._rangeEnd, this._width);
          this._drawDragHandle(left);
          this._drawDragHandle(right);
        } else {
          this._drawLabels(this._windowStart, this._windowEnd, this._width + FlameChartHeader.TICK_MAX_WIDTH);
        }
      }

      context.restore();
    }

    private _drawLabels(rangeStart: number, rangeEnd: number, maxWidth: number) {
      var context = this._context;
      var tickInterval = this._calculateTickInterval(rangeStart, rangeEnd);
      var tick = Math.ceil(rangeStart / tickInterval) * tickInterval;
      var showSeconds = (tickInterval >= 500);
      var divisor = showSeconds ? 1000 : 1;
      var precision = this._decimalPlaces(tickInterval / divisor);
      var unit = showSeconds ? "s" : "ms";
      var x = this._toPixels(tick);
      var y = this._height / 2;
      context.lineWidth = 1;
      context.strokeStyle = "rgba(95, 115, 135, 0.5)";
      context.fillStyle = "rgba(95, 115, 135, 1)";
      context.textAlign = "right";
      context.textBaseline = "middle";
      context.font = '11px sans-serif';
      while (x < maxWidth) {
        var tickStr = (tick / divisor).toFixed(precision) + " " + unit;
        context.fillText(tickStr, x - 7, y + 1);
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, this._height + 1);
        context.closePath();
        context.stroke();
        tick += tickInterval;
        x = this._toPixels(tick);
      }
    }

    private _calculateTickInterval(rangeStart: number, rangeEnd: number) {
      // http://stackoverflow.com/a/361687
      var tickCount = this._width / FlameChartHeader.TICK_MAX_WIDTH;
      var range = rangeEnd - rangeStart;
      var minimum = range / tickCount;
      var magnitude = Math.pow(10, Math.floor(Math.log(minimum) / Math.LN10));
      var residual = minimum / magnitude;
      if (residual > 5) {
        return 10 * magnitude;
      } else if (residual > 2) {
        return 5 * magnitude;
      } else if (residual > 1) {
        return 2 * magnitude;
      }
      return magnitude;
    }

    private _drawDragHandle(pos: number) {
      var context = this._context;
      context.lineWidth = 2;
      context.strokeStyle = "#14171a";
      context.fillStyle = "rgba(182, 186, 191, 0.7)";
      this._drawRoundedRect(context, pos - FlameChartHeader.DRAGHANDLE_WIDTH / 2, 1, FlameChartHeader.DRAGHANDLE_WIDTH, this._height - 2, 2, true);
    }

    private _drawRoundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number, stroke: boolean = true, fill: boolean = true) {
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height - radius);
      context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      context.lineTo(x + radius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - radius);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();
      if (stroke) {
        context.stroke();
      }
      if (fill) {
        context.fill();
      }
    }

    private _toPixelsRelative(time: number): number {
      var range = (this._type === FlameChartHeaderType.OVERVIEW)
                    ? this._rangeEnd - this._rangeStart
                    : this._windowEnd - this._windowStart;
      return time * this._width / range;
    }

    private _toPixels(time: number): number {
      var start = (this._type === FlameChartHeaderType.OVERVIEW) ? this._rangeStart : this._windowStart;
      return this._toPixelsRelative(time - start);
    }

    private _toTimeRelative(px: number): number {
      var range = (this._type === FlameChartHeaderType.OVERVIEW)
                    ? this._rangeEnd - this._rangeStart
                    : this._windowEnd - this._windowStart;
      return px * range / this._width;
    }

    private _toTime(px: number): number {
      var start = (this._type === FlameChartHeaderType.OVERVIEW) ? this._rangeStart : this._windowStart;
      return this._toTimeRelative(px) + start;
    }

    private _almostEq(a: number, b: number, precision: number = 10): boolean {
      var pow10 = Math.pow(10, precision);
      return Math.abs(a - b) < (1 / pow10);
    }

    private _windowEqRange(): boolean {
      return (this._almostEq(this._windowStart, this._rangeStart) && this._almostEq(this._windowEnd, this._rangeEnd));
    }

    private _decimalPlaces(value: number): number {
      return ((+value).toFixed(10)).replace(/^-?\d*\.?|0+$/g, '').length;
    }

    private _getDragTargetUnderCursor(x: number, y:number): DragTarget {
      if (y >= 0 && y < this._height) {
        if (this._type === FlameChartHeaderType.OVERVIEW) {
          var left = this._toPixels(this._windowStart);
          var right = this._toPixels(this._windowEnd);
          var radius = 2 + (FlameChartHeader.DRAGHANDLE_WIDTH) / 2;
          var leftHandle = (x >= left - radius && x <= left + radius);
          var rightHandle = (x >= right - radius && x <= right + radius);
          if (leftHandle && rightHandle) {
            return DragTarget.HANDLE_BOTH;
          } else if (leftHandle) {
            return DragTarget.HANDLE_LEFT;
          } else if (rightHandle) {
            return DragTarget.HANDLE_RIGHT;
          } else if (!this._windowEqRange()) {
            return DragTarget.WINDOW;
          }
        } else if (!this._windowEqRange()) {
          return DragTarget.WINDOW;
        }
      }
      return DragTarget.NONE;
    }

    onMouseDown(x: number, y: number) {
      var dragTarget = this._getDragTargetUnderCursor(x, y);
      if (dragTarget === DragTarget.WINDOW) {
        this._mouseController.updateCursor(MouseCursor.GRABBING);
      }
      this._dragInfo = <DragInfo>{
        windowStartInitial: this._windowStart,
        windowEndInitial: this._windowEnd,
        target: dragTarget
      };
    }

    onMouseMove(x: number, y: number) {
      var cursor = MouseCursor.DEFAULT;
      var dragTarget = this._getDragTargetUnderCursor(x, y);
      if (dragTarget !== DragTarget.NONE) {
        if (dragTarget !== DragTarget.WINDOW) {
          cursor = MouseCursor.EW_RESIZE;
        } else if (dragTarget === DragTarget.WINDOW && !this._windowEqRange()) {
          cursor = MouseCursor.GRAB;
        }
      }
      this._mouseController.updateCursor(cursor);
    }

    onMouseOver(x: number, y: number) {
      this.onMouseMove(x, y);
    }

    onMouseOut() {
      this._mouseController.updateCursor(MouseCursor.DEFAULT);
    }

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
      var maxDelta = Math.max((FlameChartHeader.MIN_WINDOW_LEN - windowLen) / windowLen, delta);
      var start = windowStart + (windowStart - time) * maxDelta;
      var end = windowEnd + (windowEnd - time) * maxDelta;
      this._controller.setWindow(start, end);
    }

    onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number) {
      var dragInfo = this._dragInfo;
      if (dragInfo.target === DragTarget.HANDLE_BOTH) {
        if (deltaX !== 0) {
          dragInfo.target = (deltaX < 0) ? DragTarget.HANDLE_LEFT : DragTarget.HANDLE_RIGHT;
        } else {
          return;
        }
      }
      var windowStart = this._windowStart;
      var windowEnd = this._windowEnd;
      var delta = this._toTimeRelative(deltaX);
      switch (dragInfo.target) {
        case DragTarget.WINDOW:
          var mult = (this._type === FlameChartHeaderType.OVERVIEW) ? 1 : -1;
          windowStart = dragInfo.windowStartInitial + mult * delta;
          windowEnd = dragInfo.windowEndInitial + mult * delta;
          break;
        case DragTarget.HANDLE_LEFT:
          windowStart = clamp(dragInfo.windowStartInitial + delta, this._rangeStart, windowEnd - 20);
          break;
        case DragTarget.HANDLE_RIGHT:
          windowEnd = clamp(dragInfo.windowEndInitial + delta, windowStart + 20, this._rangeEnd);
          break;
        default:
          return;
      }
      this._controller.setWindow(windowStart, windowEnd);
    }

    onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number) {
      this._dragInfo = null;
      this.onMouseMove(currentX, currentY);
    }

    onClick(x: number, y: number) {
      if (this._dragInfo.target === DragTarget.WINDOW) {
        this._mouseController.updateCursor(MouseCursor.GRAB);
      }
    }

    onHoverStart(x: number, y: number) {}
    onHoverEnd() {}

  }

}

