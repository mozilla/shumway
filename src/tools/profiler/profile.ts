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

  export class Profile {
    private _controller: Controller;
    private _buffers: TimelineBuffer [];
    private _bufferNames: string [];
    private _startTime: number;
    private _endTime: number;
    private _windowStart: number;
    private _windowEnd: number;
    private _maxDepth: number;
    private _hasSnapshot: boolean;

    constructor() {
      this._buffers = [];
      this._bufferNames = [];
      this._controller = null;
      this._hasSnapshot = false;
    }

    get bufferCount(): number {
      return this._buffers.length;
    }

    getBufferAt(index: number): TimelineBuffer {
      return this._buffers[index];
    }

    addBuffer(buffer:TimelineBuffer, name: string) {
      this._buffers.push(buffer);
      this._bufferNames.push(name);
    }

    get hasSnapshot(): boolean {
      return this._hasSnapshot;
    }

    get startTime(): number {
      return this._startTime;
    }

    get endTime(): number {
      return this._endTime;
    }

    get totalTime(): number {
      return this.endTime - this.startTime;
    }

    get windowStart(): number {
      return this._windowStart;
    }

    get windowEnd(): number {
      return this._windowEnd;
    }

    get windowLength(): number {
      return this.windowEnd - this.windowStart;
    }

    get maxDepth(): number {
      return this._maxDepth;
    }

    createSnapshot() {
      var startTime = Number.MAX_VALUE;
      var endTime = Number.MIN_VALUE;
      var maxDepth = 0;
      for (var i = 0; i < this._buffers.length; i++) {
        var buffer: TimelineBuffer = this._buffers[i];
        buffer.createSnapshot();
        if (startTime > buffer.snapshot.startTime) {
          startTime = buffer.snapshot.startTime;
        }
        if (endTime < buffer.snapshot.endTime) {
          endTime = buffer.snapshot.endTime;
        }
        if (maxDepth < buffer.maxDepth) {
          maxDepth = buffer.maxDepth
        }
      }
      this._startTime = startTime;
      this._endTime = endTime;
      this._windowStart = startTime;
      this._windowEnd = endTime;
      this._maxDepth = maxDepth;
      this._hasSnapshot = true;
    }

    setWindow(start: number, end: number) {
      if (start > end) {
        var tmp = start;
        start = end;
        end = tmp;
      }
      var length = Math.min(end - start, this.totalTime);
      if (start < this._startTime) {
        start = this._startTime;
        end = this._startTime + length;
      } else if (end > this._endTime) {
        start = this._endTime - length;
        end = this._endTime;
      }
      this._windowStart = start;
      this._windowEnd = end;
    }

    moveWindowTo(time: number) {
      this.setWindow(time - this.windowLength / 2, time + this.windowLength / 2);
    }

    reset() {
      for (var i = 0; i < this._buffers.length; i++) {
        var buffer: TimelineBuffer = this._buffers[i];
        buffer.reset();
      }
      this._hasSnapshot = false;
    }
  }
}
