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
module Shumway.Remoting.Client {
  import MessageTag = Shumway.Remoting.MessageTag;
  import UpdateFrameTagBits = Shumway.Remoting.UpdateFrameTagBits;

  import Stage = Shumway.AVM2.AS.flash.display.Stage;
  import Graphics = Shumway.AVM2.AS.flash.display.Graphics;
  import DisplayObject = Shumway.AVM2.AS.flash.display.DisplayObject;
  import DisplayObjectFlags = Shumway.AVM2.AS.flash.display.DisplayObjectFlags;
  import DisplayObjectContainer = Shumway.AVM2.AS.flash.display.DisplayObjectContainer;
  import BlendMode = Shumway.AVM2.AS.flash.display.BlendMode;
  import VisitorFlags = Shumway.AVM2.AS.flash.display.VisitorFlags;

  import IDataOutput = Shumway.AVM2.AS.flash.utils.IDataOutput;

  export class ChannelSerializer {
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
      this.output.writeInt(MessageTag.UpdateFrame);
      this.output.writeInt(graphics._id);
      this.output.writeInt(0); // Not a container.
      var hasBits = UpdateFrameTagBits.HasBounds | UpdateFrameTagBits.HasShapeData;
      this.output.writeInt(hasBits);
      this.writeRectangle(graphics._getContentBounds());
      this.output.writeInt(this.outputAssets.length);
      this.outputAssets.push(graphics._graphicsData);
    }

    writeDisplayObject(displayObject: DisplayObject) {
      this.output.writeInt(MessageTag.UpdateFrame);
      this.output.writeInt(displayObject._id);
      // TODO create visitDisplayObjectContainer
      this.output.writeInt(DisplayObjectContainer.isType(displayObject) ? 1 : 0);
      var hasMatrix = displayObject._hasFlags(DisplayObjectFlags.DirtyMatrix);
      var hasBounds = true;
      var hasChildren = this.writeReferences && displayObject._hasFlags(DisplayObjectFlags.DirtyChildren);
      var hasColorTransform = displayObject._hasFlags(DisplayObjectFlags.DirtyColorTransform);
      var hasMiscellaneousProperties = displayObject._hasFlags(DisplayObjectFlags.DirtyMiscellaneousProperties);

      var hasBits = 0;
      hasBits |= hasMatrix         ? UpdateFrameTagBits.HasMatrix         : 0;
      hasBits |= hasBounds         ? UpdateFrameTagBits.HasBounds         : 0;
      hasBits |= hasChildren       ? UpdateFrameTagBits.HasChildren       : 0;
      hasBits |= hasColorTransform ? UpdateFrameTagBits.HasColorTransform : 0;
      hasBits |= hasMiscellaneousProperties ? UpdateFrameTagBits.HasMiscellaneousProperties : 0;

      this.output.writeInt(hasBits);
      if (hasMatrix) {
        this.writeMatrix(displayObject._getMatrix());
      }
      if (hasBounds) {
        this.writeRectangle(displayObject._getContentBounds());
      }
      if (hasChildren) {
        assert (DisplayObjectContainer.isType(displayObject));
        var children = (<DisplayObjectContainer>displayObject)._children;
        var count = children.length;
        var graphics = displayObject._getGraphics();
        if (graphics) {
          count ++;
        }
        this.output.writeInt(count);
        if (graphics) {
          this.output.writeInt(graphics._id);
        }
        for (var i = 0; i < children.length; i++) {
          this.output.writeInt(children[i]._id);
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

    writeMatrix(matrix: Shumway.AVM2.AS.flash.geom.Matrix) {
      var output = this.output;
      output.writeFloat(matrix.a);
      output.writeFloat(matrix.b);
      output.writeFloat(matrix.c);
      output.writeFloat(matrix.d);
      output.writeFloat(matrix.tx);
      output.writeFloat(matrix.ty);
    }

    writeRectangle(rect: Shumway.AVM2.AS.flash.geom.Rectangle) {
      var output = this.output;
      output.writeFloat(rect.x);
      output.writeFloat(rect.y);
      output.writeFloat(rect.width);
      output.writeFloat(rect.height);
    }

    writeColorTransform(colorTransform: Shumway.AVM2.AS.flash.geom.ColorTransform) {
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

}
