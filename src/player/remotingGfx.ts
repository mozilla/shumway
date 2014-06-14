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
  import ClipRectangle = Shumway.GFX.ClipRectangle;
  import Shape = Shumway.GFX.Shape;
  import Renderable = Shumway.GFX.Renderable;
  import RenderableShape = Shumway.GFX.RenderableShape;
  import RenderableBitmap = Shumway.GFX.RenderableBitmap;
  import RenderableText = Shumway.GFX.RenderableText;
  import ColorMatrix = Shumway.GFX.ColorMatrix;
  import FrameContainer = Shumway.GFX.FrameContainer;
  import ShapeData = Shumway.ShapeData;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import Stage = Shumway.GFX.Stage;
  import Canvas2DStageRenderer = Shumway.GFX.Canvas2DStageRenderer;
  import Canvas2DStageRendererState = Shumway.GFX.Canvas2DStageRendererState;

  import Smoothing = Shumway.GFX.Smoothing;
  import PixelSnapping = Shumway.GFX.PixelSnapping;

  import Point = Shumway.GFX.Geometry.Point;
  import Matrix = Shumway.GFX.Geometry.Matrix;
  import Rectangle = Shumway.GFX.Geometry.Rectangle;

  import IDataInput = Shumway.ArrayUtilities.IDataInput;
  import IDataOutput = Shumway.ArrayUtilities.IDataOutput;
  import assert = Shumway.Debug.assert;
  var writer = null; // release ? null : new IndentingWriter();

  declare var registerInspectorAsset;

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

    public writeFocusEvent(type: FocusEventType) {
      var output = this.output;
      output.writeInt(MessageTag.FocusEvent);
      output.writeInt(type);
    }
  }

  export class GFXChannelDeserializerContext {
    root: ClipRectangle;
    _frames: Frame [];
    _assets: Renderable [];

    constructor(root: FrameContainer) {
      root.addChild(this.root = new ClipRectangle(1024, 1024));
      this._frames = [];
      this._assets = [];
    }

    _registerAsset(id: number, asset: Renderable) {
      if (typeof registerInspectorAsset !== "undefined") {
        registerInspectorAsset(id, asset);
      }
      this._assets[id] = asset;
    }

    _makeFrame(id: number): Frame {
      if (id === -1) {
        return null;
      }
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
    inputAssets: any[];
    context: GFXChannelDeserializerContext;

    public read() {
      var tag = 0;
      var input = this.input;

      Shumway.GFX.enterTimeline("GFXChannelDeserializer.read");
      while (input.bytesAvailable > 0) {
        tag = input.readInt();
        switch (tag) {
          case MessageTag.EOF:
            Shumway.GFX.leaveTimeline("GFXChannelDeserializer.read");
            return;
          case MessageTag.UpdateGraphics:
            this._readUpdateGraphics();
            break;
          case MessageTag.UpdateBitmapData:
            this._readUpdateBitmapData();
            break;
          case MessageTag.UpdateTextContent:
            this._readUpdateTextContent();
            break;
          case MessageTag.RegisterFont:
            this._readFont();
            break;
          case MessageTag.UpdateFrame:
            this._readUpdateFrame();
            break;
          case MessageTag.UpdateStage:
            this._readUpdateStage();
            break;
          case MessageTag.CacheAsBitmap:
            this._readCacheAsBitmap();
            break;
          default:
            assert(false, 'Unknown MessageReader tag: ' + tag);
            break;
        }
      }
      Shumway.GFX.leaveTimeline("GFXChannelDeserializer.read");
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
      var pathData = ShapeData.FromPlainObject(this.inputAssets[assetId]);
      this.inputAssets[assetId] = null;
      var numTextures = input.readInt();
      var textures = [];
      for (var i = 0; i < numTextures; i++) {
        var bitmapId = input.readInt();
        textures.push(context._assets[bitmapId]);
      }
      if (!asset) {
        context._registerAsset(id, new RenderableShape(id, pathData, textures, bounds));
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
      var dataBuffer = DataBuffer.FromPlainObject(this.inputAssets[assetId]);
      this.inputAssets[assetId] = null;
      if (!asset) {
        context._registerAsset(id, RenderableBitmap.FromDataBuffer(type, dataBuffer, bounds));
      } else {
        var renderableBitmap = <RenderableBitmap>context._assets[id];
        renderableBitmap.updateFromDataBuffer(type, dataBuffer);
      }
    }

    private _readUpdateTextContent() {
      var input = this.input;
      var context = this.context;
      var id = input.readInt();
      var asset = context._assets[id];
      var bounds = this._readRectangle();
      var backgroundColor = input.readInt();
      var borderColor = input.readInt();
      var assetId = input.readInt();
      var numTextRuns = input.readInt();
      var textRunData = new DataBuffer(numTextRuns * 52);
      input.readBytes(textRunData, 0, numTextRuns * 52);
      var plainText = this.inputAssets[assetId];
      this.inputAssets[assetId] = null;
      if (!asset) {
        asset = new RenderableText(plainText, textRunData, bounds, backgroundColor, borderColor);
        context._registerAsset(id, asset);
      } else {
        (<RenderableText>asset).update(plainText, textRunData, bounds, backgroundColor, borderColor);
      }
    }

    private _readUpdateStage() {
      var context = this.context;
      var color = this.input.readInt();
      context.root.color = Color.FromARGB(color);
      context.root.bounds = this._readRectangle();
    }

    private _readFont() {
      var input = this.input;
      var fontId = input.readInt();
      var bold = input.readBoolean();
      var italic = input.readBoolean();
      var assetId = input.readInt();
      var data = this.inputAssets[assetId];

      var head = document.head;
      head.insertBefore(document.createElement('style'), head.firstChild);
      var style = <CSSStyleSheet>document.styleSheets[0];
      style.insertRule(
        '@font-face{' +
          'font-family:swffont' + fontId + ';' +
          'src:url(data:font/opentype;base64,' + Shumway.StringUtilities.base64ArrayBuffer(data.buffer) + ')' +
        '}',
        style.cssRules.length
      );

      this.inputAssets[assetId] = null;
    }

    private _readUpdateFrame() {
      var input = this.input;
      var context = this.context;
      var id = input.readInt();
      writer && writer.writeLn("Receiving UpdateFrame: " + id);
      var firstFrame = context._frames.length === 0;
      var frame = context._frames[id];
      if (!frame) {
        frame = context._frames[id] = firstFrame ? context.root : new FrameContainer();
      }

      var hasBits = input.readInt();
      if (hasBits & MessageBits.HasMatrix) {
        frame.matrix = this._readMatrix();
      }
      if (hasBits & MessageBits.HasColorTransform) {
        frame.colorMatrix = this._readColorMatrix();
      }
      if (hasBits & MessageBits.HasMask) {
        frame.mask = context._makeFrame(input.readInt());
      }
      if (hasBits & MessageBits.HasMiscellaneousProperties) {
        frame.clip = input.readInt();
        input.readInt();
        // frame.blendMode = input.readInt();
        // TODO: Should make a proper flag for this.
        frame.alpha = input.readBoolean() ? 1 : 0;
        frame.pixelSnapping = <PixelSnapping>input.readInt();
        frame.smoothing = <Smoothing>input.readInt();
      }
      if (hasBits & MessageBits.HasChildren) {
        var count = input.readInt();
        var container = <FrameContainer>frame;
        container.clearChildren();
        for (var i = 0; i < count; i++) {
          var childId = input.readInt();
          var child = context._makeFrame(childId);
          assert (child, "Child ", childId, " of ", id, " has not been sent yet.");
          container.addChild(child);
        }
      }
    }

    private _readCacheAsBitmap() {
      var input = this.input;
      var context = this.context;
      var targetId = input.readInt();
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
      if (hasBits & MessageBits.HasClipRect) {
        clipRect = this._readRectangle();
      }
      var blendMode = input.readInt();
      input.readBoolean(); // Smoothing
      var target = <RenderableBitmap>context._assets[targetId];
      var source: RenderableBitmap;
      if (sourceId & IDMask.Asset) {
        source = <RenderableBitmap>context._assets[sourceId];
      } else {
        source = this._cacheAsBitmap(context._frames[sourceId]);
      }
      if (target) {
        target.draw(source, matrix, colorMatrix, blendMode, clipRect);
      } else {
        context._assets[targetId] = source;
      }
    }

    private _cacheAsBitmap(frame: Frame): RenderableBitmap {
      Shumway.GFX.enterTimeline("cacheAsBitmap");
      var canvas = document.createElement('canvas');
      var bounds = frame.getBounds();
      var matrix = Matrix.createIdentity();
      if (bounds.x || bounds.y) {
        matrix.translate(-bounds.x, -bounds.y);
      }
      canvas.width = bounds.w;
      canvas.height = bounds.h;
      var renderer = new Canvas2DStageRenderer(canvas, null);
      var options = new Shumway.GFX.Canvas2DStageRendererOptions();
      renderer.renderFrame(renderer.context, frame, matrix, new Canvas2DStageRendererState(options));
      return new RenderableBitmap(canvas, bounds);
    }
  }
}
