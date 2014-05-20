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

  /**
   * Represents a single timeline frame range and makes it easier to work with the compacted
   * timeline buffer data.
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

    /**
     * Gets the child index of the first child to overlap the specified time.
     */
    public getChildIndex(time: number): number {
      var children = this.children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.endTime > time) {
          return i;
        }
      }
      return 0;
    }

    /**
     * Gets the high and low index of the children that intersect the specified time range.
     *
     * TODO: This uses a dumb linear algorithm, we can do much better here by doing a binary search.
     */
    public getChildRange(s: number, e: number): number [] {
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

    /**
     * Finds the deepest child that intersects with the specified time.
     */
    public query(time: number): TimelineFrame {
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

    /**
     * Gets this frame's distance to the root.
     */
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

  /**
   * Records enter / leave events in two circular buffers. The goal here is to be able to handle
   * large ammounts of data.
   */
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
      this.marks = new Shumway.CircularBuffer(Int32Array, 20);
      this.times = new Shumway.CircularBuffer(Float64Array, 20);
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

    /**
     * Constructs an easier to work with TimelineFrame data structure.
     */
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

  interface DragInfo {
    overview: boolean;
    clientX: number;
    windowLeft: number;
    windowRight: number;
  }

  export class FlameChart {
    private _container: HTMLElement;
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    private _overviewHeight = 64;
    private _overviewCanvasDirty = true;
    private _overviewCanvas: HTMLCanvasElement;
    private _overviewContext: CanvasRenderingContext2D;

    private _offsetWidth: number;
    private _offsetHeight: number;

    private _buffer: TimelineBuffer;

    private _windowLeft = 0;
    private _windowRight = Number.MAX_VALUE;
    private _timeToPixels = 1;
    private _pixelsToTime = 1;
    private _pixelsToOverviewTime = 1;
    private _range: TimelineFrame;
    private _minTime = 5;
    private _kindStyle: Shumway.Map<Kind>;

    private _drag: DragInfo = null;
    private _ignoreClick = false;
    private _cursor = "default";

    /**
     * Don't paint frames whose width is smaller than this value. This helps a lot when drawing
     * large ranges. This can be < 1 since antialiasing can look quite nice.
     */
    private _minFrameWidthInPixels = 0.2;

    constructor(container: HTMLElement, buffer: TimelineBuffer) {
      this._container = container;
      this._canvas = document.createElement("canvas");
      this._canvas.style.display = "block";
      this._context = this._canvas.getContext("2d");
      this._context.font = 10 + 'px Consolas, "Liberation Mono", Courier, monospace';
      this._container.appendChild(this._canvas);
      this._overviewCanvas = document.createElement("canvas");
      this._overviewContext = this._overviewCanvas.getContext("2d");
      this._buffer = buffer;
      this._range = this._buffer.gatherRange(Number.MAX_VALUE);
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
        var offset:number;
        var mult:number;
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
        var delta = clamp(event.detail ? event.detail : -event.wheelDeltaY / 120, -1, 1);
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
        ["", "-moz-", "-webkit-"].forEach(function(prefix) {
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

    private _drawFrame(frame: TimelineFrame, depth: number) {
      var context = this._context;
      var start = (frame.startTime - this._windowLeft) * this._timeToPixels;
      var end = (frame.endTime - this._windowLeft) * this._timeToPixels;
      var width = end - start;
      if (width < this._minFrameWidthInPixels) {
        return;
      }
      var style = this._kindStyle[frame.kind];
      if (!style) {
        var background = ColorStyle.randomStyle();
        style = this._kindStyle[frame.kind] = {
          bgColor: background,
          textColor: ColorStyle.contrastStyle(background)
        };
      }
      context.fillStyle = style.bgColor;
      context.fillRect(start, depth * 12, width, 12);
      context.fillStyle = style.textColor;
      context.textBaseline  = "top";
      var label = this._buffer.getKindName(frame.kind);
      var labelHPadding = 2;
      if (width > 10 && context.measureText(label).width + (2 * labelHPadding) < width) {
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
      var ratio = window.devicePixelRatio;
      var range = this._range;

      if (this._overviewCanvasDirty) {
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
        var contextOverview = this._overviewContext;
        contextOverview.save();
        contextOverview.scale(ratio, ratio);
        contextOverview.beginPath();
        contextOverview.moveTo(0, this._overviewHeight);
        for (var i = 0; i < depths.length; i++) {
          x += sampleWidthInPixels;
          var y = depths[i] * depthHeight;
          contextOverview.lineTo(x, y);
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

    private _drawFlames() {
      var a = this._range.getChildRange(this._windowLeft, this._windowRight);
      var l = a[0];
      var r = a[1];
      if (r < 0 || l < 0) {
        return;
      }
      var context = this._context;
      var ratio = window.devicePixelRatio;
      context.save();
      context.scale(ratio, ratio);
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
      context.restore();

      this._drawOverview();
      this._drawFlames();
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
  }
}
