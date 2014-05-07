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
module Shumway.Remoting.Server {
  import Frame = Shumway.GFX.Frame;
  import Shape = Shumway.GFX.Shape;
  import Renderable = Shumway.GFX.Renderable;
  import FrameContainer = Shumway.GFX.FrameContainer;
  import ArrayWriter = Shumway.ArrayUtilities.ArrayWriter;

  import Matrix = Shumway.GFX.Geometry.Matrix;
  import Rectangle = Shumway.GFX.Geometry.Rectangle;
  import IDataInput = Shumway.AVM2.AS.flash.utils.IDataInput;

  export class ChannelDeserializerContext {
    root: FrameContainer;
    _frames: Frame [];

    constructor(root: FrameContainer) {
      this.root = root;
      this._frames = [];
    }
  }

  export class ChannelDeserializer {
    input: IDataInput;
    context: ChannelDeserializerContext;

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
      if (hasBits & UpdateFrameTagBits.HasBounds) {
        var bounds = this._readRectangle();
        var shape = (<Shape>frame);
        if (!shape.source) {
          var renderable = new Renderable(bounds, function (context) {
            if (!this.fillStyle) {
              this.fillStyle = Shumway.ColorStyle.randomStyle();
            }
            context.save();
            context.beginPath();
            context.lineWidth = 2;
            context.fillStyle = this.fillStyle;
            context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
            context.restore();
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
          var id = input.readInt();
          var child = context._frames[id];
          assert (child);
          container.addChild(child);
        }
      }
      if (hasBits & UpdateFrameTagBits.HasMiscellaneousProperties) {
        frame.blendMode = input.readInt();
        frame.alpha = input.readFloat();
      }
    }
  }
}
