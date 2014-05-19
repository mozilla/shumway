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
  import ColorMatrix = Shumway.GFX.ColorMatrix;
  import FrameContainer = Shumway.GFX.FrameContainer;
  import ArrayWriter = Shumway.ArrayUtilities.ArrayWriter;

  import Point = Shumway.AVM2.AS.flash.geom.Point;
  import Matrix = Shumway.GFX.Geometry.Matrix;
  import Rectangle = Shumway.GFX.Geometry.Rectangle;
  import IDataInput = Shumway.AVM2.AS.flash.utils.IDataInput;
  import IDataOutput = Shumway.AVM2.AS.flash.utils.IDataOutput;

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

    constructor(root: FrameContainer) {
      this.root = root;
      this._frames = [];
    }
  }

  export class GFXChannelDeserializer {
    input: IDataInput;
    inputAssets: Array<IDataInput>;
    context: GFXChannelDeserializerContext;

    public read() {
      var tag = 0;
      var input = this.input;

      while (input.bytesAvailable > 0) {
        tag = input.readInt();
        switch (tag) {
          case MessageTag.EOF:
            return;
          case MessageTag.UpdateFrame:
            this._readUpdateFrame();
            break;
          default:
            assert(false, 'Unknown MessageReader tag: ' + tag);
            break;
        }
      }
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
        input.readFloat() / 20,
        input.readFloat() / 20,
        input.readFloat() / 20,
        input.readFloat() / 20
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

    private _readUpdateFrame() {
      var context = this.context;
      var input = this.input;
      var id = input.readInt();
      var isContainer = !!input.readInt();
      var firstFrame = context._frames.length === 0;
      var frame = context._frames[id];
      if (!frame) {
        frame = context._frames[id] = isContainer ? new FrameContainer() : new Shape(null);
      }
      if (firstFrame) {
        context.root.addChild(frame);
      }
      var hasBits = input.readInt();
      if (hasBits & UpdateFrameTagBits.HasMatrix) {
        frame.matrix = this._readMatrix();
      }
      var bounds: Rectangle;
      if (hasBits & UpdateFrameTagBits.HasBounds) {
        bounds = this._readRectangle();
      }
      if (hasBits & UpdateFrameTagBits.HasShapeData) {
        assert(!isContainer);
        var assetId = input.readInt();
        var shapeData = this.inputAssets[assetId];
        this.inputAssets[assetId] = null;
        var shape = (<Shape>frame);
        shape.ensureSource(shapeData, bounds);
      } else if (bounds) {
        var shape = (<Shape>frame);
        if (!shape.source) {
          var renderable = new Renderable(bounds, function (context) {
//            if (!this.fillStyle) {
//              this.fillStyle = Shumway.ColorStyle.randomStyle();
//            }
//            context.save();
//            context.beginPath();
//            context.lineWidth = 2;
//            context.fillStyle = this.fillStyle;
//            context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
//            context.restore();
          });
          renderable.isInvalid = false;
          renderable.isScalable = true;
          renderable.isTileable = true;
          renderable.isDynamic = false;
          shape.source = renderable;
        }
      }
      if (hasBits & UpdateFrameTagBits.HasChildren) {
        var count = input.readInt();
        var container = <FrameContainer>frame;
        container.clearChildren();
        for (var i = 0; i < count; i++) {
          var childId = input.readInt();
          var child = context._frames[childId];
          assert (child);
          container.addChild(child);
        }
      }
      if (hasBits & UpdateFrameTagBits.HasColorTransform) {
        frame.colorMatrix = this._readColorMatrix();
      }
      if (hasBits & UpdateFrameTagBits.HasMiscellaneousProperties) {
        frame.blendMode = input.readInt();
        // TODO: Should make a proper flag for this.
        frame.alpha = input.readBoolean() ? 1 : 0;
      }
    }
  }
}
