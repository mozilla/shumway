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

  /**
   * Records enter / leave events in two circular buffers.
   * The goal here is to be able to handle large amounts of data.
   */
  export class TimelineBuffer {
    static ENTER = 0xBEEF0000 | 0;
    static LEAVE = 0xDEAD0000 | 0;

    private _depth:number;
    private _kindCount:number;
    public marks:Shumway.CircularBuffer;
    public times:Shumway.CircularBuffer;
    public kinds:Shumway.Map<number>;
    public kindNames:Shumway.Map<string>;

    constructor() {
      this.marks = new Shumway.CircularBuffer(Int32Array, 20);
      this.times = new Shumway.CircularBuffer(Float64Array, 20);
      this.kinds = createEmptyObject();
      this.kindNames = createEmptyObject();
      this._depth = 0;
      this._kindCount = 0;
    }

    getKindName(kind:number):string {
      return this.kindNames[kind];
    }

    getKind(name:string):number {
      if (this.kinds[name] === undefined) {
        var kind = this._kindCount++;
        this.kinds[name] = kind;
        this.kindNames[kind] = name;
      }
      return this.kinds[name];
    }

    enter(name:string, time?:number) {
      this._depth++;
      this.marks.write(TimelineBuffer.ENTER | this.getKind(name));
      this.times.write(time || performance.now());
    }

    leave(name:string, time?:number) {
      this.marks.write(TimelineBuffer.LEAVE | this.getKind(name));
      this.times.write(time || performance.now());
      this._depth--;
    }

    /**
     * Constructs an easier to work with TimelineFrame data structure.
     */
    gatherRange(count:number):TimelineFrame {
      var range = new TimelineFrame(null, 0, NaN, NaN);
      var stack:TimelineFrame [] = [range];
      var times = this.times;
      var topLevelFrameCount = 0;
      this.marks.forEachInReverse(function (mark, i) {
        var time = times.get(i);
        if ((mark & 0xFFFF0000) === TimelineBuffer.LEAVE) {
          if (stack.length === 1) {
            topLevelFrameCount++;
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

}