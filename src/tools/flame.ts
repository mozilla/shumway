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
module Shumway.Tools {
  import clamp = NumberUtilities.clamp;
  import createEmptyObject = ObjectUtilities.createEmptyObject;

  /**
   * Inspired by the Chrome flame chart and others.
   */

  export class TimelineFrame {
    public children: TimelineFrame [];
    public total: number;
    constructor (
      public parent: TimelineFrame,
      public kind: number,
      public startTime: number,
      public endTime: number) {
      // ...
    }

    public getChildIndex(time: number) {
      var children = this.children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.endTime > time) {
          return i;
        }
      }
      return 0;
    }

    public getChildRange(s: number, e: number) {
      var children = this.children;
      var j = -1, k = -1;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var l = child.startTime, r = child.endTime;
        if (l <= e && s <= r) { // Segments Overlap
          if (j < 0) {
            j = i;
          }
          k = i;
        }
      }
      return [j, k];
    }

    public query(time: number) {
      if (time < this.startTime || time > this.endTime) {
        return null;
      }
      var children = this.children;
      if (children) {
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (time >= child.startTime && time <= child.endTime) {
            return child.query(time);
          }
        }
      }
      return this;
    }

    public getDepth(): number {
      var depth = 0;
      var self = this;
      while (self) {
        depth ++;
        self = self.parent;
      }
      return depth;
    }
  }

  export class TimelineBuffer {
    static ENTER = 0xBEEF0000 | 0;
    static LEAVE = 0xDEAD0000 | 0;

    private _depth: number;
    private _kindCount: number;
    public marks: Shumway.CircularBuffer;
    public times: Shumway.CircularBuffer;
    public kinds: Shumway.Map<number>;
    public kindNames: Shumway.Map<string>;

    constructor() {
      this.marks = new Shumway.CircularBuffer(Int32Array);
      this.times = new Shumway.CircularBuffer(Float64Array);
      this.kinds = createEmptyObject();
      this.kindNames = createEmptyObject();
      this._depth = 0;
      this._kindCount = 0;
    }

    getKindName(kind: number): string {
      return this.kindNames[kind];
    }

    getKind(name: string): number {
      if (this.kinds[name] === undefined) {
        var kind = this._kindCount ++;
        this.kinds[name] = kind;
        this.kindNames[kind] = name;
      }
      return this.kinds[name];
    }

    enter(name: string, time?: number) {
      this._depth++;
      this.marks.write(TimelineBuffer.ENTER | this.getKind(name));
      this.times.write(time || performance.now());
    }

    leave(name: string, time?: number) {
      this.marks.write(TimelineBuffer.LEAVE | this.getKind(name));
      this.times.write(time || performance.now());
      this._depth--;
    }

    gatherRange(count: number): TimelineFrame {
      var range = new TimelineFrame(null, 0, NaN, NaN);
      var stack: TimelineFrame [] = [range];
      var times = this.times;
      var topLevelFrameCount = 0;
      this.marks.forEachInReverse(function (mark, i) {
        var time = times.get(i);
        if ((mark & 0xFFFF0000) === TimelineBuffer.LEAVE) {
          if (stack.length === 1) {
            topLevelFrameCount ++;
            if (topLevelFrameCount > count) {
              return true;
            }
          }
          stack.push(new TimelineFrame(stack[stack.length - 1], mark & 0xFFFF, NaN, time));
        } else if ((mark & 0xFFFF0000) === TimelineBuffer.ENTER) {
          var node = stack.pop();
          var top = stack[stack.length - 1];
          node.startTime = time;
          if (!top.children) {
            top.children = [node];
          } else {
            top.children.unshift(node);
          }
        }
      });
      if (!range.children || !range.children.length) {
        return null;
      }
      range.startTime = range.children[0].startTime;
      range.endTime = range.children[range.children.length - 1].endTime;
      return range;
    }
  }

  interface Kind {
    bgColor: string;
    textColor: string;
  }

  export class FlameChart {
    private _container: HTMLElement;
    private _canvas: HTMLCanvasElement;
    private _offsetWidth: number;
    private _offsetHeight: number;

    private _context: CanvasRenderingContext2D;
    private _buffer: TimelineBuffer;

    private _overviewHeight = 64;
    private _windowLeft = 0;
    private _windowRight = Number.MAX_VALUE;
    private _timeToPixels = 1;
    private _pixelsToTime = 1;
    private _pixelsToOverviewTime = 1;
    private _range: TimelineFrame;
    private _minTime = 5;
    private _kindStyle: Shumway.Map<Kind>;

    private _drag: any = null;
    private _ignoreClick = false;

    constructor(container: HTMLElement, buffer: TimelineBuffer) {
      this._container = container;
      this._canvas = document.createElement("canvas");
      this._canvas.style.display = "block";
      this._context = this._canvas.getContext("2d");
      this._context.font = 10 + 'px Consolas, "Liberation Mono", Courier, monospace';
      this._container.appendChild(this._canvas);
      this._buffer = buffer;
      this._range = this._buffer.gatherRange(512);
      this._kindStyle = createEmptyObject();
      this._resetCanvas();
      window.addEventListener("resize", this._onResize.bind(this));
      this._canvas.addEventListener("mousewheel", this._onMouseWheel.bind(this), false);
      this._canvas.addEventListener("DOMMouseScroll", this._onMouseWheel.bind(this), false);
      this._canvas.addEventListener("mousedown", this._onMouseDown.bind(this), false);
      window.addEventListener("mouseup", this._onMouseUp.bind(this), true);
      this._canvas.addEventListener("mousemove", this._onMouseMove.bind(this), false);
      this._canvas.addEventListener("click", this._onClick.bind(this), false);
      this._onResize();
    }

    private _onClick(event: MouseEvent) {
      if (this._ignoreClick) {
        this._ignoreClick = false;
        return;
      }
      if (event.clientY < this._overviewHeight) {
        var window = this._windowRight - this._windowLeft;
        this._windowLeft = this._range.startTime + event.clientX * this._pixelsToOverviewTime - window / 2;
        this._windowRight = this._range.startTime + event.clientX * this._pixelsToOverviewTime + window / 2;
        this._updateUnits();
        this._draw();
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
        if (this._isDraggable(event)) {
          this._drag = {
            overview: true,
            offsetX: event.clientX,
            windowLeft: this._windowLeft,
            windowRight: this._windowRight,
          };
        }
      } else {
        this._drag = {
          overview: false,
          offsetX: event.clientX,
          windowLeft: this._windowLeft,
          windowRight: this._windowRight,
        };
      }
      this._updateCursor(event);
    }

    private _onMouseMove(event: MouseEvent) {
      if (this._drag) {
        var offset: number;
        var mult: number;
        if (this._drag.overview) {
          offset = event.clientX - this._drag.offsetX;
          mult = this._pixelsToOverviewTime;
        } else {
          offset = -event.clientX + this._drag.offsetX;
          mult = this._pixelsToTime;
        }
        this._windowLeft = this._drag.windowLeft + offset * mult;
        this._windowRight = this._drag.windowRight + offset * mult;
        this._updateUnits();
        this._draw();
      }
      this._updateCursor(event);
    }

    private _onMouseWheel(event: MouseEvent) {
      event.stopPropagation();
      if (this._drag === null) {
        var range = this._range;
        var delta = clamp(event.detail ? event.detail : -event.wheelDeltaY / 120, -1, 1);
        var zoom = Math.pow(1.2, delta) - 1;
        var rangeTotalTime = range.endTime - range.startTime;
        var cursorTime = range.startTime + event.clientX * (rangeTotalTime / this._offsetWidth);
        this._windowLeft += (this._windowLeft - cursorTime) * zoom;
        this._windowRight += (this._windowRight - cursorTime) * zoom;
        this._updateUnits();
        this._updateCursor(event);
        this._draw();
      }
    }

    private _clampWindow() {
      var range = this._range;
      var windowSize = this._windowRight - this._windowLeft;
      if (windowSize < this._minTime) {
        windowSize = this._minTime;
        var center = this._windowLeft + windowSize / 2;
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
      this._clampWindow();
      this._timeToPixels = this._offsetWidth / (this._windowRight - this._windowLeft);
      this._pixelsToTime = (this._windowRight - this._windowLeft) / this._offsetWidth;
      this._pixelsToOverviewTime = (this._range.endTime - this._range.startTime) / this._offsetWidth;
    }

    private _onResize() {
      this._offsetWidth = this._container.offsetWidth;
      this._offsetHeight = this._container.offsetHeight;
      this._resetCanvas();
      this._updateUnits();
      this._draw();
    }

    private _resetCanvas() {
      var ratio = window.devicePixelRatio;
      this._canvas.width = this._offsetWidth * ratio;
      this._canvas.height = this._offsetHeight * ratio;
      this._canvas.style.width = this._offsetWidth + "px";
      this._canvas.style.height = this._offsetHeight + "px";
    }

    private _pixelTime(time: number): number {
      var window = this._windowRight - this._windowLeft;
      return (time - this._windowLeft) * (this._offsetWidth / window);
    }

    private _drawFrame(frame: TimelineFrame, depth: number) {
      var context = this._context;
      var start = (frame.startTime - this._windowLeft) * this._timeToPixels;
      var end = (frame.endTime - this._windowLeft) * this._timeToPixels;
      var style = this._kindStyle[frame.kind];
      if (!style) {
        var background = ColorStyle.randomStyle();
        style = this._kindStyle[frame.kind] = {
          bgColor: background,
          textColor: ColorStyle.contrastStyle(background)
        };
      }
      context.fillStyle = style.bgColor;
      context.fillRect(start, depth * 12, end - start, 12);
      context.fillStyle = style.textColor;
      context.textBaseline  = "top";
      var label = this._buffer.getKindName(frame.kind);
      var labelHPadding = 2;
      if (context.measureText(label).width + (2 * labelHPadding) < (end - start)) {
        context.fillText(label, start + labelHPadding, depth * 12);
      }

      var children = frame.children;
      if (children) {
        for (var i = 0; i < children.length; i++) {
          this._drawFrame(children[i], depth + 1);
        }
      }
    }

    private _drawOverview() {
      var context = this._context;
      var range = this._range;

      var rangeTotalTime = range.endTime - range.startTime;
      var sampleWidthInPixels = 1;
      var sampleTimeInterval = rangeTotalTime / (this._offsetWidth / sampleWidthInPixels);

      var depths = [];
      var maxDepth = 0;
      for (var time = range.startTime; time < range.endTime; time += sampleTimeInterval) {
        var depth = range.query(time).getDepth();
        maxDepth = Math.max(maxDepth, depth);
        depths.push(depth);
      }

      var depthHeight = this._overviewHeight / maxDepth | 0;
      var x = 0;
      context.beginPath();
      context.moveTo(0, this._overviewHeight);
      for (var i = 0; i < depths.length; i++) {
        x += sampleWidthInPixels;
        var y = depths[i] * depthHeight;
        context.lineTo(x, y);
      }
      context.lineTo(x, this._overviewHeight);
      context.fillStyle = "#70bf53";
      context.fill();

      if (!this._windowLeft || !this._windowRight) {
        this._windowLeft = range.startTime;
        this._windowRight = range.endTime;
      }

      var windowLeftPixels = ((this._windowLeft - range.startTime) / rangeTotalTime * this._offsetWidth) | 0;
      var windowRightPixels = ((this._windowRight - range.startTime) / rangeTotalTime * this._offsetWidth) | 0;

      context.fillStyle = "rgba(235, 83, 104, 0.5)";
      context.fillRect(windowLeftPixels, 0, windowRightPixels - windowLeftPixels, this._overviewHeight);
    }

    private _drawFlames() {
      var a = this._range.getChildRange(this._windowLeft, this._windowRight);
      var l = a[0];
      var r = a[1];
      if (r < 0 || l < 0) {
        return;
      }
      var context = this._context;
      context.save();
      context.translate(0, this._overviewHeight);
      for (var i = l; i <= r; i++) {
        this._drawFrame(this._range.children[i], 0);
      }
      context.restore();
    }

    private _draw() {
      var context = this._context;
      var ratio = window.devicePixelRatio;

      context.save();
      context.scale(ratio, ratio);
      context.fillStyle = "#181d20";
      context.fillRect(0, 0, this._offsetWidth, this._offsetHeight);

      this._drawOverview();
      this._drawFlames();

      context.restore();
    }

    private _isDraggable(event: MouseEvent): boolean {
      var hit = true;
      if (event.clientY < this._overviewHeight) {
        var range = this._range;
        var rangeTotalTime = range.endTime - range.startTime;
        var windowLeftPixels = ((this._windowLeft - range.startTime) / rangeTotalTime * this._offsetWidth) | 0;
        var windowRightPixels = ((this._windowRight - range.startTime) / rangeTotalTime * this._offsetWidth) | 0;
        hit = (event.clientX >= windowLeftPixels && event.clientX <= windowRightPixels);
      }
      return hit;
    }

    private _updateCursor(event: MouseEvent) {
      var showHandCursor = this._isDraggable(event);
      var pressed = (this._drag !== null);
      var value = showHandCursor ? (pressed ? "grabbing" : "grab") : "default";
      var self = this;
      ["", "-moz-", "-webkit-"].forEach(function(prefix) {
        self._canvas.style.cursor = prefix + value;
      })
    }
  }
}