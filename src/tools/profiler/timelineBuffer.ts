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
  import createEmptyObject = ObjectUtilities.createEmptyObject;

  export interface TimelineItemKind {
    id: number;
    name: string;
    bgColor: string;
    textColor: string;
    visible: boolean;
  }

  /**
   * Records enter / leave events in two circular buffers.
   * The goal here is to be able to handle large amounts of data.
   */
  export class TimelineBuffer {
    static ENTER = 0xBEEF0000 | 0;
    static LEAVE = 0xDEAD0000 | 0;

    private _depth: number;
    private _kindCount: number;
    private _kinds: TimelineItemKind [];
    private _kindNameMap: Shumway.Map<TimelineItemKind>;
    private _marks: Shumway.CircularBuffer;
    private _times: Shumway.CircularBuffer;
    private _stack: number [];

    public name: string;

    constructor(name?: string) {
      this.name = name || "";
      this._depth = 0;
      this._kindCount = 0;
      this._kinds = [];
      this._kindNameMap = createEmptyObject();
      this._marks = new Shumway.CircularBuffer(Int32Array, 20);
      this._times = new Shumway.CircularBuffer(Float64Array, 20);
      this._stack = [];
    }

    getKind(kind: number): TimelineItemKind {
      return this._kinds[kind];
    }

    get kinds(): TimelineItemKind [] {
      return this._kinds.concat();
    }

    get depth(): number {
      return this._depth;
    }

    private _getKindId(name: string):number {
      if (this._kindNameMap[name] === undefined) {
        var kind: TimelineItemKind = <TimelineItemKind>{
          id: this._kinds.length,
          name: name,
          visible: true
        };
        this._kinds.push(kind);
        this._kindNameMap[name] = kind;
      }
      return this._kindNameMap[name].id;
    }

    enter(name: string, time?: number) {
      this._depth++;
      var kind = this._getKindId(name);
      this._marks.write(TimelineBuffer.ENTER | kind);
      this._times.write(time || performance.now());
      this._stack.push(kind);
    }

    leave(name?: string, time?: number) {
      var kind = this._stack.pop();
      if (name) {
        kind = this._getKindId(name);
      }
      this._marks.write(TimelineBuffer.LEAVE | kind);
      this._times.write(time || performance.now());
      this._depth--;
    }

    /**
     * Constructs an easier to work with TimelineFrame data structure.
     */
    createSnapshot(count: number = Number.MAX_VALUE): TimelineBufferSnapshot {
      var times = this._times;
      var kinds = this._kinds;
      var snapshot = new TimelineBufferSnapshot(this.name);
      var stack: TimelineFrame [] = [snapshot];
      var topLevelFrameCount = 0;

      this._marks.forEachInReverse(function (mark, i) {
        var kind = kinds[mark & 0xFFFF];
        if (kind.visible) {
          var action = mark & 0xFFFF0000;
          var time = times.get(i);
          var stackLength = stack.length;
          if (action === TimelineBuffer.LEAVE) {
            if (stackLength === 1) {
              topLevelFrameCount++;
              if (topLevelFrameCount > count) {
                return true;
              }
            }
            stack.push(new TimelineFrame(stack[stackLength - 1], kind, NaN, time));
          } else if (action === TimelineBuffer.ENTER) {
            var node = stack.pop();
            var top = stack[stack.length - 1];
            if (!top.children) {
              top.children = [node];
            } else {
              top.children.unshift(node);
            }
            var currentDepth = stack.length;
            node.depth = currentDepth;
            node.startTime = time;
            while (node) {
              if (node.maxDepth < currentDepth) {
                node.maxDepth = currentDepth;
                node = node.parent;
              } else {
                break;
              }
            }
          }
        }
      });
      if (snapshot.children && snapshot.children.length) {
        snapshot.startTime = snapshot.children[0].startTime;
        snapshot.endTime = snapshot.children[snapshot.children.length - 1].endTime;
      }
      return snapshot;
    }

    reset() {
      this._depth = 0;
      this._marks.reset();
      this._times.reset();
    }

    static FromFirefoxProfile(profile) {
      var samples = profile.profile.threads[0].samples;
      var buffer = new TimelineBuffer();
      var startTime = samples[0].time;
      var currentStack = [];
      var sample;
      for (var i = 0; i < samples.length; i++) {
        sample = samples[i];
        var time = (sample.time - startTime) || 0.000000001;
        var stack = sample.frames;
        var j = 0;
        var minStackLen = Math.min(stack.length, currentStack.length);
        while (j < minStackLen && stack[j].location === currentStack[j].location) {
          j++;
        }
        var leaveCount = currentStack.length - j;
        for (var k = 0; k < leaveCount; k++) {
          sample = currentStack.pop();
          buffer.leave(sample.location, time);
        }
        while (j < stack.length) {
          sample = stack[j++];
          buffer.enter(sample.location, time);
        }
        currentStack = stack;
      }
      while (sample = currentStack.pop()) {
        buffer.leave(sample.location, time);
      }
      return buffer;
    }

    static FromChromeProfile(profile) {
      var buffer = new TimelineBuffer();
      var timestamps = profile.timestamps;
      var samples = profile.samples;
      var startTime = timestamps[0] / 1000;
      var currentStack = [];
      var idMap = {};
      var sample;
      TimelineBuffer._resolveIds(profile.head, idMap);
      for (var i = 0; i < timestamps.length; i++) {
        var time = (timestamps[i] / 1000 - startTime) || 0.000000001;
        var stack = [];
        sample = idMap[samples[i]];
        while (sample) {
          stack.unshift(sample);
          sample = sample.parent;
        }
        var j = 0;
        var minStackLen = Math.min(stack.length, currentStack.length);
        while (j < minStackLen && stack[j] === currentStack[j]) {
          j++;
        }
        var leaveCount = currentStack.length - j;
        for (var k = 0; k < leaveCount; k++) {
          sample = currentStack.pop();
          buffer.leave(sample.functionName, time);
        }
        while (j < stack.length) {
          sample = stack[j++];
          buffer.enter(sample.functionName, time);
        }
        currentStack = stack;
      }
      while (sample = currentStack.pop()) {
        buffer.leave(sample.functionName, time);
      }
      return buffer;
    }

    private static _resolveIds(parent, idMap) {
      idMap[parent.id] = parent;
      if (parent.children) {
        for (var i = 0; i < parent.children.length; i++) {
          parent.children[i].parent = parent;
          TimelineBuffer._resolveIds(parent.children[i], idMap);
        }
      }
    }
  }

}
