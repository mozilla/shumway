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
module Shumway.Remoting {
  import Frame = Shumway.GFX.Frame;
  import Shape = Shumway.GFX.Shape;
  import Renderable = Shumway.GFX.Renderable;
  import FrameContainer = Shumway.GFX.FrameContainer;
  import ArrayWriter = Shumway.ArrayUtilities.ArrayWriter;

  import Matrix = Shumway.GFX.Geometry.Matrix;
  import Rectangle = Shumway.GFX.Geometry.Rectangle;
  import IDataInput = Shumway.AVM2.AS.flash.utils.IDataInput;
  import IDataOutput = Shumway.AVM2.AS.flash.utils.IDataOutput;

  export enum UpdateFrameTagBits {
    HasMatrix     = 0x0001,
    HasBounds     = 0x0002,
    HasChildren   = 0x0004
  }

  export enum MessageTag {
    EOF = 0,
    UpdateFrame   = 1
  }

  export interface IChannelVisitor {
    visitDisplayObject(obj);
  }

  function readMatrix(reader: IDataInput): Matrix {
    return new Matrix (
      reader.readFloat(),
      reader.readFloat(),
      reader.readFloat(),
      reader.readFloat(),
      reader.readFloat() / 20,
      reader.readFloat() / 20
    );
  }

  function readRectangle(reader: IDataInput): Rectangle {
    return new Rectangle (
      reader.readFloat() / 20,
      reader.readFloat() / 20,
      reader.readFloat() / 20,
      reader.readFloat() / 20
    );
  }

  export class Server {
    private _root: FrameContainer;
    private _frames: Frame [];

    constructor(root: FrameContainer) {
      this._root = root;
      this._frames = [];
    }

    public recieve(reader: IDataInput) {
      var tag = 0;
      var length = 0;
      while (reader.bytesAvailable > 0) {
        tag = reader.readInt();
        switch (tag) {
          case MessageTag.EOF:
            return;
          case MessageTag.UpdateFrame:
            this._parseUpdateFrame(reader);
            break;
          default:
            assert(false, 'Unknown MessageReader tag: ' + tag);
            break;
        }
      }
    }

    private _parseUpdateFrame(reader: IDataInput) {
      var id = reader.readInt();
      var isContainer = !!reader.readInt();
      var firstFrame = this._frames.length === 0;
      var frame = this._frames[id];
      if (!frame) {
        frame = this._frames[id] = isContainer ? new FrameContainer() : new Shape(null);
      }
      if (firstFrame) {
        this._root.addChild(frame);
      }
      var hasBits = reader.readInt();
      if (hasBits & UpdateFrameTagBits.HasMatrix) {
        frame.matrix = readMatrix(reader);
      }
      if (hasBits & UpdateFrameTagBits.HasBounds) {
        var bounds = readRectangle(reader);
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
            this.isInvalid = false;
          });
          shape.source = renderable;
        }
      }
      if (hasBits & UpdateFrameTagBits.HasChildren) {
        var count = reader.readInt();
        var container = <FrameContainer>frame;
        container.clearChildren();
        for (var i = 0; i < count; i++) {
          var id = reader.readInt();
          var child = this._frames[id];
          assert (child);
          container.addChild(child);
        }
      }
    }
  }
}