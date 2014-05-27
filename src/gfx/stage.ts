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

  export enum BlendMode {
    Normal     = 1,
    Layer      = 2,
    Multiply   = 3,
    Screen     = 4,
    Lighten    = 5,
    Darken     = 6,
    Difference = 7,
    Add        = 8,
    Subtract   = 9,
    Invert     = 10,
    Alpha      = 11,
    Erase      = 12,
    Overlay    = 13,
    HardLight  = 14
  }

  /**
   * Controls how the visitor walks the display tree.
   */
  export enum VisitorFlags {
    None         = 0,

    /**
     * Continue with normal traversal.
     */
    Continue     = 0,

    /**
     * Not used yet, should probably just stop the visitor.
     */
    Stop         = 1,

    /**
     * Skip processing current frame.
     */
    Skip         = 2,

    /**
     * Only visit visible frames.
     */
    VisibleOnly  = 4,

    /**
     * Visit front to back.
     */
    FrontToBack  = 8
  }

  function getRandomIntInclusive(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  export class StageRendererOptions {
    debug: boolean = false;
    disable: boolean = false;
    forcePaint: boolean = false;
    paintBounds: boolean = false;
    paintFlashing: boolean = false;
    paintViewport: boolean = false;
  }

  export enum Backend {
    Canvas2D = 0,
    WebGL = 1,
    DOM = 2,
    SVG = 3
  }

  export class StageRenderer {
    _canvas: HTMLCanvasElement;
    _stage: Stage;
    constructor(canvas: HTMLCanvasElement, stage: Stage) {
      this._canvas = canvas;
      this._stage = stage;
    }
    public render() {

    }
  }

  export class Stage extends FrameContainer {
    public trackDirtyRegions: boolean;
    public dirtyRegion: DirtyRegion;
    public w: number;
    public h: number;

    constructor(w: number, h: number, trackDirtyRegions: boolean = false) {
      super();
      this.w = w;
      this.h = h;
      this.dirtyRegion = new DirtyRegion(w, h);
      this.trackDirtyRegions = trackDirtyRegions;
      this._setFlags(FrameFlags.Dirty);
    }

    gatherMarkedDirtyRegions(transform: Matrix) {
      var self = this;
      // Find all invalid frames.
      this.visit(function (frame: Frame, transform?: Matrix, flags?: FrameFlags): VisitorFlags {
        frame._removeFlags(FrameFlags.Dirty);
        if (frame instanceof FrameContainer) {
          return VisitorFlags.Continue;
        }
        if (flags & FrameFlags.Dirty) {
          var rectangle = frame.getBounds().clone();
          transform.transformRectangleAABB(rectangle);
          self.dirtyRegion.addDirtyRectangle(rectangle);
          if (frame._previouslyRenderedAABB) {
            // Add last render position to dirty list.
            self.dirtyRegion.addDirtyRectangle(frame._previouslyRenderedAABB);
          }
        }
        return VisitorFlags.Continue;
      }, transform, FrameFlags.Empty);
    }

    gatherFrames() {
      var frames = [];
      this.visit(function (frame: Frame, transform?: Matrix): VisitorFlags {
        if (!(frame instanceof FrameContainer)) {
          frames.push(frame);
        }
        return VisitorFlags.Continue;
      }, this.matrix);
      return frames;
    }

    gatherLayers() {
      var layers = [];
      var currentLayer;
      this.visit(function (frame: Frame, transform?: Matrix): VisitorFlags {
        if (frame instanceof FrameContainer) {
          return VisitorFlags.Continue;
        }
        var rectangle = frame.getBounds().clone();
        transform.transformRectangleAABB(rectangle);
        if (frame._hasFlags(FrameFlags.Dirty)) {
          if (currentLayer) {
            layers.push(currentLayer);
          }
          layers.push(rectangle.clone());
          currentLayer = null;
        } else {
          if (!currentLayer) {
            currentLayer = rectangle.clone();
          } else {
            currentLayer.union(rectangle);
          }
        }
        return VisitorFlags.Continue;
      }, this.matrix);

      if (currentLayer) {
        layers.push(currentLayer);
      }

      return layers;
    }
  }

  export class SolidRectangle extends Frame {
    fillStyle: string = randomStyle();
    constructor() {
      super();
    }
  }

  export class Shape extends Frame {
    source: IRenderable;

    constructor(source: IRenderable) {
      super();
      this.source = source;
    }

    public getBounds(): Rectangle {
      return this.source.getBounds();
    }
  }
}
