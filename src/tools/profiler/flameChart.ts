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

  export class FlameChart extends FlameChartBase implements MouseControllerTarget {

    private _bufferIndex: number;
    private _buffer: TimelineBuffer;

    private _kindStyle: Shumway.Map<KindStyle>;
    private _textWidth = {};

    private _maxDepth: number;
    private _hoveredFrame:TimelineFrame;

    /**
     * Don't paint frames whose width is smaller than this value. This helps a lot when drawing
     * large ranges. This can be < 1 since anti-aliasing can look quite nice.
     */
    private _minFrameWidthInPixels = 0.5;

    constructor(controller: Controller, bufferIndex: number) {
      super(controller);
      this._bufferIndex = bufferIndex;
      this._buffer = controller.getBufferAt(bufferIndex);
      this._kindStyle = createEmptyObject();
    }

    setSize(width: number, height?: number) {
      super.setSize(width, height || this._initialized ? this._maxDepth * 12.5 : 100);
    }

    initialize(rangeStart: number, rangeEnd: number) {
      this._initialized = true;
      this._maxDepth = this._buffer.maxDepth;
      this.setRange(rangeStart, rangeEnd, false);
      this.setWindow(rangeStart, rangeEnd, false);
      this.setSize(this._width, this._maxDepth * 12.5);
    }

    destroy() {
      super.destroy();
      this._buffer = null;
    }

    _draw() {
      var context = this._context;
      var ratio = window.devicePixelRatio;

      context.save();
      context.scale(ratio, ratio);
      context.fillStyle = "#181d20";
      context.fillRect(0, 0, this._width, this._height);

      if (this._initialized) {
        this._drawChildren(this._buffer.snapshot);
      }

      context.restore();
    }

    private _drawChildren(parent: TimelineFrame, depth: number = 0) {
      var range = parent.getChildRange(this._windowStart, this._windowEnd);
      if (range) {
        for (var i = range.start; i <= range.end; i++) {
          var child = parent.children[i];
          if (this._drawFrame(child, depth)) {
            this._drawChildren(child, depth + 1);
          }
        }
      }
    }

    private _drawFrame(frame: TimelineFrame, depth: number): boolean {
      var context = this._context;
      var left = this._toPixels(frame.startTime);
      var right = this._toPixels(frame.endTime);
      var width = right - left;
      if (width < this._minFrameWidthInPixels) {
        return false;
      }
      if (left < 0) {
        right = width + left;
        left = 0;
      }
      var adjustedWidth = right - left;
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
      //if (this._hoveredFrame && this._hoveredFrame.kind !== frame.kind) {
      //  context.globalAlpha = 0.4;
      //}
      context.fillStyle = style.bgColor;
      context.fillRect(left, depth * (12 + frameHPadding), adjustedWidth, 12);

      if (width > 12) {
        var label = frame.kind.name;
        if (label && label.length) {
          var labelHPadding = 2;
          label = this._prepareText(context, label, adjustedWidth - labelHPadding * 2);
          if (label.length) {
            context.fillStyle = style.textColor;
            context.textBaseline = "top";
            context.fillText(label, (left + labelHPadding), depth * (12 + frameHPadding));
          }
        }
      }
      context.restore();
      return true;
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
      var depth = (y / 12.5) | 0;
      var snapshot = this._buffer.snapshot;
      var frame = snapshot.query(time);
      if (frame) {
        while (frame && frame.depth > depth) {
          frame = frame.parent;
        }
        return frame;
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

  }
}
