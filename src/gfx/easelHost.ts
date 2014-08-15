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

module Shumway.GFX {
  import Easel = Shumway.GFX.Easel;
  import FrameContainer = Shumway.GFX.FrameContainer;
  import Stage = Shumway.GFX.Stage;
  import Point = Shumway.GFX.Geometry.Point;

  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;

  export class EaselHost {
    private static _mouseEvents = Shumway.Remoting.MouseEventNames;
    private static _keyboardEvents = Shumway.Remoting.KeyboardEventNames;

    private _easel: Easel;
    private _frameContainer: FrameContainer;
    private _context: Shumway.Remoting.GFX.GFXChannelDeserializerContext;

    constructor(easel: Easel) {
      this._easel = easel;
      var frameContainer = easel.world;
      this._frameContainer = frameContainer;
      this._context = new Shumway.Remoting.GFX.GFXChannelDeserializerContext(this._frameContainer);

      this._addEventListeners();
    }

    onSendEventUpdates(update: DataBuffer) {
      throw new Error('This method is abstract');
    }

    get stage(): Stage {
      return this._easel.stage;
    }

    private _mouseEventListener(event: MouseEvent) {
      var position = this._easel.getMouseWorldPosition(event);
      var point = new Point(position.x, position.y);

      var buffer = new DataBuffer();
      var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
      serializer.output = buffer;
      serializer.writeMouseEvent(event, point);
      this.onSendEventUpdates(buffer);
    }

    private _keyboardEventListener(event: KeyboardEvent) {
      var buffer = new DataBuffer();
      var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
      serializer.output = buffer;
      serializer.writeKeyboardEvent(event);
      this.onSendEventUpdates(buffer);
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
      this._addFocusEventListeners();
    }

    private _sendFocusEvent(type: Shumway.Remoting.FocusEventType) {
      var buffer = new DataBuffer();
      var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
      serializer.output = buffer;
      serializer.writeFocusEvent(type);
      this.onSendEventUpdates(buffer);
    }

    private _addFocusEventListeners() {
      var self = this;
      document.addEventListener('visibilitychange', function(event) {
        self._sendFocusEvent(document.hidden ?
          Shumway.Remoting.FocusEventType.DocumentHidden :
          Shumway.Remoting.FocusEventType.DocumentVisible);
      });
      window.addEventListener('focus', function(event) {
        self._sendFocusEvent(Shumway.Remoting.FocusEventType.WindowFocus);
      });
      window.addEventListener('blur', function(event) {
        self._sendFocusEvent(Shumway.Remoting.FocusEventType.WindowBlur);
      });
    }

    processUpdates(updates: DataBuffer, assets: Array<DataBuffer>, output: DataBuffer = null) {
      var deserializer = new Shumway.Remoting.GFX.GFXChannelDeserializer();
      deserializer.input = updates;
      deserializer.inputAssets = assets;
      deserializer.output = output;
      deserializer.context = this._context;
      deserializer.read();
    }

    processExternalCommand(command) {
      if (command.action === 'isEnabled') {
        command.result = false;
        return;
      }
      throw new Error('This command is not supported');
    }

    processFrame() {
        //...
    }

    onExernalCallback(request) {
      throw new Error('This method is abstract');
    }

    sendExernalCallback(functionName: string, args: any[]): any {
      var request: any = {
        functionName: functionName,
        args: args
      };
      this.onExernalCallback(request);
      if (request.error) {
        throw new Error(request.error);
      }
      return request.result;
    }
  }
}
