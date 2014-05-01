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
  import ArrayWriter = Shumway.ArrayUtilities.ArrayWriter;
  import MessageTag = Shumway.Remoting.MessageTag;
  import UpdateFrameTagBits = Shumway.Remoting.UpdateFrameTagBits;

  import DisplayObject = Shumway.AVM2.AS.flash.display.DisplayObject;
  import DisplayObjectFlags = Shumway.AVM2.AS.flash.display.DisplayObjectFlags;
  import DisplayObjectContainer = Shumway.AVM2.AS.flash.display.DisplayObjectContainer;

  export class ClientVisitor implements IChannelVisitor {
    public writer: ArrayWriter;
    public writeReferences: boolean = false;
    public clearDirtyBits: boolean = false;

    public serializeMatrix(m: Shumway.AVM2.AS.flash.geom.Matrix) {
      this.writer.write6Floats(m.a, m.b, m.c, m.d, m.tx / 20, m.ty / 20);
    }

    public serializeRactangle(r: Shumway.AVM2.AS.flash.geom.Rectangle) {
      this.writer.write4Floats(r.x / 20, r.y / 20, r.width / 20, r.height / 20);
    }

    visitDisplayObject(obj) {
      var dispObj : DisplayObject = obj;

      this.writer.writeInt(MessageTag.UpdateFrame);
      this.writer.writeInt(dispObj._id);
      // TODO create visitDisplayObjectContainer
      this.writer.writeInt(DisplayObjectContainer.isType(dispObj) ? 1 : 0);
      var hasMatrix = dispObj._hasFlags(DisplayObjectFlags.DirtyMatrix);
      var hasBounds = dispObj._hasFlags(DisplayObjectFlags.DirtyBounds);
      var hasChildren = this.writeReferences && dispObj._hasFlags(DisplayObjectFlags.DirtyChildren);
      var hasBits = 0;
      hasBits |= hasMatrix   ? UpdateFrameTagBits.HasMatrix   : 0;
      hasBits |= hasBounds   ? UpdateFrameTagBits.HasBounds   : 0;
      hasBits |= hasChildren ? UpdateFrameTagBits.HasChildren : 0;
      this.writer.writeInt(hasBits);
      if (hasMatrix) {
        this.serializeMatrix(dispObj._matrix);
      }
      if (hasBounds) {
        this.serializeRactangle(dispObj._getContentBounds());
      }
      if (hasChildren) {
        assert (DisplayObjectContainer.isType(dispObj));
        var children = (<DisplayObjectContainer>dispObj)._children;
        this.writer.writeInt(children.length);
        for (var i = 0; i < children.length; i++) {
          this.writer.writeInt(children[i]._id);
        }
      }
      if (this.clearDirtyBits) {
        dispObj._removeFlags(DisplayObjectFlags.Dirty);
      }
    }
  }

}