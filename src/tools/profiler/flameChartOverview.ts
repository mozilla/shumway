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
      this._draw();
    }

    setWindow(windowStart: number, windowEnd: number) {
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
      context.fillStyle = "#14171a";
      context.fillRect(0, 0, width, height);
      context.restore();

      if (this._initialized) {
        if (this._overviewCanvasDirty) {
          this._drawChart();
          this._overviewCanvasDirty = false;
        }
        context.drawImage(this._overviewCanvas, 0, 0);
      }

      if (this._selection) {
        this._drawSelection();
      }
    }

    private _drawSelection() {
      var context = this._context;
      var height = this._height;
      var ratio = window.devicePixelRatio;
      var left = this._selection.left;
      var right = this._selection.right;

      if (left > right) {
        var temp = left;
        left = right;
        right = temp;
      }

      context.save();
      context.scale(ratio, ratio);
      context.fillStyle = "rgba(133, 0, 0, 1)";
      context.fillRect(left + 0.5, 0, right - left - 1, 4);
      context.fillRect(left + 0.5, height - 4, right - left - 1, 4);

      context.beginPath();
      context.moveTo(left, 0);
      context.lineTo(left, height);
      context.moveTo(right, 0);
      context.lineTo(right, height);
      context.lineWidth = 0.5;
      context.strokeStyle = "rgba(245, 247, 250, 1)";
      context.stroke();

      context.fillStyle = "rgba(255, 255, 255, 0.5)";
      context.font = '8px sans-serif';
      context.textBaseline = "alphabetic";
      context.textAlign = "end";
      // Selection Range in MS
      context.fillText(Math.abs(right - left).toFixed(2), Math.min(left, right) - 4, 10);
      // Selection Range in Frames
      context.fillText((Math.abs(right - left) / 60).toFixed(2), Math.min(left, right) - 4, 20);
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

    onMouseDown(x: number, y: number) {
      this._selection = { left: x, right: x };
      this._draw();
    }

    onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number) {
      this._selection = { left: startX, right: clamp(currentX, 0, this._width - 1) };
      this._draw();
    }

    onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number) {
      var start = startX / this._width;
      var end = clamp(currentX / this._width, 0, 1);
      this._controller.onWindowChange(start, end);
      this._selection = null;
      this._draw();
    }

    onClick(x: number, y: number) {
      this._selection = null;
      this._draw();
    }

    onHoverStart(x: number, y: number) {}
    onHoverEnd() {}
    onMouseMove(x: number, y: number) {}
    onMouseOver(x: number, y: number) {}
    onMouseOut() {}
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
