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
  import Stage = Shumway.GFX.Stage;
  import Point = Shumway.GFX.Geometry.Point;
  import Rectangle = Geometry.Rectangle;

  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import VideoControlEvent = Shumway.Remoting.VideoControlEvent;
  import VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;
  import DisplayParameters = Shumway.Remoting.DisplayParameters;

  // Set to -1 to enable events for right button.
  export var ContextMenuButton = 2;

  export class EaselHost {
    private static _mouseEvents = Shumway.Remoting.MouseEventNames;
    private static _keyboardEvents = Shumway.Remoting.KeyboardEventNames;

    private _easel: Easel;
    private _group: Group;
    private _context: Shumway.Remoting.GFX.GFXChannelDeserializerContext;
    private _content: Group;
    private _fullscreen: boolean;

    constructor(easel: Easel) {
      this._easel = easel;
      var group = easel.world;
      var transparent = easel.transparent;
      this._group = group;
      this._content = null;
      this._fullscreen = false;
      this._context = new Shumway.Remoting.GFX.GFXChannelDeserializerContext(this, this._group, transparent);
      this._addEventListeners();
      Shumway.registerFallbackFont();
    }

    onSendUpdates(update: DataBuffer, asssets: Array<DataBuffer>) {
      throw new Error('This method is abstract');
    }

    get easel(): Easel {
      return this._easel;
    }

    get stage(): Stage {
      return this._easel.stage;
    }

    set content(value: Group) {
      this._content = value;
    }

    set cursor(cursor: string) {
      this._easel.cursor = cursor;
    }

    set fullscreen(value: boolean) {
      if (this._fullscreen !== value) {
        this._fullscreen = value;
        // TODO refactor to have a normal two-way communication service/api
        // HACK for now
        if (typeof ShumwayCom !== 'undefined' && ShumwayCom.setFullscreen) {
          ShumwayCom.setFullscreen(value);
        }
      }
    }

    private _mouseEventListener(event: MouseEvent) {
      if (event.button === ContextMenuButton) {
        // Disable all events for right button -- usually it triggers context menu.
        return;
      }
      // var position = this._easel.getMouseWorldPosition(event);
      var position = this._easel.getMousePosition(event, this._content);
      var point = new Point(position.x, position.y);

      var buffer = new DataBuffer();
      var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
      serializer.output = buffer;
      serializer.writeMouseEvent(event, point);
      this.onSendUpdates(buffer, []);
    }

    private _keyboardEventListener(event: KeyboardEvent) {
      var buffer = new DataBuffer();
      var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
      serializer.output = buffer;
      serializer.writeKeyboardEvent(event);
      this.onSendUpdates(buffer, []);
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

      this._easel.addEventListener('resize', this._resizeEventListener.bind(this));
    }

    private _sendFocusEvent(type: Shumway.Remoting.FocusEventType) {
      var buffer = new DataBuffer();
      var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
      serializer.output = buffer;
      serializer.writeFocusEvent(type);
      this.onSendUpdates(buffer, []);
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

    private _resizeEventListener() {
      this.onDisplayParameters(this._easel.getDisplayParameters());
    }

    onDisplayParameters(params: DisplayParameters) {
      throw new Error('This method is abstract');
    }

    processUpdates(updates: DataBuffer, assets: Array<DataBuffer>, output: DataBuffer = null) {
      var deserializer = new Shumway.Remoting.GFX.GFXChannelDeserializer();
      deserializer.input = updates;
      deserializer.inputAssets = assets;
      deserializer.output = output;
      deserializer.context = this._context;
      deserializer.read();
    }

    processVideoControl(id: number, eventType: VideoControlEvent, data: any): any {
      var context = this._context;
      var asset = context._getVideoAsset(id);
      if (!asset) {
        if (eventType !== VideoControlEvent.Init) {
          return undefined;
        }
        context.registerVideo(id);
        asset = context._getVideoAsset(id);
      }
      return (<RenderableVideo>asset).processControlRequest(eventType, data);
    }

    processRegisterFont(syncId: number, data: Uint8Array, resolve: (data: any) => void) {
      this._context.registerFont(syncId, data, resolve);
    }
    processRegisterImage(syncId: number, symbolId: number, imageType: ImageType, data: Uint8Array,
                         alphaData: Uint8Array, resolve: (data: any) => void) {
      this._context.registerImage(syncId, symbolId, imageType, data, alphaData, resolve);
    }

    processFSCommand(command: string, args: string) {
      if (typeof ShumwayCom !== 'undefined' && ShumwayCom.environment === ShumwayEnvironment.TEST) {
        ShumwayCom.processFSCommand(command, args);
      }
    }

    processFrame() {
      if (typeof ShumwayCom !== 'undefined' && ShumwayCom.environment === ShumwayEnvironment.TEST) {
        ShumwayCom.processFrame();
      }
    }
    
    processPreview() {
      throw new Error('This method is abstract');
    }

    onVideoPlaybackEvent(id: number, eventType: VideoPlaybackEvent, data: any) {
      throw new Error('This method is abstract');
    }

    sendVideoPlaybackEvent(id: number, eventType: VideoPlaybackEvent, data: any) {
      this.onVideoPlaybackEvent(id, eventType, data);
    }
  }
}
