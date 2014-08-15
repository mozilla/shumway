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

module Shumway.GFX {
  import Rectangle = Geometry.Rectangle;
  import Point = Geometry.Point;
  import Matrix = Geometry.Matrix;
  import DirtyRegion = Geometry.DirtyRegion;
  import Filter = Shumway.GFX.Filter;
  import TileCache = Geometry.TileCache;
  import Tile = Geometry.Tile;
  import OBB = Geometry.OBB;

  import assert = Shumway.Debug.assert;

  export class FrameContainer extends Frame {
    _children: Frame [];
    _bounds: Rectangle;
    constructor() {
      super();
      this._children = [];
    }

    public addChild(child: Frame): Frame {
      this.checkCapability(FrameCapabilityFlags.AllowChildrenWrite);
      if (child) {
        child._parent = this;
        child._invalidatePosition();
      }
      this._children.push(child);
      return child;
    }

    public addChildAt(child: Frame, index: number): Frame {
      this.checkCapability(FrameCapabilityFlags.AllowChildrenWrite);
      release || assert(index >= 0 && index <= this._children.length);
      if (index === this._children.length) {
        this._children.push(child);
      } else {
        this._children.splice(index, 0, child);
      }
      if (child) {
        child._parent = this;
        child._invalidatePosition();
      }
      return child;
    }

    public removeChild(child: Frame) {
      this.checkCapability(FrameCapabilityFlags.AllowChildrenWrite);
      if (child._parent === this) {
        var index = this._children.indexOf(child);
        this.removeChildAt(index);
      }
    }

    public removeChildAt(index: number) {
      this.checkCapability(FrameCapabilityFlags.AllowChildrenWrite);
      release || assert(index >= 0 && index < this._children.length);
      var result = this._children.splice(index, 1);
      var child = result[0];
      if (!child) {
        return;
      }
      child._parent = undefined;
      child._invalidatePosition();
    }

    public clearChildren() {
      this.checkCapability(FrameCapabilityFlags.AllowChildrenWrite);
      for (var i = 0; i < this._children.length; i++) {
        var child = this._children[i];
        if (child) {
          child._invalidatePosition();
          // child.gatherPreviousDirtyRegions();
        }
      }
      this._children.length = 0;
    }

    /**
     * Propagates flags down the frame tree. Propagation stops if all flags are already set.
     */
    _propagateFlagsDown(flags: FrameFlags) {
      if (this._hasFlags(flags)) {
        return;
      }
      this._setFlags(flags);
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        children[i]._propagateFlagsDown(flags);
      }
    }

    public getBounds(): Rectangle {
      if (!this._hasFlags(FrameFlags.InvalidBounds)) {
        return this._bounds;
      }
      var bounds = Rectangle.createEmpty();
      for (var i = 0; i < this._children.length; i++) {
        var child = this._children[i];
        var childBounds = child.getBounds().clone();
        child.matrix.transformRectangleAABB(childBounds);
        bounds.union(childBounds);
      }
      this._bounds = bounds;
      this._removeFlags(FrameFlags.InvalidBounds);
      return bounds;
    }

    /**
     * Returns an array that marks leave clip events.
     *
     * i:  0  1  2  3  4  5  6  7  8  9
     * A:  ---[--------------------]---
     * B:  ------[-----------------]---
     * C:  ---------[-----------]------
     * D:  ---------------|------------
     *
     * In this example, frame A is at index 1 and has a clip value of 7 meaning it clips the next 7 frames in its container, frame B
     * at index 2 has a clip value of 6 and frame C at index 3 has a clip value of 4. The frame visitor needs to know when clips end
     * and start so here we collect all clip leave events. Clip start events are easier to identify, just check the clip value. Also
     * no more than one clip region starts at a given index, this is not true of clip ends.
     *
     * Here we return the sparse array: [8: [A, B], 7: [C], 5: [D]].
     */
    public gatherLeaveClipEvents(): Frame [][] {
      var length = this._children.length;
      var leaveClip = null;
      for (var i = 0; i < length; i++) {
        var child = this._children[i];
        if (child.clip >= 0) {
          var clipLeaveIndex = i + child.clip;
          leaveClip = leaveClip || [];
          if (!leaveClip[clipLeaveIndex]) {
            leaveClip[clipLeaveIndex] = [];
          }
          leaveClip[clipLeaveIndex].push(child);
        }
      }
      return leaveClip;
    }
  }
}
