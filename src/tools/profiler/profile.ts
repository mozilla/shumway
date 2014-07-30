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
    private _snapshots: TimelineBufferSnapshot [];
    private _buffers: TimelineBuffer [];
    private _startTime: number;
    private _endTime: number;
    private _windowStart: number;
    private _windowEnd: number;
    private _maxDepth: number;

    constructor(buffers?: TimelineBuffer []) {
      this._buffers = buffers || [];
      this._snapshots = [];
      this._maxDepth = 0;
    }

    addBuffer(buffer: TimelineBuffer) {
      this._buffers.push(buffer);
    }

    getSnapshotAt(index: number): TimelineBufferSnapshot {
      return this._snapshots[index];
    }

    get hasSnapshots(): boolean {
      return (this.snapshotCount > 0);
    }

    get snapshotCount(): number {
      return this._snapshots.length;
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

    forEachSnapshot(visitor: (snapshot: TimelineBufferSnapshot, index: number) => void) {
      for (var i = 0, n = this.snapshotCount; i < n; i++) {
        visitor(this._snapshots[i], i);
      }
    }

    createSnapshots() {
      var startTime = Number.MAX_VALUE;
      var endTime = Number.MIN_VALUE;
      var maxDepth = 0;
      this._snapshots = [];
      while (this._buffers.length > 0) {
        var buffer = this._buffers.shift();
        var snapshot = buffer.createSnapshot();
        if (snapshot) {
          if (startTime > snapshot.startTime) {
            startTime = snapshot.startTime;
          }
          if (endTime < snapshot.endTime) {
            endTime = snapshot.endTime;
          }
          if (maxDepth < snapshot.maxDepth) {
            maxDepth = snapshot.maxDepth;
          }
          this._snapshots.push(snapshot);
        }
      }
      this._startTime = startTime;
      this._endTime = endTime;
      this._windowStart = startTime;
      this._windowEnd = endTime;
      this._maxDepth = maxDepth;
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

  }
}
