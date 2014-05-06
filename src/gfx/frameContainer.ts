/// <reference path='references.ts'/>
module Shumway.GFX {
  import Rectangle = Geometry.Rectangle;
  import Point = Geometry.Point;
  import Matrix = Geometry.Matrix;
  import DirtyRegion = Geometry.DirtyRegion;
  import Filter = Shumway.GFX.Filter;
  import TileCache = Geometry.TileCache;
  import Tile = Geometry.Tile;
  import OBB = Geometry.OBB;

  export class FrameContainer extends Frame {
    _children: Frame [];
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
      assert(index >= 0 && index <= this._children.length);
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
        this.removeChildAt(index)
      }
    }

    public removeChildAt(index: number) {
      this.checkCapability(FrameCapabilityFlags.AllowChildrenWrite);
      assert(index >= 0 && index < this._children.length);
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
          // child.gatherPreviousDirtyRegions();
        }
      }
      this._children.length = 0;
    }

    public getBounds(): Rectangle {
      var bounds = Rectangle.createEmpty();
      for (var i = 0; i < this._children.length; i++) {
        var child = this._children[i];
        var childBounds = child.getBounds().clone();
        child.matrix.transformRectangleAABB(childBounds);
        bounds.union(childBounds);
      }
      return bounds;
    }
  }
}