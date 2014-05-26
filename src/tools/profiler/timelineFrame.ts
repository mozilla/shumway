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

  /**
   * Represents a single timeline frame range and makes it easier to work with the compacted
   * timeline buffer data.
   */
  export class TimelineFrame {
    public children: TimelineFrame [];
    public total: number;
    constructor (
      public parent: TimelineFrame,
      public kind: TimelineItemKind,
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
     */
    public getChildRange(startTime: number, endTime: number): number [] {
      if (!this.children || startTime > this.endTime || endTime < this.startTime || endTime < startTime) {
        return null;
      } else {
        var startIdx = this._getNearestChild(startTime);
        var endIdx = this._getNearestChildReverse(endTime);
        return (startIdx <= endIdx) ? [startIdx, endIdx] : null;
      }
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
  }

}
