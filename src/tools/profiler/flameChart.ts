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
  import trimMiddle = StringUtilities.trimMiddle;
  import createEmptyObject = ObjectUtilities.createEmptyObject;

  interface KindStyle {
    bgColor: string;
    textColor: string;
  }

  interface DragInfo {
    overview: boolean;
    clientX: number;
    windowLeft: number;
    windowRight: number;
  }

  export class FlameChart implements MouseControllerTarget {

    private _controller: Controller;
    private _bufferIndex: number;
    private _buffer: TimelineBuffer;

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    private _mouseController: MouseController;

    private _width: number;
    private _height: number;

    private _windowStart: number;
    private _windowEnd: number;
    private _rangeStart: number;
    private _rangeEnd: number;
    private _maxDepth: number;

    private _kindStyle: Shumway.Map<KindStyle>;

    private _initialized: boolean;
    private _type: FlameChartHeaderType;
    private _dragInfo: DragInfo;
    private _textWidth = {};
    private _hoveredFrame:TimelineFrame;

    /**
     * Don't paint frames whose width is smaller than this value. This helps a lot when drawing
     * large ranges. This can be < 1 since anti-aliasing can look quite nice.
     */
    private _minFrameWidthInPixels = 0.2;

    constructor(controller: Controller, bufferIndex: number) {
      this._controller = controller;
      this._bufferIndex = bufferIndex;
      this._buffer = controller.getBufferAt(bufferIndex);
      this._initialized = false;
      this._kindStyle = createEmptyObject();
      this._canvas = document.createElement("canvas");
      this._context = this._canvas.getContext("2d");
      this._mouseController = new MouseController(this, this._canvas);
      var container = controller.container;
      container.appendChild(this._canvas);
      var rect = container.getBoundingClientRect();
      this.setSize(rect.width);
    }

    setSize(width: number, height?: number) {
      this._width = width;
      this._height = height || this._initialized ? this._maxDepth * 12 : 100;
      this._resetCanvas();
      this._draw();
    }

    initialize(rangeStart: number, rangeEnd: number) {
      this._initialized = true;
      this._maxDepth = this._buffer.maxDepth;
      this.setRange(rangeStart, rangeEnd, false);
      this.setWindow(rangeStart, rangeEnd, false);
      this.setSize(this._width, this._maxDepth * 12);
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
      this._buffer = null;
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

      context.save();
      context.scale(ratio, ratio);
      context.fillStyle = "#181d20";
      context.fillRect(0, 0, this._width, this._height);
      context.restore();

      if (this._initialized) {
        this._drawFrames();
      }
    }

    private _drawFrames() {
      var snapshot = this._buffer.snapshot;
      var a = snapshot.getChildRange(this._windowStart, this._windowEnd);
      if (a == null) {
        return;
      }
      var l = a[0];
      var r = a[1];
      var context = this._context;
      var ratio = window.devicePixelRatio;
      context.save();
      context.scale(ratio, ratio);
      for (var i = l; i <= r; i++) {
        this._drawFrame(snapshot.children[i], 0);
      }
      context.restore();
    }

    private _drawFrame(frame: TimelineFrame, depth: number) {
      var context = this._context;
      var start = this._toPixels(frame.startTime);
      var end = this._toPixels(frame.endTime);
      var width = end - start;
      if (width < this._minFrameWidthInPixels) {
        return;
      }
      var style = this._kindStyle[frame.kind.id];
      if (!style) {
        var background = ColorStyle.randomStyle();
        style = this._kindStyle[frame.kind.id] = {
          bgColor: background,
          textColor: ColorStyle.contrastStyle(background)
        };
      }
      var frameHPadding = 0.5;
      context.save();
      if (this._hoveredFrame && this._hoveredFrame.kind !== frame.kind) {
        context.globalAlpha = 0.4;
      }
      context.fillStyle = style.bgColor;
      context.fillRect(start, depth * (12 + frameHPadding), width, 12);
      if (width > 12) {
        var label = frame.kind.name;
        if (label && label.length) {
          var labelHPadding = 2;
          label = this._prepareText(context, label, width - labelHPadding * 2);
          if (label.length) {
            context.fillStyle = style.textColor;
            context.textBaseline = "top";
            context.fillText(label, (start + labelHPadding), depth * (12 + frameHPadding));
          }
        }
      }
      context.restore();
      var children = frame.children;
      if (children) {
        for (var i = 0; i < children.length; i++) {
          this._drawFrame(children[i], depth + 1);
        }
      }
    }

    private _prepareText(context: CanvasRenderingContext2D, title: string, maxSize: number):string {
      var titleWidth = this._measureWidth(context, title);
      if (maxSize > titleWidth) {
        return title;
      }
      var l = 3;
      var r = title.length;
      while (l < r) {
        var m = (l + r) >> 1;
        if (this._measureWidth(context, trimMiddle(title, m)) < maxSize) {
          l = m + 1;
        } else {
          r = m;
        }
      }
      title = trimMiddle(title, r - 1);
      titleWidth = this._measureWidth(context, title);
      if (titleWidth <= maxSize) {
        return title;
      }
      return "";
    }

    private _measureWidth(context: CanvasRenderingContext2D, text: string): number {
      var width = this._textWidth[text];
      if (!width) {
        width = context.measureText(text).width;
        this._textWidth[text] = width;
      }
      return width;
    }

    private _toPixelsRelative(time: number): number {
      return time * this._width / (this._windowEnd - this._windowStart);
    }

    private _toPixels(time: number): number {
      return this._toPixelsRelative(time - this._windowStart);
    }

    private _toTimeRelative(px: number): number {
      return px * (this._windowEnd - this._windowStart) / this._width;
    }

    private _toTime(px: number): number {
      return this._toTimeRelative(px) + this._windowStart;
    }

    private _getFrameAtPosition(x: number, y: number): TimelineFrame {
      var time = this._toTime(x);
      var depth = (y / 12 + 2) | 0;
      var snapshot = this._buffer.snapshot;
      var frame = snapshot.query(time);
      if (frame) {
        var frameDepth = frame.getDepth();
        if (frameDepth >= depth) {
          while (frame && frameDepth > depth) {
            frame = frame.parent;
            frameDepth--;
          }
          return frame;
        }
      }
      return null;
    }

    onMouseDown(x: number, y: number) {
    }

    onMouseMove(x: number, y: number) {
    }

    onMouseOver(x: number, y: number) {
    }

    onMouseOut() {
    }

    onMouseWheel(x: number, y: number, delta: number) {
    }

    onDrag(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number) {
    }

    onDragEnd(startX: number, startY: number, currentX: number, currentY: number, deltaX: number, deltaY: number) {
    }

    onClick(x: number, y: number) {
    }

    onHoverStart(x: number, y: number) {
      var frame = this._getFrameAtPosition(x, y);
      if (frame) {
        this._hoveredFrame = frame;
        this._controller.showTooltip(this._bufferIndex, frame);
        //this._draw();
      }
    }

    onHoverEnd() {
      if (this._hoveredFrame) {
        this._hoveredFrame = null;
        this._controller.hideTooltip();
        //this._draw();
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
      this._timeToPixels = this._offsetWidth / (this._windowRight - this._windowLeft);
      this._pixelsToTime = (this._windowRight - this._windowLeft) / this._offsetWidth;
      this._pixelsToOverviewTime = (this._range.endTime - this._range.startTime) / this._offsetWidth;
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

    private _updateCursor(event: MouseEvent) {
      var showHandCursor = (this._getCursorPosition(event) == 0);
      var isDragging = (this._drag !== null);
      var value = showHandCursor ? (isDragging ? "grabbing" : "grab") : "default";
      if (this._cursor !== value) {
        this._cursor = value;
        var self = this;
        ["", "-moz-", "-webkit-"].forEach(function (prefix) {
          self._canvas.style.cursor = prefix + value;
        });
      }
    }

    private _onResize() {
      this._offsetWidth = this._container.offsetWidth;
      this._offsetHeight = this._container.offsetHeight;
      this._resetCanvas();
      this._clampWindow();
      this._updateUnits();
      this._draw();
    }

    private _resetCanvas() {
      var ratio = window.devicePixelRatio;
      this._canvas.width = this._overviewCanvas.width = this._offsetWidth * ratio;
      this._canvas.height = this._offsetHeight * ratio;
      this._canvas.style.width = this._overviewCanvas.style.width = this._offsetWidth + "px";
      this._canvas.style.height = this._offsetHeight + "px";
      this._overviewCanvas.height = this._overviewHeight * ratio;
      this._overviewCanvas.style.height = this._overviewHeight + "px";
      this._overviewCanvasDirty = true;
    }

    private _pixelTime(time: number): number {
      var window = this._windowRight - this._windowLeft;
      return (time - this._windowLeft) * (this._offsetWidth / window);
    }

    private _drawOverview() {
      var context = this._context;
      var ratio = window.devicePixelRatio;
      var range = this._range;

      if (this._overviewCanvasDirty) {
        var rangeTotalTime = range.endTime - range.startTime;
        var sampleWidthInPixels = 1;
        var sampleTimeInterval = rangeTotalTime / (this._offsetWidth / sampleWidthInPixels);

        var depths = [];
        var maxDepth = 0;
        for (var time = range.startTime; time < range.endTime; time += sampleTimeInterval) {
          var depth = range.query(time).getDepth() - 1;
          maxDepth = Math.max(maxDepth, depth);
          depths.push(depth);
        }

        var height = this._overviewHeight;
        var depthHeight = height / maxDepth | 0;
        var x = 0;
        var contextOverview = this._overviewContext;
        contextOverview.save();
        contextOverview.translate(0, ratio * height);
        contextOverview.scale(ratio, ratio * depthHeight);
        contextOverview.beginPath();
        contextOverview.moveTo(0, this._overviewHeight);
        for (var i = 0; i < depths.length; i++) {
          x += sampleWidthInPixels;
          contextOverview.lineTo(x, -depths[i]);
        }
        contextOverview.lineTo(x, this._overviewHeight);
        contextOverview.fillStyle = "#70bf53";
        contextOverview.fill();
        contextOverview.restore();

        this._overviewCanvasDirty = false;
      }

      context.drawImage(this._overviewCanvas, 0, 0);

      var windowLeftPixels = ((this._windowLeft - range.startTime) / this._pixelsToOverviewTime) | 0;
      var windowRightPixels = ((this._windowRight - range.startTime) / this._pixelsToOverviewTime) | 0;

      context.save();
      context.scale(ratio, ratio);
      context.fillStyle = "rgba(235, 83, 104, 0.5)";
      context.fillRect(windowLeftPixels, 0, windowRightPixels - windowLeftPixels, this._overviewHeight);
      context.restore();
    }

    private _getCursorPosition(event: MouseEvent): number {
      var pos = 0;
      if (event.clientY < this._overviewHeight) {
        var range = this._range;
        var rangeTotalTime = range.endTime - range.startTime;
        var windowLeftPixels = ((this._windowLeft - range.startTime) / rangeTotalTime * this._offsetWidth) | 0;
        var windowRightPixels = ((this._windowRight - range.startTime) / rangeTotalTime * this._offsetWidth) | 0;
        if (event.clientX < windowLeftPixels) {
          pos = -1;
        } else if (event.clientX > windowRightPixels) {
          pos = 1;
        }
      }
      return pos;
    }
    */

  }
}
