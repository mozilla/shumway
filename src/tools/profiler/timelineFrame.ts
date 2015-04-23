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

  export interface TimelineFrameRange {
    startIndex: number;
    endIndex: number;
    startTime: number;
    endTime: number;
    totalTime: number;
  }

  export class TimelineFrameStatistics {
    count: number = 0;
    selfTime: number = 0;
    totalTime: number = 0;
    constructor(public kind: TimelineItemKind) {

    }
  }

  /**
   * Represents a single timeline frame range and makes it easier to work with the compacted
   * timeline buffer data.
   */
  export class TimelineFrame {
    public statistics: TimelineFrameStatistics [];
    public children: TimelineFrame [];
    public total: number;
    public maxDepth: number;
    public depth: number;
    constructor (
      public parent: TimelineFrame,
      public kind: TimelineItemKind,
      public startData: any,
      public endData: any,
      public startTime: number,
      public endTime: number) {
        this.maxDepth = 0;
    }

    get totalTime(): number {
      return this.endTime - this.startTime;
    }

    get selfTime(): number {
      var selfTime = this.totalTime;
      if (this.children) {
        for (var i = 0, n = this.children.length; i < n; i++) {
          var child = this.children[i];
          selfTime -= (child.endTime - child.startTime);
        }
      }
      return selfTime;
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
     */
    public getChildRange(startTime: number, endTime: number): TimelineFrameRange {
      if (this.children && startTime <= this.endTime && endTime >= this.startTime && endTime >= startTime) {
        var startIdx = this._getNearestChild(startTime);
        var endIdx = this._getNearestChildReverse(endTime);
        if (startIdx <= endIdx) {
          var startTime = this.children[startIdx].startTime;
          var endTime = this.children[endIdx].endTime;
          return {
            startIndex: startIdx,
            endIndex: endIdx,
            startTime: startTime,
            endTime: endTime,
            totalTime: endTime - startTime
          };
        }
      }
      return null;
    }

    private _getNearestChild(time: number): number {
      var children = this.children;
      if (children && children.length) {
        if (time <= children[0].endTime) {
          return 0;
        }
        var imid;
        var imin = 0;
        var imax = children.length - 1;
        while (imax > imin) {
          imid = ((imin + imax) / 2) | 0;
          var child = children[imid];
          if (time >= child.startTime && time <= child.endTime) {
            return imid;
          } else if (time > child.endTime) {
            imin = imid + 1;
          } else {
            imax = imid;
          }
        }
        return Math.ceil((imin + imax) / 2);
      } else {
        return 0;
      }
    }

    private _getNearestChildReverse(time: number): number {
      var children = this.children;
      if (children && children.length) {
        var imax = children.length - 1;
        if (time >= children[imax].startTime) {
          return imax;
        }
        var imid;
        var imin = 0;
        while (imax > imin) {
          imid = Math.ceil((imin + imax) / 2);
          var child = children[imid];
          if (time >= child.startTime && time <= child.endTime) {
            return imid;
          } else if (time > child.endTime) {
            imin = imid;
          } else {
            imax = imid - 1;
          }
        }
        return ((imin + imax) / 2) | 0;
      } else {
        return 0;
      }
    }

    /**
     * Finds the deepest child that intersects with the specified time.
     */
    public query(time: number): TimelineFrame {
      if (time < this.startTime || time > this.endTime) {
        return null;
      }
      var children = this.children;
      if (children && children.length > 0) {
        var child: TimelineFrame;
        var imin = 0;
        var imax = children.length - 1;
        while (imax > imin) {
          var imid = ((imin + imax) / 2) | 0;
          child = children[imid];
          if (time >= child.startTime && time <= child.endTime) {
            return child.query(time);
          } else if (time > child.endTime) {
            imin = imid + 1;
          } else {
            imax = imid;
          }
        }
        child = children[imax];
        if (time >= child.startTime && time <= child.endTime) {
          return child.query(time);
        }
      }
      return this;
    }

    /**
     * When querying a series of samples, if the deepest child for the previous time is known,
     * it is faster to go up the tree from there, until a frame is found that contains the next time,
     * and then go back down.
     *
     * More often than not we don't have to start at the very top.
     */
    public queryNext(time: number): TimelineFrame {
      var frame = this;
      while (time > frame.endTime) {
        if (frame.parent) {
          frame = frame.parent;
        } else {
          return frame.query(time);
        }
      }
      return frame.query(time);
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

    public calculateStatistics() {
      var statistics = this.statistics = [];
      function visit(frame: TimelineFrame) {
        if (frame.kind) {
          var s = statistics[frame.kind.id] || (statistics[frame.kind.id] = new TimelineFrameStatistics(frame.kind));
          s.count ++;
          s.selfTime += frame.selfTime;
          s.totalTime += frame.totalTime;
        }
        if (frame.children) {
          frame.children.forEach(visit);
        }
      }
      visit(this);
    }

    public trace(writer: IndentingWriter) {
      var s = (this.kind ? this.kind.name + ": " : "Profile: ") +
              (this.endTime - this.startTime).toFixed(2);
      if (this.children && this.children.length) {
        writer.enter(s);
        for (var i = 0; i < this.children.length; i++) {
          this.children[i].trace(writer);
        }
        writer.outdent();
      } else {
        writer.writeLn(s);
      }
    }
  }

  export class TimelineBufferSnapshot extends TimelineFrame {
    constructor (public name: string) {
      super(null, null, null, null, NaN, NaN);
    }
  }

}
