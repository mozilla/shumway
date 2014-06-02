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
module Shumway.Remoting.GFX {
  import Frame = Shumway.GFX.Frame;
  import Shape = Shumway.GFX.Shape;
  import Renderable = Shumway.GFX.Renderable;
  import RenderableShape = Shumway.GFX.RenderableShape;
  import RenderableBitmap = Shumway.GFX.RenderableBitmap;
  import ColorMatrix = Shumway.GFX.ColorMatrix;
  import FrameContainer = Shumway.GFX.FrameContainer;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import Stage = Shumway.GFX.Stage;
  import Canvas2DStageRenderer = Shumway.GFX.Canvas2DStageRenderer;

  import Point = Shumway.GFX.Geometry.Point;
  import Matrix = Shumway.GFX.Geometry.Matrix;
  import Rectangle = Shumway.GFX.Geometry.Rectangle;

  import IDataInput = Shumway.ArrayUtilities.IDataInput;
  import IDataOutput = Shumway.ArrayUtilities.IDataOutput;

  export class GFXChannelSerializer {
    output: IDataOutput;

    public writeMouseEvent(event: MouseEvent, point: Point) {
      var output = this.output;
      output.writeInt(MessageTag.MouseEvent);
      var typeId = Shumway.Remoting.MouseEventNames.indexOf(event.type);
      output.writeInt(typeId);
      output.writeFloat(point.x);
      output.writeFloat(point.y);
      output.writeInt(event.buttons);
      var flags =
        (event.ctrlKey ? KeyboardEventFlags.CtrlKey : 0) |
        (event.altKey ? KeyboardEventFlags.AltKey : 0) |
        (event.shiftKey ? KeyboardEventFlags.ShiftKey : 0);
      output.writeInt(flags);
    }

    public writeKeyboardEvent(event: KeyboardEvent) {
      var output = this.output;
      output.writeInt(MessageTag.KeyboardEvent);
      var typeId = Shumway.Remoting.KeyboardEventNames.indexOf(event.type);
      output.writeInt(typeId);
      output.writeInt(event.keyCode);
      output.writeInt(event.charCode);
      output.writeInt(event.location);
      var flags =
        (event.ctrlKey ? KeyboardEventFlags.CtrlKey : 0) |
        (event.altKey ? KeyboardEventFlags.AltKey : 0) |
        (event.shiftKey ? KeyboardEventFlags.ShiftKey : 0);
      output.writeInt(flags);
    }
  }

  export class GFXChannelDeserializerContext {
    root: FrameContainer;
    _frames: Frame [];
    _assets: Renderable [];

    constructor(root: FrameContainer) {
      this.root = root;
      this._frames = [];
      this._assets = [];
    }

    _makeFrame(id: number): Frame {
      if (id & IDMask.Asset) {
        id &= ~IDMask.Asset;
        return new Shape(this._assets[id]);
      } else {
        return this._frames[id];
      }
    }
  }

  export class GFXChannelDeserializer {
    input: IDataInput;
    inputAssets: Array<DataBuffer>;
    context: GFXChannelDeserializerContext;

    public read() {
      var tag = 0;
      var input = this.input;

      enterPlayerTimeline("GFXChannelDeserializer.read");
      while (input.bytesAvailable > 0) {
        tag = input.readInt();
        switch (tag) {
          case MessageTag.EOF:
            leavePlayerTimeline("GFXChannelDeserializer.read");
            return;
          case MessageTag.UpdateGraphics:
            this._readUpdateGraphics();
            break;
          case MessageTag.UpdateBitmapData:
            this._readUpdateBitmapData();
            break;
          case MessageTag.UpdateFrame:
            this._readUpdateFrame();
            break;
          case MessageTag.BitmapDataDraw:
            this._readBitmapDataDraw();
            break;
          default:
            assert(false, 'Unknown MessageReader tag: ' + tag);
            break;
        }
      }
      leavePlayerTimeline("GFXChannelDeserializer.read");
    }

    private _readMatrix(): Matrix {
      var input = this.input;
      return new Matrix (
        input.readFloat(),
        input.readFloat(),
        input.readFloat(),
        input.readFloat(),
        input.readFloat() / 20,
        input.readFloat() / 20
      );
    }

    private _readRectangle(): Rectangle {
      var input = this.input;
      return new Rectangle (
        input.readInt() / 20,
        input.readInt() / 20,
        input.readInt() / 20,
        input.readInt() / 20
      );
    }

    private _readColorMatrix(): ColorMatrix {
      var input = this.input;
      var rm = 1, gm = 1, bm = 1, am = 1;
      var ro = 0, go = 0, bo = 0, ao = 0;
      switch (input.readInt()) {
        case ColorTransformEncoding.Identity:
          break;
        case ColorTransformEncoding.AlphaMultiplierOnly:
          am = input.readFloat();
          break;
        case ColorTransformEncoding.All:
          rm = input.readFloat();
          gm = input.readFloat();
          bm = input.readFloat();
          am = input.readFloat();
          ro = input.readInt();
          go = input.readInt();
          bo = input.readInt();
          ao = input.readInt();
          break;
      }
      return ColorMatrix.fromMultipliersAndOffsets (
        rm, gm, bm, am,
        ro, go, bo, ao
      );
    }

    private _readUpdateGraphics() {
      var input = this.input;
      var context = this.context;
      var id = input.readInt();
      var asset = context._assets[id];
      var bounds = this._readRectangle();
      var assetId = input.readInt();
      var pathData = this.inputAssets[assetId];
      this.inputAssets[assetId] = null;
      var numTextures = input.readInt();
      var textures = [];
      for (var i = 0; i < numTextures; i++) {
        var bitmapId = input.readInt();
        textures.push(context._assets[bitmapId]);
      }
      if (!asset) {
        context._assets[id] = new RenderableShape(pathData, textures, bounds);
      }
    }

    private _readUpdateBitmapData() {
      var input = this.input;
      var context = this.context;
      var id = input.readInt();
      var asset = context._assets[id];
      var bounds = this._readRectangle();
      var type: ImageType = input.readInt();
      var assetId = input.readInt();
      var dataBuffer = this.inputAssets[assetId];
      this.inputAssets[assetId] = null;
      if (!asset) {
        context._assets[id] = RenderableBitmap.FromDataBuffer(type, dataBuffer, bounds);
      } else {
        var renderableBitmap = <RenderableBitmap>context._assets[id];
        renderableBitmap.updateFromDataBuffer(type, dataBuffer);
      }
    }

    private _readUpdateFrame() {
      var input = this.input;
      var context = this.context;
      var id = input.readInt();
      var firstFrame = context._frames.length === 0;
      var frame = context._frames[id];
      if (!frame) {
        frame = context._frames[id] = new FrameContainer();
      }
      if (firstFrame) {
        context.root.addChild(frame);
      }
      var hasBits = input.readInt();
      if (hasBits & MessageBits.HasMatrix) {
        frame.matrix = this._readMatrix();
      }
      if (hasBits & MessageBits.HasColorTransform) {
        frame.colorMatrix = this._readColorMatrix();
      }
      if (hasBits & MessageBits.HasMiscellaneousProperties) {
        input.readInt();
        // frame.blendMode = input.readInt();
        // TODO: Should make a proper flag for this.
        input.readBoolean(); // Visibility
        // frame.alpha = input.readBoolean() ? 1 : 0;
      }
      if (hasBits & MessageBits.HasChildren) {
        var count = input.readInt();
        var container = <FrameContainer>frame;
        container.clearChildren();
        for (var i = 0; i < count; i++) {
          var childId = input.readInt();
          var child = context._makeFrame(childId);
          assert (child);
          container.addChild(child);
        }
      }
    }

    private _readBitmapDataDraw() {
      var input = this.input;
      var context = this.context;
      var bitmapDataId = input.readInt();
      var sourceId = input.readInt();
      var hasBits = input.readInt();
      var matrix;
      var colorMatrix;
      var clipRect;
      if (hasBits & MessageBits.HasMatrix) {
        matrix = this._readMatrix();
      }
      if (hasBits & MessageBits.HasColorTransform) {
        colorMatrix = this._readColorMatrix();
      }
      if (hasBits & MessageBits.HasScrollRect) {
        clipRect = this._readRectangle();
      }
      var blendMode = input.readInt();
      input.readBoolean(); // Smoothing
      var target = context._assets[bitmapDataId];
      var source = context._frames[sourceId];
      var bitmap = this._cacheAsBitmap(source);
      var ctx = (<RenderableBitmap>target).getContext();
      ctx.drawImage(bitmap._canvas, 0, 0);
    }

    private _cacheAsBitmap(source: Frame): RenderableBitmap {
      var canvas = document.createElement('canvas');
      var bounds = source.getBounds();
      canvas.width = bounds.w;
      canvas.height = bounds.h;
      var stage = new Stage(bounds.w, bounds.h);
      stage._children[0] = source;
      var renderer = new Canvas2DStageRenderer(canvas, stage);
      renderer.render();
      return new RenderableBitmap(canvas, bounds);
    }
  }
}
