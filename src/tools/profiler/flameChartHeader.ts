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

  export const enum FlameChartHeaderType {
    OVERVIEW,
    CHART
  }

  export class FlameChartHeader extends FlameChartBase implements MouseControllerTarget {

    private _type: FlameChartHeaderType;

    private static TICK_MAX_WIDTH = 75;

    constructor(controller: Controller, type: FlameChartHeaderType) {
      this._type = type;
      super(controller);
    }

    draw() {
      var context = this._context;
      var ratio = window.devicePixelRatio;
      var width = this._width;
      var height = this._height;

      context.save();
      context.scale(ratio, ratio);
      context.fillStyle = this._controller.theme.tabToolbar(1); //"#252c33";
      context.fillRect(0, 0, width, height);

      if (this._initialized) {
        if (this._type == FlameChartHeaderType.OVERVIEW) {
          var left = this._toPixels(this._windowStart);
          var right = this._toPixels(this._windowEnd);
          context.fillStyle = this._controller.theme.bodyBackground(1); //"#14171a";
          context.fillRect(left, 0, right - left, height);
          this._drawLabels(this._rangeStart, this._rangeEnd);
          this._drawDragHandle(left);
          this._drawDragHandle(right);
        } else {
          this._drawLabels(this._windowStart, this._windowEnd);
        }
      }

      context.restore();
    }

    private _drawLabels(rangeStart: number, rangeEnd: number) {
      var context = this._context;
      var tickInterval = this._calculateTickInterval(rangeStart, rangeEnd);
      var tick = Math.ceil(rangeStart / tickInterval) * tickInterval;
      var showSeconds = (tickInterval >= 500);
      var divisor = showSeconds ? 1000 : 1;
      var precision = this._decimalPlaces(tickInterval / divisor);
      var unit = showSeconds ? "s" : "ms";
      var x = this._toPixels(tick);
      var y = this._height / 2;
      var theme = this._controller.theme;
      context.lineWidth = 1;
      context.strokeStyle = theme.contentTextDarkGrey(0.5); //"rgba(95, 115, 135, 0.5)";
      context.fillStyle = theme.contentTextDarkGrey(1); //"rgba(95, 115, 135, 1)";
      context.textAlign = "right";
      context.textBaseline = "middle";
      context.font = '11px sans-serif';
      var maxWidth = this._width + FlameChartHeader.TICK_MAX_WIDTH;
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
      context.strokeStyle = this._controller.theme.bodyBackground(1); //"#14171a";
      context.fillStyle = this._controller.theme.foregroundTextGrey(0.7); //"rgba(182, 186, 191, 0.7)";
      this._drawRoundedRect(context, pos - FlameChartBase.DRAGHANDLE_WIDTH / 2, 1, FlameChartBase.DRAGHANDLE_WIDTH, this._height - 2, 2, true);
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

    _toPixelsRelative(time: number): number {
      var range = (this._type === FlameChartHeaderType.OVERVIEW)
                    ? this._rangeEnd - this._rangeStart
                    : this._windowEnd - this._windowStart;
      return time * this._width / range;
    }

    _toPixels(time: number): number {
      var start = (this._type === FlameChartHeaderType.OVERVIEW) ? this._rangeStart : this._windowStart;
      return this._toPixelsRelative(time - start);
    }

    _toTimeRelative(px: number): number {
      var range = (this._type === FlameChartHeaderType.OVERVIEW)
                    ? this._rangeEnd - this._rangeStart
                    : this._windowEnd - this._windowStart;
      return px * range / this._width;
    }

    _toTime(px: number): number {
      var start = (this._type === FlameChartHeaderType.OVERVIEW) ? this._rangeStart : this._windowStart;
      return this._toTimeRelative(px) + start;
    }

    private _getDragTargetUnderCursor(x: number, y:number): FlameChartDragTarget {
      if (y >= 0 && y < this._height) {
        if (this._type === FlameChartHeaderType.OVERVIEW) {
          var left = this._toPixels(this._windowStart);
          var right = this._toPixels(this._windowEnd);
          var radius = 2 + (FlameChartBase.DRAGHANDLE_WIDTH) / 2;
          var leftHandle = (x >= left - radius && x <= left + radius);
          var rightHandle = (x >= right - radius && x <= right + radius);
          if (leftHandle && rightHandle) {
            return FlameChartDragTarget.HANDLE_BOTH;
          } else if (leftHandle) {
            return FlameChartDragTarget.HANDLE_LEFT;
          } else if (rightHandle) {
            return FlameChartDragTarget.HANDLE_RIGHT;
          } else if (!this._windowEqRange()) {
            return FlameChartDragTarget.WINDOW;
          }
        } else if (!this._windowEqRange()) {
          return FlameChartDragTarget.WINDOW;
        }
      }
      return FlameChartDragTarget.NONE;
    }

    onMouseDown(x: number, y: number) {
      var dragTarget = this._getDragTargetUnderCursor(x, y);
      if (dragTarget === FlameChartDragTarget.WINDOW) {
        this._mouseController.updateCursor(MouseCursor.GRABBING);
      }
      this._dragInfo = <FlameChartDragInfo>{
        windowStartInitial: this._windowStart,
        windowEndInitial: this._windowEnd,
        target: dragTarget
      };
    }

    onMouseMove(x: number, y: number) {
      var cursor = MouseCursor.DEFAULT;
      var dragTarget = this._getDragTargetUnderCursor(x, y);
      if (dragTarget !== FlameChartDragTarget.NONE) {
        if (dragTarget !== FlameChartDragTarget.WINDOW) {
          cursor = MouseCursor.EW_RESIZE;
        } else if (dragTarget === FlameChartDragTarget.WINDOW && !this._windowEqRange()) {
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

    onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number) {
      var dragInfo = this._dragInfo;
      if (dragInfo.target === FlameChartDragTarget.HANDLE_BOTH) {
        if (deltaX !== 0) {
          dragInfo.target = (deltaX < 0) ? FlameChartDragTarget.HANDLE_LEFT : FlameChartDragTarget.HANDLE_RIGHT;
        } else {
          return;
        }
      }
      var windowStart = this._windowStart;
      var windowEnd = this._windowEnd;
      var delta = this._toTimeRelative(deltaX);
      switch (dragInfo.target) {
        case FlameChartDragTarget.WINDOW:
          var mult = (this._type === FlameChartHeaderType.OVERVIEW) ? 1 : -1;
          windowStart = dragInfo.windowStartInitial + mult * delta;
          windowEnd = dragInfo.windowEndInitial + mult * delta;
          break;
        case FlameChartDragTarget.HANDLE_LEFT:
          windowStart = clamp(dragInfo.windowStartInitial + delta, this._rangeStart, windowEnd - FlameChartBase.MIN_WINDOW_LEN);
          break;
        case FlameChartDragTarget.HANDLE_RIGHT:
          windowEnd = clamp(dragInfo.windowEndInitial + delta, windowStart + FlameChartBase.MIN_WINDOW_LEN, this._rangeEnd);
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
      if (this._dragInfo.target === FlameChartDragTarget.WINDOW) {
        this._mouseController.updateCursor(MouseCursor.GRAB);
      }
    }

    onHoverStart(x: number, y: number) {}
    onHoverEnd() {}

  }

}

