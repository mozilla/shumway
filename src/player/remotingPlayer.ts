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
  import MessageBits = Shumway.Remoting.MessageBits;

  import flash = Shumway.AVM2.AS.flash;
  import Stage = flash.display.Stage;
  import Graphics = flash.display.Graphics;
  import display = flash.display;
  import Bitmap = flash.display.Bitmap;
  import BitmapData = flash.display.BitmapData;
  import DisplayObject = flash.display.DisplayObject;
  import DisplayObjectFlags = flash.display.DisplayObjectFlags;
  import DisplayObjectContainer = flash.display.DisplayObjectContainer;
  import BlendMode = flash.display.BlendMode;
  import VisitorFlags = flash.display.VisitorFlags;

  import Point = flash.geom.Point;
  import Bounds = Shumway.Bounds;
  import KeyboardEventData = flash.ui.KeyboardEventData;
  import MouseEventAndPointData = flash.ui.MouseEventAndPointData;

  import IDataInput = Shumway.ArrayUtilities.IDataInput;
  import IDataOutput = Shumway.ArrayUtilities.IDataOutput;
  import assert = Shumway.Debug.assert;

  export class PlayerChannelSerializer {
    public output: IDataOutput;
    public outputAssets: any[];

    public phase: RemotingPhase = RemotingPhase.Objects;

    writeStage(stage: DisplayObject) {
      var serializer = this;
      stage.visit(function (displayObject) {
        serializer.writeDisplayObject(displayObject);
        return VisitorFlags.Continue;
      }, VisitorFlags.Filter, DisplayObjectFlags.Dirty);
    }

    writeGraphics(graphics: Graphics) {
      var textures = graphics.getUsedTextures();
      var numTextures = textures.length;
      for (var i = 0; i < numTextures; i++) {
        this.writeBitmapData(textures[i]);
      }
      this.output.writeInt(MessageTag.UpdateGraphics);
      this.output.writeInt(graphics._id);
      this.writeRectangle(graphics._getContentBounds());
      this.output.writeInt(this.outputAssets.length);
      this.outputAssets.push(graphics.getGraphicsData().toPlainObject());
      this.output.writeInt(numTextures);
      for (var i = 0; i < numTextures; i++) {
        this.output.writeInt(textures[i]._id);
      }
    }

    writeBitmapData(bitmapData: BitmapData) {
      if (bitmapData._isDirty) {
        this.output.writeInt(MessageTag.UpdateBitmapData);
        this.output.writeInt(bitmapData._id);
        this.writeRectangle(bitmapData._getContentBounds());
        this.output.writeInt(bitmapData._type);
        this.output.writeInt(this.outputAssets.length);
        this.outputAssets.push(bitmapData.getDataBuffer().toPlainObject());
        bitmapData._isDirty = false;
      }
    }

    writeDisplayObject(displayObject: DisplayObject) {
      // Write Header
      this.output.writeInt(MessageTag.UpdateFrame);
      this.output.writeInt(displayObject._id);

      var hasMatrix = displayObject._hasFlags(DisplayObjectFlags.DirtyMatrix);
      var hasColorTransform = displayObject._hasFlags(DisplayObjectFlags.DirtyColorTransform);
      var hasMiscellaneousProperties = displayObject._hasFlags(DisplayObjectFlags.DirtyMiscellaneousProperties);

      // Check if any children need to be written. These are remoting children, not just display object children.
      var hasRemotableChildren = false;
      if (this.phase === RemotingPhase.References) {
        hasRemotableChildren = displayObject._hasAnyFlags (
          DisplayObjectFlags.DirtyChildren     |
          DisplayObjectFlags.DirtyGraphics     |
          DisplayObjectFlags.DirtyBitmapData
        );
      }

      // Write Has Bits
      var hasBits = 0;
      hasBits |= hasMatrix                  ? MessageBits.HasMatrix         : 0;
      hasBits |= hasColorTransform          ? MessageBits.HasColorTransform : 0;
      hasBits |= hasMiscellaneousProperties ? MessageBits.HasMiscellaneousProperties : 0;
      hasBits |= hasRemotableChildren       ? MessageBits.HasChildren       : 0;
      this.output.writeInt(hasBits);

      // Write Properties
      if (hasMatrix) {
        this.writeMatrix(displayObject._getMatrix());
      }
      if (hasColorTransform) {
        this.writeColorTransform(displayObject._colorTransform);
      }
      if (hasMiscellaneousProperties) {
        this.output.writeInt(BlendMode.toNumber(displayObject._blendMode));
        this.output.writeBoolean(displayObject._hasFlags(DisplayObjectFlags.Visible));
      }

      var bitmap: Bitmap = null;
      if (display.Bitmap.isType(displayObject)) {
        bitmap = <Bitmap>displayObject;
      }
      var graphics = displayObject._getGraphics();
      if (hasRemotableChildren) {
        if (bitmap) {
          if (bitmap.bitmapData) {
            this.output.writeInt(1);
            this.output.writeInt(IDMask.Asset | bitmap.bitmapData._id);
          }
        } else {
          // Check if we have a graphics object and write that as a child first.
          var count = graphics ? 1 : 0;
          var children = displayObject._children;
          if (children) {
            count += children.length;
          }
          this.output.writeInt(count);
          if (graphics) {
            this.output.writeInt(IDMask.Asset | graphics._id);
          }
          // Write all the display object children.
          if (children) {
            for (var i = 0; i < children.length; i++) {
              this.output.writeInt(children[i]._id);
            }
          }
        }
      }
      if (this.phase === RemotingPhase.References) {
        displayObject._removeFlags(DisplayObjectFlags.Dirty);
      }

      // Visit remotable child objects that are not otherwise visited.
      if (graphics) {
        this.writeGraphics(graphics);
      } else if (bitmap) {
        if (bitmap.bitmapData) {
          this.writeBitmapData(bitmap.bitmapData);
        }
      }
    }

    writeCacheAsBitmap(bitmapData: flash.display.BitmapData, source: Shumway.Remoting.IRemotable, matrix: flash.geom.Matrix = null, colorTransform: flash.geom.ColorTransform = null, blendMode: string = null, clipRect: flash.geom.Rectangle = null, smoothing: boolean = false) {
      this.output.writeInt(MessageTag.CacheAsBitmap);
      this.output.writeInt(bitmapData._id);
      if (BitmapData.isType(source)) {
        this.output.writeInt(IDMask.Asset | source._id);
      } else {
        this.output.writeInt(source._id);
      }

      var hasBits = 0;
      hasBits |= matrix         ? MessageBits.HasMatrix : 0;
      hasBits |= colorTransform ? MessageBits.HasColorTransform : 0;
      hasBits |= clipRect       ? MessageBits.HasClipRect : 0;

      this.output.writeInt(hasBits);
      if (matrix) {
        this.writeMatrix(matrix);
      }
      if (colorTransform) {
        this.writeColorTransform(colorTransform);
      }
      if (clipRect) {
        this.writeRectangle(Bounds.FromRectangle(clipRect));
      }
      this.output.writeInt(BlendMode.toNumber(blendMode));
      this.output.writeBoolean(smoothing);
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

    writeRectangle(bounds: Bounds) {
      var output = this.output;
      // TODO: check if we should write bounds instead. Depends on what's more useful in GFX-land.
      output.writeInt(bounds.xMin);
      output.writeInt(bounds.yMin);
      output.writeInt(bounds.width);
      output.writeInt(bounds.height);
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

  export enum EventKind {
    Focus,
    Mouse,
    Keyboard
  }

  export interface FocusEventData {
    type: FocusEventType
  }

  export class PlayerChannelDeserializer {
    input: IDataInput;

    public readEvent(): any {
      var input = this.input;
      var tag = input.readInt();
      switch (<MessageTag>tag) {
        case MessageTag.MouseEvent:
          return this._readMouseEvent();
        case MessageTag.KeyboardEvent:
          return this._readKeyboardEvent();
        case MessageTag.FocusEvent:
          return this._readFocusEvent();
      }
      assert(false, 'Unknown MessageReader tag: ' + tag);
    }

    private _readFocusEvent(): FocusEventData {
      var input = this.input;
      var typeId = input.readInt();
      return {
        kind: EventKind.Focus,
        type: <FocusEventType>typeId
      }
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
        kind: EventKind.Mouse,
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
        kind: EventKind.Keyboard,
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
