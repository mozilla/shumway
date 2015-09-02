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
    private _peer: Shumway.Remoting.ITransportPeer;
    private _assetDecodingRequests: PromiseWrapper<any>[];

    constructor(sec: ISecurityDomain, peer: Shumway.Remoting.ITransportPeer) {
      super(sec);
      this._peer = peer;
      this._peer.onAsyncMessage = function (msg) {
        this.onWindowMessage(msg);
      }.bind(this);
      this._assetDecodingRequests = [];
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
      this._peer.postAsyncMessage(message, transferList);
    }

    updateAndGet(updates: DataBuffer, assets: any[]): any {
      var bytes = updates.getBytes();
      var message = {
        type: 'player',
        updates: bytes,
        assets: assets,
        result: undefined
      };
      var result = this._peer.sendSyncMessage(message);
      return DataBuffer.FromPlainObject(result);
    }

    frame(): void {
      this._peer.postAsyncMessage({
        type: 'frame'
      });
    }
    
    preview() {
      this._peer.postAsyncMessage({
        type: 'preview'
      });
    }

    videoControl(id: number, eventType: VideoControlEvent, data: any): any {
      var message = {
        type: 'videoControl',
        id: id,
        eventType: eventType,
        data: data,
        result: undefined
      };
      return this._peer.sendSyncMessage(message);
    }

    registerFont(syncId: number, data: Uint8Array): Promise<any> {
      var requestId = this._assetDecodingRequests.length;
      var result = new PromiseWrapper<any>();
      this._assetDecodingRequests[requestId] = result;
      var message = {
        type: 'registerFont',
        syncId: syncId,
        data: data,
        requestId: requestId
      };
      // Unfortunately we have to make this message synchronously since scripts in the same frame
      // might rely on it being available in the gfx backend when requesting text measurements.
      // Just another disadvantage of not doing our our own text shaping.
      this._peer.sendSyncMessage(message);
      return result.promise;
    }

    registerImage(syncId: number, symbolId: number, imageType: ImageType,
                  data: Uint8Array, alphaData: Uint8Array): Promise<any> {
      var requestId = this._assetDecodingRequests.length;
      var result = new PromiseWrapper<any>();
      this._assetDecodingRequests[requestId] = result;
      var message = {
        type: 'registerImage',
        syncId: syncId,
        symbolId: symbolId,
        imageType: imageType,
        data: data,
        alphaData: alphaData,
        requestId: requestId
      };
      this._peer.postAsyncMessage(message);
      return result.promise;
    }

    fscommand(command: string, args: string): void {
      this._peer.postAsyncMessage({
        type: 'fscommand',
        command: command,
        args: args
      });
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
          case 'registerFontResponse':
          case 'registerImageResponse':
            var request = this._assetDecodingRequests[data.requestId];
            release || Debug.assert(request);
            delete this._assetDecodingRequests[data.requestId];
            request.resolve(data.result);
            break;
          case 'options':
            Shumway.Settings.setSettings(data.settings);
            break;
        }
      }
    }
  }
}
