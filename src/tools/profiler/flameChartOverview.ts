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

  export const enum FlameChartOverviewMode {
    OVERLAY,
    STACK,
    UNION
  }

  interface Selection {
    left: number;
    right: number;
  }

  export class FlameChartOverview extends FlameChartBase implements MouseControllerTarget {

    private _overviewCanvasDirty: boolean;
    private _overviewCanvas: HTMLCanvasElement;
    private _overviewContext: CanvasRenderingContext2D;

    private _selection: Selection;
    private _mode: FlameChartOverviewMode;

    constructor(controller: Controller, mode: FlameChartOverviewMode = FlameChartOverviewMode.STACK) {
      this._mode = mode;
      this._overviewCanvasDirty = true;
      this._overviewCanvas = document.createElement("canvas");
      this._overviewContext = this._overviewCanvas.getContext("2d");
      super(controller);
    }

    setSize(width: number, height?: number) {
      super.setSize(width, height || 64);
    }

    set mode(value: FlameChartOverviewMode) {
      this._mode = value;
      this.draw();
    }

    _resetCanvas() {
      super._resetCanvas();
      this._overviewCanvas.width = this._canvas.width;
      this._overviewCanvas.height = this._canvas.height;
      this._overviewCanvasDirty = true;
    }

    draw() {
      var context = this._context;
      var ratio = window.devicePixelRatio;
      var width = this._width;
      var height = this._height;

      context.save();
      context.scale(ratio, ratio);
      context.fillStyle = this._controller.theme.bodyBackground(1); //"rgba(17, 19, 21, 1)";
      context.fillRect(0, 0, width, height);
      context.restore();

      if (this._initialized) {
        if (this._overviewCanvasDirty) {
          this._drawChart();
          this._overviewCanvasDirty = false;
        }
        context.drawImage(this._overviewCanvas, 0, 0);
        this._drawSelection();
      }
    }

    private _drawSelection() {
      var context = this._context;
      var height = this._height;
      var ratio = window.devicePixelRatio;
      var left = this._selection ? this._selection.left : this._toPixels(this._windowStart);
      var right = this._selection ? this._selection.right : this._toPixels(this._windowEnd);
      var theme = this._controller.theme;

      context.save();
      context.scale(ratio, ratio);

      // Draw fills
      if (this._selection) {
        context.fillStyle = theme.selectionText(0.15); //"rgba(245, 247, 250, 0.15)";
        context.fillRect(left, 1, right - left, height - 1);
        context.fillStyle = "rgba(133, 0, 0, 1)";
        context.fillRect(left + 0.5, 0, right - left - 1, 4);
        context.fillRect(left + 0.5, height - 4, right - left - 1, 4);
      } else {
        context.fillStyle = theme.bodyBackground(0.4); //"rgba(17, 19, 21, 0.4)";
        context.fillRect(0, 1, left, height - 1);
        context.fillRect(right, 1, this._width, height - 1);
      }

      // Draw border lines
      context.beginPath();
      context.moveTo(left, 0);
      context.lineTo(left, height);
      context.moveTo(right, 0);
      context.lineTo(right, height);
      context.lineWidth = 0.5;
      context.strokeStyle = theme.foregroundTextGrey(1); //"rgba(245, 247, 250, 1)";
      context.stroke();

      // Draw info labels
      var start = this._selection ? this._toTime(this._selection.left) : this._windowStart;
      var end = this._selection ? this._toTime(this._selection.right) : this._windowEnd;
      var time = Math.abs(end - start);
      context.fillStyle = theme.selectionText(0.5); //"rgba(255, 255, 255, 0.5)";
      context.font = '8px sans-serif';
      context.textBaseline = "alphabetic";
      context.textAlign = "end";
      // Selection Range in MS
      context.fillText(time.toFixed(2), Math.min(left, right) - 4, 10);
      // Selection Range in Frames
      context.fillText((time / 60).toFixed(2), Math.min(left, right) - 4, 20);
      context.restore();
    }

    private _drawChart() {
      var ratio = window.devicePixelRatio;
      var width = this._width;
      var height = this._height;
      var profile = this._controller.activeProfile;
      var samplesPerPixel = 4;
      var samplesCount = width * samplesPerPixel;
      var sampleTimeInterval = profile.totalTime / samplesCount;
      var contextOverview = this._overviewContext;
      var overviewChartColor: string = this._controller.theme.blueHighlight(1);

      contextOverview.save();
      contextOverview.translate(0, ratio * height);
      var yScale = -ratio * height / (profile.maxDepth - 1);
      contextOverview.scale(ratio / samplesPerPixel, yScale);
      contextOverview.clearRect(0, 0, samplesCount, profile.maxDepth - 1);
      if (this._mode == FlameChartOverviewMode.STACK) {
        contextOverview.scale(1, 1 / profile.snapshotCount);
      }
      for (var i = 0, n = profile.snapshotCount; i < n; i++) {
        var snapshot = profile.getSnapshotAt(i);
        if (snapshot) {
          var deepestFrame = null;
          var depth = 0;
          contextOverview.beginPath();
          contextOverview.moveTo(0, 0);
          for (var x = 0; x < samplesCount; x++) {
            var time = profile.startTime + x * sampleTimeInterval;
            if (!deepestFrame) {
              deepestFrame = snapshot.query(time);
            } else {
              deepestFrame = deepestFrame.queryNext(time);
            }
            depth = deepestFrame ? deepestFrame.getDepth() - 1 : 0;
            contextOverview.lineTo(x, depth);
          }
          contextOverview.lineTo(x, 0);
          contextOverview.fillStyle = overviewChartColor;
          contextOverview.fill();
          if (this._mode == FlameChartOverviewMode.STACK) {
            contextOverview.translate(0, -height * ratio / yScale);
          }
        }
      }

      contextOverview.restore();
    }

    _toPixelsRelative(time: number): number {
      return time * this._width / (this._rangeEnd - this._rangeStart);
    }

    _toPixels(time: number): number {
      return this._toPixelsRelative(time - this._rangeStart);
    }

    _toTimeRelative(px: number): number {
      return px * (this._rangeEnd - this._rangeStart) / this._width;
    }

    _toTime(px: number): number {
      return this._toTimeRelative(px) + this._rangeStart;
    }

    private _getDragTargetUnderCursor(x: number, y:number): FlameChartDragTarget {
      if (y >= 0 && y < this._height) {
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
        } else if (!this._windowEqRange() && x > left + radius && x < right - radius) {
          return FlameChartDragTarget.WINDOW;
        }
      }
      return FlameChartDragTarget.NONE;
    }

    onMouseDown(x: number, y: number) {
      var dragTarget = this._getDragTargetUnderCursor(x, y);
      if (dragTarget === FlameChartDragTarget.NONE) {
        this._selection = { left: x, right: x };
        this.draw();
      } else {
        if (dragTarget === FlameChartDragTarget.WINDOW) {
          this._mouseController.updateCursor(MouseCursor.GRABBING);
        }
        this._dragInfo = <FlameChartDragInfo>{
          windowStartInitial: this._windowStart,
          windowEndInitial: this._windowEnd,
          target: dragTarget
        };
      }
    }

    onMouseMove(x: number, y: number) {
      var cursor = MouseCursor.DEFAULT;
      var dragTarget = this._getDragTargetUnderCursor(x, y);
      if (dragTarget !== FlameChartDragTarget.NONE && !this._selection) {
        cursor = (dragTarget === FlameChartDragTarget.WINDOW) ? MouseCursor.GRAB : MouseCursor.EW_RESIZE;
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
      if (this._selection) {
        this._selection = { left: startX, right: clamp(currentX, 0, this._width - 1) };
        this.draw();
      } else {
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
            windowStart = dragInfo.windowStartInitial + delta;
            windowEnd = dragInfo.windowEndInitial + delta;
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
    }

    onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number) {
      if (this._selection) {
        this._selection = null;
        this._controller.setWindow(this._toTime(startX), this._toTime(currentX));
      }
      this._dragInfo = null;
      this.onMouseMove(currentX, currentY);
    }

    onClick(x: number, y: number) {
      this._dragInfo = null;
      this._selection = null;
      if (!this._windowEqRange()) {
        var dragTarget = this._getDragTargetUnderCursor(x, y);
        if (dragTarget === FlameChartDragTarget.NONE) {
          this._controller.moveWindowTo(this._toTime(x));
        }
        this.onMouseMove(x, y);
      }
      this.draw();
    }

    onHoverStart(x: number, y: number) {}
    onHoverEnd() {}

  }
}
