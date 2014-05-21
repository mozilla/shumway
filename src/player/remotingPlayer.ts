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
module Shumway.Remoting.Player {
  import MessageTag = Shumway.Remoting.MessageTag;
  import UpdateFrameTagBits = Shumway.Remoting.UpdateFrameTagBits;

  import flash = Shumway.AVM2.AS.flash;
  import Stage = flash.display.Stage;
  import Graphics = flash.display.Graphics;
  import DisplayObject = flash.display.DisplayObject;
  import DisplayObjectFlags = flash.display.DisplayObjectFlags;
  import DisplayObjectContainer = flash.display.DisplayObjectContainer;
  import BlendMode = flash.display.BlendMode;
  import VisitorFlags = flash.display.VisitorFlags;

  import Point = flash.geom.Point;
  import BoundingBox = Shumway.GFX.Geometry.BoundingBox;
  import KeyboardEventData = flash.ui.KeyboardEventData;
  import MouseEventAndPointData = flash.ui.MouseEventAndPointData;

  import IDataInput = flash.utils.IDataInput;
  import IDataOutput = flash.utils.IDataOutput;

  export class PlayerChannelSerializer {
    public output: IDataOutput;
    public outputAssets: Array<IDataOutput>;

    public writeReferences: boolean = false;
    public clearDirtyBits: boolean = false;

    writeStage(stage: Stage) {
      var serializer = this;
      stage.visit(function (displayObject) {
        serializer.writeDisplayObject(displayObject);
        var graphics = displayObject._getGraphics();
        if (graphics) {
          serializer.writeGraphics(graphics);
        }
        return VisitorFlags.Continue;
      }, VisitorFlags.None);
    }

    writeGraphics(graphics: Graphics) {
      this.output.writeInt(MessageTag.UpdateGraphics);
      this.output.writeInt(graphics._id);
      this.writeRectangle(graphics._getContentBounds());
//      this.output.writeInt(this.outputAssets.length);
//      this.outputAssets.push(graphics._graphicsData);
    }

    writeDisplayObject(displayObject: DisplayObject) {
      var graphics = displayObject._getGraphics();

      this.output.writeInt(MessageTag.UpdateFrame);
      this.output.writeInt(displayObject._id);
      var hasMatrix = displayObject._hasFlags(DisplayObjectFlags.DirtyMatrix);

      var hasChildren = this.writeReferences && displayObject._hasAnyFlags(DisplayObjectFlags.DirtyChildren | DisplayObjectFlags.DirtyGraphics);
      var hasColorTransform = displayObject._hasFlags(DisplayObjectFlags.DirtyColorTransform);
      var hasMiscellaneousProperties = displayObject._hasFlags(DisplayObjectFlags.DirtyMiscellaneousProperties);

      var hasBits = 0;
      hasBits |= hasMatrix         ? UpdateFrameTagBits.HasMatrix         : 0;
      hasBits |= hasChildren       ? UpdateFrameTagBits.HasChildren       : 0;
      hasBits |= hasColorTransform ? UpdateFrameTagBits.HasColorTransform : 0;
      hasBits |= hasMiscellaneousProperties ? UpdateFrameTagBits.HasMiscellaneousProperties : 0;

      this.output.writeInt(hasBits);
      if (hasMatrix) {
        this.writeMatrix(displayObject._getMatrix());
      }
      if (hasChildren) {
        var count = graphics ? 1 : 0;
        var children = DisplayObjectContainer.isType(displayObject) ? (<DisplayObjectContainer>displayObject)._children : null;
        if (children) {
          count += children.length;
        }
        this.output.writeInt(count);
        if (graphics) {
          this.output.writeInt(IDMask.Asset | graphics._id);
        }
        if (children) {
          for (var i = 0; i < children.length; i++) {
            this.output.writeInt(children[i]._id);
          }
        }
      }
      if (hasColorTransform) {
        this.writeColorTransform(displayObject._colorTransform);
      }
      if (hasMiscellaneousProperties) {
        this.output.writeInt(BlendMode.toNumber(displayObject._blendMode));
        this.output.writeBoolean(displayObject._hasFlags(DisplayObjectFlags.Visible));
      }
      if (this.clearDirtyBits) {
        displayObject._removeFlags(DisplayObjectFlags.Dirty);
      }
    }

    writeMatrix(matrix: flash.geom.Matrix) {
      var output = this.output;
      output.writeFloat(matrix.a);
      output.writeFloat(matrix.b);
      output.writeFloat(matrix.c);
      output.writeFloat(matrix.d);
      output.writeFloat(matrix.tx);
      output.writeFloat(matrix.ty);
    }

    writeRectangle(rect: BoundingBox) {
      var output = this.output;
      output.writeInt(rect.xMin);
      output.writeInt(rect.yMin);
      output.writeInt(rect.width);
      output.writeInt(rect.height);
    }

    writeColorTransform(colorTransform: flash.geom.ColorTransform) {
      var output = this.output;
      var rm = colorTransform.redMultiplier;
      var gm = colorTransform.greenMultiplier;
      var bm = colorTransform.blueMultiplier;
      var am = colorTransform.alphaMultiplier;
      var ro = colorTransform.redOffset;
      var go = colorTransform.greenOffset;
      var bo = colorTransform.blueOffset;
      var ao = colorTransform.alphaOffset;

      var identityOffset          = ro === go && go === bo && bo === ao && ao === 0;
      var identityColorMultiplier = rm === gm && gm === bm && bm === 1;

      if (identityOffset && identityColorMultiplier) {
        if (am === 1) {
          output.writeInt(ColorTransformEncoding.Identity);
        } else {
          output.writeInt(ColorTransformEncoding.AlphaMultiplierOnly);
          output.writeFloat(am);
        }
      } else {
        output.writeInt(ColorTransformEncoding.All);
        output.writeFloat(rm);
        output.writeFloat(gm);
        output.writeFloat(bm);
        output.writeFloat(am);
        output.writeInt(ro);
        output.writeInt(go);
        output.writeInt(bo);
        output.writeInt(ao);
      }
    }
  }

  export class PlayerChannelDeserializer {
    input: IDataInput;

    public readEvent(): any {
      var input = this.input;
      var tag = input.readInt();
      if (tag === MessageTag.MouseEvent) {
        return this._readMouseEvent();
      } else if (tag === MessageTag.KeyboardEvent) {
        return this._readKeyboardEvent();
      }
      assert(false, 'Unknown MessageReader tag: ' + tag);
    }

    private _readMouseEvent(): MouseEventAndPointData {
      var input = this.input;
      var typeId = input.readInt();
      var type = Shumway.Remoting.MouseEventNames[typeId];
      var px = input.readFloat();
      var py = input.readFloat();
      var buttons = input.readInt();
      var flags = input.readInt();
      return {
        isMouseEvent: true,
        type: type,
        point: new Point(px, py),
        ctrlKey: !!(flags & KeyboardEventFlags.CtrlKey),
        altKey: !!(flags & KeyboardEventFlags.AltKey),
        shiftKey: !!(flags & KeyboardEventFlags.ShiftKey),
        buttons: buttons
      };
    }

    private _readKeyboardEvent(): KeyboardEventData {
      var input = this.input;
      var typeId = input.readInt();
      var type = Shumway.Remoting.KeyboardEventNames[typeId];
      var keyCode = input.readInt();
      var charCode = input.readInt();
      var location = input.readInt();
      var flags = input.readInt();
      return {
        isKeyboardEvent: true,
        type: type,
        keyCode: keyCode,
        charCode: charCode,
        location: location,
        ctrlKey: !!(flags & KeyboardEventFlags.CtrlKey),
        altKey: !!(flags & KeyboardEventFlags.AltKey),
        shiftKey: !!(flags & KeyboardEventFlags.ShiftKey)
      };
    }
  }
}
