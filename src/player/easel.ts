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

module Shumway {
  import IGFXChannel = Shumway.Remoting.IGFXChannel;

  import Easel = Shumway.GFX.Easel;
  import FrameContainer = Shumway.GFX.FrameContainer;
  import Point = Shumway.GFX.Geometry.Point;

  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;

  export class EaselHost {
    private static _mouseEvents = Shumway.Remoting.MouseEventNames;
    private static _keyboardEvents = Shumway.Remoting.KeyboardEventNames;

    private _easel: Easel;
    private _channel: IGFXChannel;
    private _frameContainer: FrameContainer;
    private _context: Shumway.Remoting.GFX.GFXChannelDeserializerContext;

    constructor(easel: Easel, channel: IGFXChannel) {
      this._easel = easel;
      this._channel = channel;
      var frameContainer = easel.world;
      this._frameContainer = frameContainer;
      this._context = new Shumway.Remoting.GFX.GFXChannelDeserializerContext(this._frameContainer);

      channel.registerForUpdates(this.readData.bind(this));
      this._addEventListeners();
    }

    private _mouseEventListener(event: MouseEvent) {
      var position = this._easel.getMouseWorldPosition(event);
      var point = new Point(position.x, position.y);

      var buffer = new DataBuffer();
      var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
      serializer.output = buffer;
      serializer.writeMouseEvent(event, point);
      this._channel.sendEventUpdates(buffer);
    }

    private _keyboardEventListener(event: KeyboardEvent) {
      var buffer = new DataBuffer();
      var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
      serializer.output = buffer;
      serializer.writeKeyboardEvent(event);
      this._channel.sendEventUpdates(buffer);
    }

    _addEventListeners() {
      var mouseEventListener = this._mouseEventListener.bind(this);
      var keyboardEventListener = this._keyboardEventListener.bind(this);
      var mouseEvents = EaselHost._mouseEvents;
      for (var i = 0; i < mouseEvents.length; i++) {
        window.addEventListener(mouseEvents[i], mouseEventListener);
      }
      var keyboardEvents = EaselHost._keyboardEvents;
      for (var i = 0; i < keyboardEvents.length; i++) {
        window.addEventListener(keyboardEvents[i], keyboardEventListener);
      }
    }

    readData(updates: DataBuffer, assets: Array<DataBuffer>) {
      var deserializer = new Shumway.Remoting.GFX.GFXChannelDeserializer();
      deserializer.input = updates;
      deserializer.inputAssets = assets;
      deserializer.context = this._context;
      deserializer.read();
    }
  }
}
