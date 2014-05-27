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

  interface Selection {
    left: number;
    right: number;
  }

  export class FlameChartOverview implements MouseControllerTarget {

    private _controller: Controller;

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    private _overviewCanvasDirty: boolean;
    private _overviewCanvas: HTMLCanvasElement;
    private _overviewContext: CanvasRenderingContext2D;

    private _mouseController: MouseController;

    private _width: number;
    private _height: number;

    private _windowStart: number;
    private _windowEnd: number;
    private _rangeStart: number;
    private _rangeEnd: number;

    private _initialized: boolean;
    private _selection: Selection;
    private _dragInfo: DragInfo;

    private static DRAGHANDLE_WIDTH = 4;

    constructor(controller: Controller) {
      this._overviewCanvasDirty = true;
      this._controller = controller;
      this._initialized = false;
      this._canvas = document.createElement("canvas");
      this._context = this._canvas.getContext("2d");
      this._overviewCanvas = document.createElement("canvas");
      this._overviewContext = this._overviewCanvas.getContext("2d");
      this._mouseController = new Profiler.MouseController(this, this._canvas);
      var container = controller.container;
      container.appendChild(this._canvas);
      var rect = container.getBoundingClientRect();
      this.setSize(rect.width);
    }

    setSize(width: number, height: number = 64) {
      this._width = width;
      this._height = height;
      this._resetCanvas();
      this._draw();
    }

    initialize(rangeStart: number, rangeEnd: number) {
      this._initialized = true;
      this._rangeStart = rangeStart;
      this._rangeEnd = rangeEnd;
      this._draw();
    }

    setWindow(windowStart: number, windowEnd: number) {
      this._windowStart = windowStart;
      this._windowEnd = windowEnd;
      this._draw();
    }

    destroy() {
      this._mouseController.destroy();
      this._mouseController = null;
      this._controller = null;
    }

    private _resetCanvas() {
      var ratio = window.devicePixelRatio;
      var canvas = this._canvas;
      var canvasOverview = this._overviewCanvas;
      canvas.width = canvasOverview.width = this._width * ratio;
      canvas.height = canvasOverview.height = this._height * ratio;
      canvas.style.width = this._width + "px";
      canvas.style.height = this._height + "px";
      this._overviewCanvasDirty = true;
    }

    private _draw() {
      var context = this._context;
      var ratio = window.devicePixelRatio;
      var width = this._width;
      var height = this._height;

      context.save();
      context.scale(ratio, ratio);
      context.fillStyle = "rgba(17, 19, 21, 1)";
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

      context.save();
      context.scale(ratio, ratio);
      if (this._selection) {
        var left = this._selection.left;
        var right = this._selection.right;
        context.fillStyle = "rgba(245, 247, 250, 0.15)";
        context.fillRect(left, 1, right - left, height - 1);
      } else {
        var left = this._toPixels(this._windowStart);
        var right = this._toPixels(this._windowEnd);
        context.fillStyle = "rgba(17, 19, 21, 0.4)";
        context.fillRect(0, 1, left, height - 1);
        context.fillRect(right, 1, this._width, height - 1);
      }
      context.beginPath();
      context.moveTo(left, 1);
      context.lineTo(left, height);
      context.moveTo(right, 1);
      context.lineTo(right, height);
      context.lineWidth = 0.5;
      context.strokeStyle = "rgba(245, 247, 250, 1)";
      context.stroke();
      context.restore();
    }

    private _drawChart() {
      var ratio = window.devicePixelRatio;
      var width = this._width;
      var height = this._height;
      var profile = this._controller.profile;
      var samplesPerPixel = 4;
      var samplesCount = width * samplesPerPixel;
      var sampleTimeInterval = profile.totalTime / samplesCount;
      var contextOverview = this._overviewContext;

      contextOverview.save();
      contextOverview.translate(0, ratio * height);
      contextOverview.scale(ratio / samplesPerPixel, -ratio * height / (profile.maxDepth - 1));
      contextOverview.clearRect(0, 0, samplesCount, profile.maxDepth - 1);

      var bufferCount = profile.bufferCount;
      for (var i = 0; i < bufferCount; i++) {
        var buffer = profile.getBufferAt(i);
        var deepestFrame = null;
        var depth = 0;
        contextOverview.beginPath();
        contextOverview.moveTo(0, 0);
        for (var x = 0; x < samplesCount; x++) {
          var time = profile.startTime + x * sampleTimeInterval;
          if (!deepestFrame) {
            deepestFrame = buffer.snapshot.query(time);
          } else {
            deepestFrame = deepestFrame.queryNext(time);
          }
          depth = deepestFrame ? deepestFrame.getDepth() - 1 : 0;
          contextOverview.lineTo(x, depth);
        }
        contextOverview.lineTo(x, 0);
        contextOverview.fillStyle = "#46afe3";
        contextOverview.fill();
      }

      contextOverview.restore();
    }

    private _toPixels(time: number): number {
      return time * this._width / (this._rangeEnd - this._rangeStart);
    }

    private _toTime(px: number): number {
      return px * (this._rangeEnd - this._rangeStart) / this._width;
    }

    private _getDragTargetUnderCursor(x: number, y:number): DragTarget {
      if (y >= 0 && y < this._height) {
        var left = this._toPixels(this._windowStart);
        var right = this._toPixels(this._windowEnd);
        var radius = 2 + (FlameChartOverview.DRAGHANDLE_WIDTH) / 2;
        var leftHandle = (x >= left - radius && x <= left + radius);
        var rightHandle = (x >= right - radius && x <= right + radius);
        if (leftHandle && rightHandle) {
          return DragTarget.HANDLE_BOTH;
        } else if (leftHandle) {
          return DragTarget.HANDLE_LEFT;
        } else if (rightHandle) {
          return DragTarget.HANDLE_RIGHT;
        } else if (x > left + radius && x < right - radius) {
          return DragTarget.WINDOW;
        }
      }
      return DragTarget.NONE;
    }

    onMouseDown(x: number, y: number) {
      var dragTarget = this._getDragTargetUnderCursor(x, y);
      if (dragTarget === DragTarget.NONE) {
        this._selection = { left: x, right: x };
        this._draw();
      } else {
        if (dragTarget === DragTarget.WINDOW) {
          this._mouseController.updateCursor(MouseCursor.GRABBING);
        }
        this._dragInfo = <DragInfo>{
          windowStartInitial: this._windowStart,
          windowEndInitial: this._windowEnd,
          target: dragTarget
        };
      }
    }

    onMouseMove(x: number, y: number) {
      var dragTarget = this._getDragTargetUnderCursor(x, y);
      var cursor = (dragTarget === DragTarget.NONE || this._selection)
                    ? MouseCursor.DEFAULT
                    : (dragTarget === DragTarget.WINDOW)
                      ? MouseCursor.GRAB
                      : MouseCursor.EW_RESIZE;
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
        this._draw();
      } else {
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
        var windowLength = windowEnd - windowStart;
        var rangeStart = this._rangeStart;
        var rangeEnd = this._rangeEnd;
        var rangeLength = rangeEnd - rangeStart;
        var delta = this._toTime(deltaX);
        switch (dragInfo.target) {
          case DragTarget.WINDOW:
            windowStart = dragInfo.windowStartInitial + delta;
            windowEnd = dragInfo.windowEndInitial + delta;
            if (windowStart < rangeStart) {
              windowStart = rangeStart;
              windowEnd = windowLength;
            } else if (windowEnd > rangeEnd) {
              windowStart = rangeEnd - windowLength;
              windowEnd = rangeEnd;
            }
            break;
          case DragTarget.HANDLE_LEFT:
            windowStart = clamp(dragInfo.windowStartInitial + delta, rangeStart, windowEnd - 20);
            break;
          case DragTarget.HANDLE_RIGHT:
            windowEnd = clamp(dragInfo.windowEndInitial + delta, windowStart + 20, rangeEnd);
            break;
          default:
            return;
        }
        this._controller.onWindowChange(windowStart / rangeLength, windowEnd / rangeLength);
      }
    }

    onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number) {
      if (this._selection) {
        var start = startX / this._width;
        var end = clamp(currentX / this._width, 0, 1);
        this._selection = null;
        this._controller.onWindowChange(start, end);
      }
      this._dragInfo = null;
      this.onMouseMove(currentX, currentY);
    }

    onClick(x: number, y: number) {
      if (this._dragInfo && this._dragInfo.target === DragTarget.WINDOW) {
        this._mouseController.updateCursor(MouseCursor.GRAB);
      }
      this._dragInfo = null;
      this._selection = null;
      this._draw();
    }

    onHoverStart(x: number, y: number) {}
    onHoverEnd() {}
    onMouseWheel(x: number, y: number, delt: number) {}

  }
}


/*
    private _onClick(event: MouseEvent) {
    if (this._ignoreClick) {
    this._ignoreClick = false;
    return;
    }
    if (event.clientY < this._overviewHeight) {
    var window = this._windowRight - this._windowLeft;
    var windowLeft = this._range.startTime + event.clientX * this._pixelsToOverviewTime - window / 2;
    var windowRight = this._range.startTime + event.clientX * this._pixelsToOverviewTime + window / 2;
    this._updateWindow(windowLeft, windowRight);
    this._updateCursor(event);
    }
    }

    private _onMouseUp(event: MouseEvent) {
    if (this._drag) {
    this._drag = null;
    this._ignoreClick = true;
    }
    this._updateCursor(event);
    }

    private _onMouseDown(event: MouseEvent) {
    if (event.clientY < this._overviewHeight) {
    if (this._getCursorPosition(event) == 0) {
    this._drag = {
    overview: true,
    clientX: event.clientX,
    windowLeft: this._windowLeft,
    windowRight: this._windowRight
    };
    }
    } else {
    this._drag = {
    overview: false,
    clientX: event.clientX,
    windowLeft: this._windowLeft,
    windowRight: this._windowRight
    };
    }
    this._updateCursor(event);
    }

    private _onMouseMove(event: MouseEvent) {
    if (this._drag) {
    var offset: number;
    var mult: number;
    if (this._drag.overview) {
    offset = event.clientX - this._drag.clientX;
    mult = this._pixelsToOverviewTime;
    } else {
    offset = -event.clientX + this._drag.clientX;
    mult = this._pixelsToTime;
    }
    var windowLeft = this._drag.windowLeft + offset * mult;
    var windowRight = this._drag.windowRight + offset * mult;
    this._updateWindow(windowLeft, windowRight);
    }
    this._updateCursor(event);
    }

    private _onMouseWheel(event: MouseEvent) {
    event.stopPropagation();
    if (this._drag === null) {
    var range = this._range;
    var delta = clamp(event.detail ? event.detail / 8 : -event.wheelDeltaY / 120, -1, 1);
    var zoom = Math.pow(1.2, delta) - 1;
    var cursorTime = (event.clientY > this._overviewHeight || this._getCursorPosition(event) !== 0)
    ? this._windowLeft + event.clientX * this._pixelsToTime
    : range.startTime + event.clientX * this._pixelsToOverviewTime;
    var windowLeft = this._windowLeft + (this._windowLeft - cursorTime) * zoom;
    var windowRight = this._windowRight + (this._windowRight - cursorTime) * zoom;
    this._updateWindow(windowLeft, windowRight);
    this._updateCursor(event);
    }
    }

    private _clampWindow() {
    var range = this._range;
    var windowSize = this._windowRight - this._windowLeft;
    if (windowSize < this._minTime) {
    windowSize = this._minTime;
    var center = this._windowLeft + (this._windowRight - this._windowLeft) / 2;
    this._windowLeft = center - this._minTime / 2;
    this._windowRight = center + this._minTime / 2;
    }
    if (this._windowLeft < range.startTime) {
    this._windowLeft = range.startTime;
    this._windowRight = clamp(this._windowLeft + windowSize, range.startTime, range.endTime);
    } else if (this._windowRight > range.endTime) {
    this._windowRight = range.endTime;
    this._windowLeft = clamp(this._windowRight - windowSize, range.startTime, range.endTime);
    }
    }

    private _updateUnits() {
    this._timeToPixels = this._width / (this._windowRight - this._windowLeft);
    this._pixelsToTime = (this._windowRight - this._windowLeft) / this._width;
    this._pixelsToOverviewTime = (this._profile.endTime - this._profile.startTime) / this._width;
    }

    private _updateWindow(left: number, right: number) {
    if (this._windowLeft !== left || this._windowRight !== right) {
    this._windowLeft = left;
    this._windowRight = right;
    this._clampWindow();
    this._updateUnits();
    this._draw();
    }
    }
*/
