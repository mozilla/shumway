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
  import FrameFlags = Shumway.GFX.FrameFlags;
  import Shape = Shumway.GFX.Shape;
  import Renderable = Shumway.GFX.Renderable;
  import RenderableShape = Shumway.GFX.RenderableShape;
  import RenderableBitmap = Shumway.GFX.RenderableBitmap;
  import RenderableText = Shumway.GFX.RenderableText;
  import ColorMatrix = Shumway.GFX.ColorMatrix;
  import FrameContainer = Shumway.GFX.FrameContainer;
  import ClipRectangle = Shumway.GFX.ClipRectangle;
  import ShapeData = Shumway.ShapeData;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import Stage = Shumway.GFX.Stage;

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
    private _assets: Renderable [];

    constructor(root: FrameContainer) {
      this.root = new ClipRectangle(128, 128);
      root.addChild(this.root);
      this._frames = [];
      this._assets = [];
    }

    _registerAsset(id: number, symbolId: number, asset: Renderable) {
      if (typeof registerInspectorAsset !== "undefined") {
        registerInspectorAsset(id, symbolId, asset);
      }
      this._assets[id] = asset;
    }

    _makeFrame(id: number): Frame {
      if (id === -1) {
        return null;
      }
      if (id & IDMask.Asset) {
        id &= ~IDMask.Asset;
        var shape = new Shape(this._assets[id]);
        this._assets[id].addFrameReferrer(shape);
        return shape;
      } else {
        return this._frames[id];
      }
    }

    _getAsset(id: number): Renderable {
      return this._assets[id];
    }

    _getBitmapAsset(id: number): RenderableBitmap {
      return <RenderableBitmap>this._assets[id];
    }

    _getTextAsset(id: number): RenderableText {
      return <RenderableText>this._assets[id];
    }
  }

  export class GFXChannelDeserializer {
    input: IDataInput;
    inputAssets: any[];
    output: DataBuffer;
    context: GFXChannelDeserializerContext;

    public read() {
      var tag = 0;
      var input = this.input;

      var data = {
        bytesAvailable: input.bytesAvailable,
        updateGraphics: 0,
        updateBitmapData: 0,
        updateTextContent: 0,
        updateFrame: 0,
        updateStage: 0,
        registerFont: 0,
        drawToBitmap: 0
      };
      Shumway.GFX.enterTimeline("GFXChannelDeserializer.read", data);
      while (input.bytesAvailable > 0) {
        tag = input.readInt();
        switch (tag) {
          case MessageTag.EOF:
            Shumway.GFX.leaveTimeline("GFXChannelDeserializer.read");
            return;
          case MessageTag.UpdateGraphics:
            data.updateGraphics ++;
            this._readUpdateGraphics();
            break;
          case MessageTag.UpdateBitmapData:
            data.updateBitmapData ++;
            this._readUpdateBitmapData();
            break;
          case MessageTag.UpdateTextContent:
            data.updateTextContent ++;
            this._readUpdateTextContent();
            break;
          case MessageTag.UpdateFrame:
            data.updateFrame ++;
            this._readUpdateFrame();
            break;
          case MessageTag.UpdateStage:
            data.updateStage ++;
            this._readUpdateStage();
            break;
          case MessageTag.RegisterFont:
            data.registerFont ++;
            this._readRegisterFont();
            break;
          case MessageTag.DrawToBitmap:
            data.drawToBitmap ++;
            this._readDrawToBitmap();
            break;
          default:
            release || assert(false, 'Unknown MessageReader tag: ' + tag);
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

    private _popAsset(): any {
      var assetId = this.input.readInt();
      var asset = this.inputAssets[assetId];
      this.inputAssets[assetId] = null;
      return asset;
    }

    private _readUpdateGraphics() {
      var input = this.input;
      var context = this.context;
      var id = input.readInt();
      var symbolId = input.readInt();
      var asset = context._getAsset(id);
      var bounds = this._readRectangle();
      var pathData = ShapeData.FromPlainObject(this._popAsset());
      var numTextures = input.readInt();
      var textures = [];
      for (var i = 0; i < numTextures; i++) {
        var bitmapId = input.readInt();
        textures.push(context._getBitmapAsset(bitmapId));
      }
      if (!asset) {
        var renderable = new RenderableShape(id, pathData, textures, bounds);
        for (var i = 0; i < textures.length; i++) {
          textures[i].addRenderableReferrer(renderable);
        }
        context._registerAsset(id, symbolId, renderable);
      }
    }

    private _readUpdateBitmapData() {
      var input = this.input;
      var context = this.context;
      var id = input.readInt();
      var symbolId = input.readInt();
      var asset = context._getBitmapAsset(id);
      var bounds = this._readRectangle();
      var type: ImageType = input.readInt();
      var dataBuffer = DataBuffer.FromPlainObject(this._popAsset());
      if (!asset) {
        asset = RenderableBitmap.FromDataBuffer(type, dataBuffer, bounds);
        context._registerAsset(id, symbolId, asset);
      } else {
        asset.updateFromDataBuffer(type, dataBuffer);
      }
      if (this.output) {
        // TODO: Write image data to output.
      }
    }

    private _readUpdateTextContent() {
      var input = this.input;
      var context = this.context;
      var id = input.readInt();
      var symbolId = input.readInt();
      var asset = context._getTextAsset(id);
      var bounds = this._readRectangle();
      var matrix = this._readMatrix();
      var backgroundColor = input.readInt();
      var borderColor = input.readInt();
      var autoSize = input.readInt();
      var wordWrap = input.readBoolean();
      var plainText = this._popAsset();
      var textRunData = DataBuffer.FromPlainObject(this._popAsset());
      var coords = null;
      var numCoords = input.readInt();
      if (numCoords) {
        coords = new DataBuffer(numCoords* 4);
        input.readBytes(coords, 0, numCoords * 4);
      }
      if (!asset) {
        asset = new RenderableText(bounds);
        asset.setContent(plainText, textRunData, matrix, coords);
        asset.setStyle(backgroundColor, borderColor);
        asset.reflow(autoSize, wordWrap);
        context._registerAsset(id, symbolId, asset);
      } else {
        asset.setBounds(bounds);
        asset.setContent(plainText, textRunData, matrix, coords);
        asset.setStyle(backgroundColor, borderColor);
        asset.reflow(autoSize, wordWrap);
      }
      if (this.output) {
        var rect = asset.textRect;
        this.output.writeInt(rect.w * 20);
        this.output.writeInt(rect.h * 20);
        this.output.writeInt(rect.x * 20);
        var lines = asset.lines;
        var numLines = lines.length;
        this.output.writeInt(numLines);
        for (var i = 0; i < numLines; i++) {
          this._writeLineMetrics(lines[i]);
        }
      }
    }

    private _writeLineMetrics(line: Shumway.GFX.TextLine): void {
      release || assert (this.output);
      this.output.writeInt(line.x);
      this.output.writeInt(line.width);
      this.output.writeInt(line.ascent);
      this.output.writeInt(line.descent);
      this.output.writeInt(line.leading);
    }

    private _readUpdateStage() {
      var context = this.context;
      var id = this.input.readInt();
      if (!context._frames[id]) {
        context._frames[id] = context.root;
      }
      var color = this.input.readInt();
      var rectangle = this._readRectangle()
      context.root.setBounds(rectangle);
      context.root.color = Color.FromARGB(color);
    }

    private _readUpdateFrame() {
      var input = this.input;
      var context = this.context;
      var id = input.readInt();
      writer && writer.writeLn("Receiving UpdateFrame: " + id);
      var frame = context._frames[id];
      if (!frame) {
        frame = context._frames[id] = new FrameContainer();
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
      if (hasBits & MessageBits.HasClip) {
        frame.clip = input.readInt();
      }
      if (hasBits & MessageBits.HasMiscellaneousProperties) {
        frame.blendMode = input.readInt();
        frame._toggleFlags(FrameFlags.Visible, input.readBoolean());
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
          release || assert (child, "Child ", childId, " of ", id, " has not been sent yet.");
          container.addChild(child);
        }
      }
    }

    private _readRegisterFont() {
      var input = this.input;
      var fontId = input.readInt();
      var bold = input.readBoolean();
      var italic = input.readBoolean();
      var data = this._popAsset();
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
    }

    private _readDrawToBitmap() {
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
      } else {
        matrix = Matrix.createIdentity();
      }
      if (hasBits & MessageBits.HasColorTransform) {
        colorMatrix = this._readColorMatrix();
      }
      if (hasBits & MessageBits.HasClipRect) {
        clipRect = this._readRectangle();
      }
      var blendMode = input.readInt();
      input.readBoolean(); // Smoothing
      var target = context._getBitmapAsset(targetId);
      var source = context._makeFrame(sourceId);
      if (!target) {
        context._registerAsset(targetId, -1, RenderableBitmap.FromFrame(source, matrix, colorMatrix, blendMode, clipRect));
      } else {
        target.drawFrame(source, matrix, colorMatrix, blendMode, clipRect);
      }
    }
  }
}
