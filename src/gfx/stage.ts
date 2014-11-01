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
  import StageScaleMode = Shumway.Remoting.StageScaleMode;

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

  export class StageRenderer extends NodeVisitor {
    protected _viewport: Rectangle;
    protected _options: StageRendererOptions;
    protected _canvas: HTMLCanvasElement;
    protected _stage: Stage;
    protected _devicePixelRatio: number;

    constructor(canvas: HTMLCanvasElement, stage: Stage, options: StageRendererOptions) {
      super();
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

  export class Stage extends Group {
    public trackDirtyRegions: boolean;
    public dirtyRegion: DirtyRegion;

    private _align: StageAlignFlags;
    private _scaleMode: StageScaleMode;
    private _content: Group;

    public color: Color;

    // Using these constants initially -- they don't require knowing bounds.
    // Notice that this default values are different from ActionScript object values.
    private static DEFAULT_SCALE = StageScaleMode.NoScale;
    private static DEFAULT_ALIGN = StageAlignFlags.Left | StageAlignFlags.Top;

    private _dirtyVisitor: DirtyNodeVisitor = new DirtyNodeVisitor();

    constructor(w: number, h: number, trackDirtyRegions: boolean = false) {
      super();
      this._flags &= ~NodeFlags.BoundsAutoCompute;
      this._type = NodeType.Stage;
      this._scaleMode = Stage.DEFAULT_SCALE;
      this._align = Stage.DEFAULT_ALIGN;
      this._content = new Group();
      this._content._flags &= ~NodeFlags.BoundsAutoCompute;
      this.addChild(this._content);
      this.dirtyRegion = new DirtyRegion(w, h);
      this.trackDirtyRegions = trackDirtyRegions;
      this.setFlags(NodeFlags.Dirty);
      this.setBounds(new Rectangle(0, 0, w, h));
      this._updateContentMatrix();
    }

    public setBounds(value: Rectangle) {
      super.setBounds(value);
      this._dispatchEvent(NodeEventType.OnStageBoundsChanged);
    }

    public get content(): Group {
      return this._content;
    }

    /**
     * Checks to see if we should render and if so, clears any relevant dirty flags. Returns
     * true if rendering should commence. Flag clearing is made optional here in case there
     * is any code that needs to check if rendering is about to happen.
     */
    readyToRender(): boolean {
      this._dirtyVisitor.isDirty = false;
      this.visit(this._dirtyVisitor, null);
      if (this._dirtyVisitor.isDirty) {
        return true;
      }
      return false;
    }

    public get align(): StageAlignFlags {
      return this._align;
    }

    public set align(value: StageAlignFlags) {
      this._align = value;
      this._updateContentMatrix();
    }

    public get scaleMode(): StageScaleMode {
      return this._scaleMode;
    }

    public set scaleMode(value: StageScaleMode) {
      this._scaleMode = value;
      this._updateContentMatrix();
    }

    private _updateContentMatrix() {
      if (this._scaleMode === Stage.DEFAULT_SCALE && this._align === Stage.DEFAULT_ALIGN) {
        // Shortcut and also guard to avoid using targetWidth/targetHeight.
        // ThetargetWidth/targetHeight normally set in setScaleAndAlign call.
        this._content.getTransform().setMatrix(new Matrix(1, 0, 0, 1, 0, 0));
        return;
      }

      var bounds = this.getBounds();
      var contentBounds = this._content.getBounds();

      // Debug.assert(this.targetWidth > 0 && this.targetHeight > 0);
      var wScale = bounds.w / contentBounds.w;
      var hScale = bounds.h / contentBounds.h;
      var scaleX, scaleY;
      switch (this._scaleMode) {
        case StageScaleMode.NoBorder:
          scaleX = scaleY = Math.max(wScale, hScale);
          break;
        case StageScaleMode.NoScale:
          scaleX = scaleY = 1;
          break;
        case StageScaleMode.ExactFit:
          scaleX = wScale;
          scaleY = hScale;
          break;
        // case StageScaleMode.ShowAll:
        default:
          scaleX = scaleY = Math.min(wScale, hScale);
          break;
      }

      var offsetX;
      if ((this._align & StageAlignFlags.Left)) {
        offsetX = 0;
      } else if ((this._align & StageAlignFlags.Right)) {
        offsetX = bounds.w - contentBounds.w * scaleX;
      } else {
        offsetX = (bounds.w - contentBounds.w * scaleX) / 2;
      }

      var offsetY;
      if ((this._align & StageAlignFlags.Top)) {
        offsetY = 0;
      } else if ((this._align & StageAlignFlags.Bottom)) {
        offsetY = bounds.h - contentBounds.h * scaleY;
      } else {
        offsetY = (bounds.h - contentBounds.h * scaleY) / 2;
      }

      this._content.getTransform().setMatrix(new Matrix(scaleX, 0, 0, scaleY, offsetX, offsetY));
    }
  }
}
