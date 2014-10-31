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

  import StageAlignFlags = Shumway.Remoting.StageAlignFlags;
  import StageScaleModeId = Shumway.Remoting.StageScaleModeId;

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
     * Visit front to back.
     */
    FrontToBack  = 8,

    /**
     * Visit clip leave events.
     */
    Clips        = 16
  }

  function getRandomIntInclusive(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  export class StageRendererOptions {
    debug: boolean = false;
    paintRenderable: boolean = true;
    paintBounds: boolean = false;
    paintFlashing: boolean = false;
    paintViewport: boolean = false;
  }

  export enum Backend {
    Canvas2D = 0,
    WebGL = 1,
    Both = 2,
    DOM = 3,
    SVG = 4
  }

  export class StageRenderer {
    _viewport: Rectangle;
    _options: StageRendererOptions;
    _canvas: HTMLCanvasElement;
    _stage: Stage;
    _devicePixelRatio: number;

    constructor(canvas: HTMLCanvasElement, stage: Stage, options: StageRendererOptions) {
      this._canvas = canvas;
      this._stage = stage;
      this._options = options;
      this._viewport = Rectangle.createSquare(1024);
      this._devicePixelRatio = 1;
    }

    set viewport (viewport: Rectangle) {
      this._viewport.set(viewport);
    }

    public render() {

    }

    /**
     * Notify renderer that the viewport has changed.
     */
    public resize() {

    }
  }

  export class Stage extends FrameContainer {
    public trackDirtyRegions: boolean;
    public dirtyRegion: DirtyRegion;

    public w: number;
    public h: number;
    public pixelRatio: number;
    public scaleMode: StageScaleModeId;
    public align: StageAlignFlags;
    public targetWidth: number;
    public targetHeight: number;

    // Using these constants initially -- they don't require knowing bounds.
    // Notice that this default values are different from ActionScript object values.
    private static DEFAULT_SCALE = StageScaleModeId.NoScale;
    private static DEFAULT_ALIGN = StageAlignFlags.Left | StageAlignFlags.Top;

    constructor(w: number, h: number, trackDirtyRegions: boolean = false) {
      super();
      this.w = w;
      this.h = h;
      this.pixelRatio = 1.0;
      this.scaleMode = Stage.DEFAULT_SCALE;
      this.align = Stage.DEFAULT_ALIGN;
      this.targetWidth = 0;
      this.targetHeight = 0;
      this._updateMatrix();

      this.dirtyRegion = new DirtyRegion(w, h);
      this.trackDirtyRegions = trackDirtyRegions;
      this._setFlags(FrameFlags.Dirty);
    }

    /**
     * Checks to see if we should render and if so, clears any relevant dirty flags. Returns
     * true if rendering should commence. Flag clearing is made optional here in case there
     * is any code that needs to check if rendering is about to happen.
     */
    readyToRender(clearFlags = true): boolean {
      if (!this._hasFlags(FrameFlags.InvalidPaint)) {
        return false;
      } else if (clearFlags) {
        enterTimeline("readyToRender");
        this.visit(function (frame: Frame): VisitorFlags {
          if (frame._hasFlags(FrameFlags.InvalidPaint)) {
            frame._toggleFlags(FrameFlags.InvalidPaint, false);
            return VisitorFlags.Continue;
          } else {
            return VisitorFlags.Skip;
          }
        });
        leaveTimeline();
      }
      return true;
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

    setSizeAndPixelRatio(w: number, h: number, ratio: number) {
      if (this.w !== w || this.h !== h || this.pixelRatio !== ratio) {
        this.w = w;
        this.h = h;
        this.pixelRatio = ratio;
        this._updateMatrix();
      }
    }

    setScaleAndAlign(scaleMode: StageScaleModeId, align: StageAlignFlags, targetWidth: number, targetHeight: number) {
      if (this.scaleMode !== scaleMode || this.align !== align ||
          this.targetWidth !== targetWidth || this.targetHeight !== targetHeight) {
        this.scaleMode = scaleMode;
        this.align = align;
        this.targetWidth = targetWidth;
        this.targetHeight = targetHeight;
        this._updateMatrix();
      }
    }

    private _updateMatrix() {
      if (this.scaleMode === Stage.DEFAULT_SCALE && this.align === Stage.DEFAULT_ALIGN) {
        // Shortcut and also guard to avoid using targetWidth/targetHeight.
        // ThetargetWidth/targetHeight normally set in setScaleAndAlign call.
        this.matrix.set(new Matrix(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0));
        return;
      }

      Debug.assert(this.targetWidth > 0 && this.targetHeight > 0);
      var widthScale = this.w / this.targetWidth;
      var heightScale = this.h / this.targetHeight;
      var scaleX, scaleY;
      switch (this.scaleMode) {
        case StageScaleModeId.NoBorder:
          scaleX = scaleY = Math.max(widthScale, heightScale);
          break;
        case StageScaleModeId.NoScale:
          scaleX = scaleY = this.pixelRatio;
          break;
        case StageScaleModeId.ExactFit:
          scaleX = widthScale;
          scaleY = heightScale;
          break;
        // case StageScaleModeId.ShowAll:
        default:
          scaleX = scaleY = Math.min(widthScale, heightScale);
          break;
      }

      var offsetX;
      if ((this.align & StageAlignFlags.Left)) {
        offsetX = 0;
      } else if ((this.align & StageAlignFlags.Right)) {
        offsetX = this.w - this.targetWidth * scaleX;
      } else {
        offsetX = (this.w - this.targetWidth * scaleX) / 2;
      }

      var offsetY;
      if ((this.align & StageAlignFlags.Top)) {
        offsetY = 0;
      } else if ((this.align & StageAlignFlags.Bottom)) {
        offsetY = this.h - this.targetHeight * scaleY;
      } else {
        offsetY = (this.h - this.targetHeight * scaleY) / 2;
      }

      this.matrix.set(new Matrix(scaleX, 0, 0, scaleY, offsetX, offsetY));
    }
  }

  /**
   * A frame container that clips everything outside of its bounds.
   */
  export class ClipRectangle extends FrameContainer {
    color: Color = Color.None;
    constructor(w: number, h: number) {
      super();
      this._bounds = new Rectangle(0, 0, w, h);
    }

    public setBounds(bounds: Rectangle) {
      this._bounds.set(bounds);
    }

    public getBounds(): Rectangle {
      return this._bounds;
    }
  }

  export class Shape extends Frame {
    private _source: Renderable;
    ratio: number;

    get source(): Renderable {
      return this._source;
    }

    constructor(source: Renderable) {
      super();
      release || assert(source);
      this._source = source;
      this.ratio = 0;
    }

    public getBounds(): Rectangle {
      return this.source.getBounds();
    }
  }
}
