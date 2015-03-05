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

module Shumway.Player.Window {
  import Player = Shumway.Player.Player;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;

  import VideoControlEvent = Shumway.Remoting.VideoControlEvent;

  export class WindowGFXService extends GFXServiceBase {
    private _window;
    private _parent;
    private _fontOrImageRequests: PromiseWrapper<any>[];

    constructor(window, parent?) {
      super();

      this._window = window;
      this._parent = parent || window.parent;
      this._window.addEventListener('message', function (e) {
        this.onWindowMessage(e.data);
      }.bind(this));
      this._fontOrImageRequests = [];
    }

    update(updates: DataBuffer, assets: any[]): void {
      var bytes = updates.getBytes();
      var message = {
        type: 'player',
        updates: bytes,
        assets: assets,
        result: undefined
      };
      var transferList = [bytes.buffer];
      this._parent.postMessage(message, '*', transferList);
    }

    updateAndGet(updates: DataBuffer, assets: any[]): any {
      var bytes = updates.getBytes();
      var message = {
        type: 'player',
        updates: bytes,
        assets: assets,
        result: undefined
      };
      var result = this._sendSyncMessage(message);
      return DataBuffer.FromPlainObject(result);
    }

    frame(): void {
      this._parent.postMessage({
        type: 'frame'
      }, '*');
    }

    videoControl(id: number, eventType: VideoControlEvent, data: any): any {
      var message = {
        type: 'videoControl',
        id: id,
        eventType: eventType,
        data: data,
        result: undefined
      };
      return this._sendSyncMessage(message);
    }

    private _sendSyncMessage(message) {
      if (typeof ShumwayCom !== 'undefined' && ShumwayCom.postSyncMessage) {
        return ShumwayCom.postSyncMessage(message);
      }

      var event = this._parent.document.createEvent('CustomEvent');
      event.initCustomEvent('syncmessage', false, false, message);
      this._parent.dispatchEvent(event);
      return message.result;
    }

    registerFont(syncId: number, data: any): Promise<any> {
      var requestId = this._fontOrImageRequests.length;
      var result = new PromiseWrapper<any>();
      this._fontOrImageRequests[requestId] = result;
      var message = {
        type: 'registerFontOrImage',
        syncId: syncId,
        assetType: 'font',
        data: data,
        requestId: requestId
      };
      this._parent.postMessage(message, '*');
      return result.promise;
    }

    registerImage(syncId: number, symbolId: number, data: any): Promise<any> {
      var requestId = this._fontOrImageRequests.length;
      var result = new PromiseWrapper<any>();
      this._fontOrImageRequests[requestId] = result;
      var message = {
        type: 'registerFontOrImage',
        syncId: syncId,
        symbolId: symbolId,
        assetType: 'image',
        data: data,
        requestId: requestId
      };
      this._parent.postMessage(message, '*');
      return result.promise;
    }

    fscommand(command: string, args: string): void {
      this._parent.postMessage({
        type: 'fscommand',
        command: command,
        args: args
      }, '*');
    }

    private onWindowMessage(data) {
      if (typeof data === 'object' && data !== null) {
        switch (data.type) {
          case 'gfx':
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
            this.processUpdates(updates, data.assets);
            break;
          case 'videoPlayback':
            this.processVideoEvent(data.id, data.eventType, data.data);
            break;
          case 'displayParameters':
            this.processDisplayParameters(data.params);
            break;
          case 'options':
            Shumway.Settings.setSettings(data.settings);
            break;
          case 'timeline':
            switch (data.request) {
              case 'AVM2':
                if (data.cmd === 'clear') {
                  Shumway.AVM2.timelineBuffer.reset();
                  break;
                }
                this._parent.postMessage({
                  type: 'timelineResponse',
                  request: data.request,
                  timeline: Shumway.AVM2.timelineBuffer
                }, '*');
                break;
              case 'Player':
                if (data.cmd === 'clear') {
                  Shumway.Player.timelineBuffer.reset();
                  break;
                }
                this._parent.postMessage({
                  type: 'timelineResponse',
                  request: data.request,
                  timeline: Shumway.Player.timelineBuffer
                }, '*');
                break;
              case 'SWF':
                if (data.cmd === 'clear') {
                  Shumway.SWF.timelineBuffer.reset();
                  break;
                }
                this._parent.postMessage({
                  type: 'timelineResponse',
                  request: data.request,
                  timeline: Shumway.SWF.timelineBuffer
                }, '*');
                break;
            }
            break;
        }
      }
    }
  }
}
