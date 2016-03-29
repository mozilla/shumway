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

module Shumway.GFX.Window {
  import Easel = Shumway.GFX.Easel;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;

  import CircularBuffer = Shumway.CircularBuffer;

  import VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;
  import DisplayParameters = Shumway.Remoting.DisplayParameters;

  export class WindowEaselHost extends EaselHost {
    private _peer: Shumway.Remoting.ITransportPeer;

    public constructor(easel: Easel, peer: Shumway.Remoting.ITransportPeer) {
      super(easel);
      this._peer = peer;
      this._peer.onSyncMessage = function (msg) {
        return this._onWindowMessage(msg, false);
      }.bind(this);
      this._peer.onAsyncMessage = function (msg) {
        this._onWindowMessage(msg, true);
      }.bind(this);
    }

    onSendUpdates(updates: DataBuffer, assets: Array<DataBuffer>) {
      var bytes = updates.getBytes();
      this._peer.postAsyncMessage({
        type: 'gfx',
        updates: bytes,
        assets: assets
      }, [bytes.buffer]);
    }

    onDisplayParameters(params: DisplayParameters) {
      this._peer.postAsyncMessage({
        type: 'displayParameters',
        params: params
      });
    }

    onVideoPlaybackEvent(id: number, eventType: VideoPlaybackEvent, data: any) {
      this._peer.postAsyncMessage({
        type: 'videoPlayback',
        id: id,
        eventType: eventType,
        data: data
      });
    }

    private _sendRegisterFontResponse(requestId: number, result: any) {
      this._peer.postAsyncMessage({
        type: 'registerFontResponse',
        requestId: requestId,
        result: result
      });
    }

    private _sendRegisterImageResponse(requestId: number, result: any) {
      this._peer.postAsyncMessage({
        type: 'registerImageResponse',
        requestId: requestId,
        result: result
      });
    }

    _onWindowMessage(data: any, async: boolean): any {
      var result;
      if (typeof data === 'object' && data !== null) {
        if (data.type === 'player') {
          var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
          if (async) {
            this.processUpdates(updates, data.assets);
          } else {
            var output = new DataBuffer();
            this.processUpdates(updates, data.assets, output);
            result = output.toPlainObject();
          }
        } else if (data.type === 'frame') {
          this.processFrame();
        } else if (data.type === 'videoControl') {
          result = this.processVideoControl(data.id, data.eventType, data.data);
        } else if (data.type === 'registerFont') {
          this.processRegisterFont(data.syncId, data.data,
                                   this._sendRegisterFontResponse.bind(this, data.requestId));
        } else if (data.type === 'registerImage') {
          this.processRegisterImage(data.syncId, data.symbolId, data.imageType, data.data, data.alphaData,
                                    this._sendRegisterImageResponse.bind(this, data.requestId));
        } else if (data.type === 'fscommand') {
          this.processFSCommand(data.command, data.args);
        } else {
          // release || Debug.assertUnreachable("Unhandled remoting event " + data.type);
        }
      }
      return result;
    }
  }
}
