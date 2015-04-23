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

module Shumway.Player.Test {
  import Player = Shumway.Player.Player;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;

  import VideoControlEvent = Shumway.Remoting.VideoControlEvent;

  export class TestGFXService extends GFXServiceBase {
    private _worker;
    private _assetDecodingRequests: PromiseWrapper<any>[];

    constructor(sec: ISecurityDomain) {
      super(sec);

      // TODO this is temporary worker to test postMessage tranfers
      this._worker = Shumway.Player.Test.FakeSyncWorker.instance;
      this._worker.addEventListener('message', this._onWorkerMessage.bind(this));
      this._assetDecodingRequests = [];
    }

    update(updates: DataBuffer, assets: any[]): void {
      var bytes = updates.getBytes();
      var message = {
        type: 'player',
        updates: bytes,
        assets: assets
      };
      var transferList = [bytes.buffer];
      this._worker.postMessage(message, transferList);
    }

    updateAndGet(updates: DataBuffer, assets: any[]): any {
      var bytes = updates.getBytes();
      var message = {
        type: 'player',
        updates: bytes,
        assets: assets
      };
      var transferList = [bytes.buffer];
      var result = this._worker.postSyncMessage(message, transferList);
      return DataBuffer.FromPlainObject(result);
    }

    frame(): void {
      this._worker.postMessage({
        type: 'frame'
      });
    }

    videoControl(id: number, eventType: VideoControlEvent, data: any): any {
      return this._worker.postSyncMessage({
        type: 'videoControl',
        id: id,
        eventType: eventType,
        data: data
      });
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
      this._worker.postMessage(message);
      return result.promise;
    }

    registerImage(syncId: number, symbolId: number, imageType: ImageType,
                  data: Uint8Array): Promise<any> {
      var requestId = this._assetDecodingRequests.length;
      var result = new PromiseWrapper<any>();
      this._assetDecodingRequests[requestId] = result;
      var message = {
        type: 'registerImage',
        syncId: syncId,
        symbolId: symbolId,
        imageType: imageType,
        data: data,
        requestId: requestId
      };
      this._worker.postMessage(message);
      return result.promise;
    }

    fscommand(command: string, args: string): void {
      this._worker.postMessage({
        type: 'fscommand',
        command: command,
        args: args
      });
    }

    private _onWorkerMessage(e) {
      var data = e.data;
      if (typeof data !== 'object' || data === null) {
        return;
      }
      switch (data.type) {
        case 'gfx':
          var updates = DataBuffer.FromArrayBuffer(e.data.updates.buffer);
          this.processUpdates(updates, e.data.assets);
          break;
        case 'videoPlayback':
          this.processVideoEvent(data.id, data.eventType, data.data);
          return;
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
      }
    }
  }
}
