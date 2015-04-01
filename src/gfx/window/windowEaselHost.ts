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
  import TimelineBuffer = Shumway.Tools.Profiler.TimelineBuffer;

  import VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;
  import DisplayParameters = Shumway.Remoting.DisplayParameters;

  export class WindowEaselHost extends EaselHost {
    private _timelineRequests: MapObject<(data) => void>;
    private _window;
    private _playerWindow;

    public constructor(easel: Easel, playerWindow, window) {
      super(easel);
      this._timelineRequests = Object.create(null);
      this._playerWindow = playerWindow;
      this._window = window;
      this._window.addEventListener('message', function (e) {
        this.onWindowMessage(e.data);
      }.bind(this));
      if (typeof ShumwayCom !== 'undefined') {
        ShumwayCom.setSyncMessageCallback(function (msg) {
          this.onWindowMessage(msg, false);
          return msg.result;
        }.bind(this));
      } else {
        this._window.addEventListener('syncmessage', function (e) {
          this.onWindowMessage(e.detail, false);
        }.bind(this));
      }
    }

    onSendUpdates(updates: DataBuffer, assets: Array<DataBuffer>) {
      var bytes = updates.getBytes();
      this._playerWindow.postMessage({
        type: 'gfx',
        updates: bytes,
        assets: assets
      }, '*', [bytes.buffer]);
    }

    onDisplayParameters(params: DisplayParameters) {
      this._playerWindow.postMessage({
        type: 'displayParameters',
        params: params
      }, '*');
    }

    onVideoPlaybackEvent(id: number, eventType: VideoPlaybackEvent, data: any) {
      this._playerWindow.postMessage({
        type: 'videoPlayback',
        id: id,
        eventType: eventType,
        data: data
      }, '*');
    }

    public requestTimeline(type: string, cmd: string): Promise<TimelineBuffer> {
      return new Promise(function (resolve) {
        this._timelineRequests[type] = resolve;
        this._playerWindow.postMessage({
          type: 'timeline',
          cmd: cmd,
          request: type
        }, '*');
      }.bind(this));
    }

    private _sendRegisterFontOrImageResponse(requestId: number, result: any) {
      this._playerWindow.postMessage({
        type: 'registerFontOrImageResponse',
        requestId: requestId,
        result: result
      }, '*');
    }

    private onWindowMessage(data, async: boolean = true) {
      if (typeof data === 'object' && data !== null) {
        if (data.type === 'player') {
          var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
          if (async) {
            this.processUpdates(updates, data.assets);
          } else {
            var output = new DataBuffer();
            this.processUpdates(updates, data.assets, output);
            data.result = output.toPlainObject();
          }
        } else if (data.type === 'frame') {
          this.processFrame();
        } else if (data.type === 'videoControl') {
          data.result = this.processVideoControl(data.id, data.eventType, data.data);
        } else if (data.type === 'registerFontOrImage') {
          this.processRegisterFontOrImage(data.syncId, data.symbolId, data.assetType, data.data,
            this._sendRegisterFontOrImageResponse.bind(this, data.requestId));
        } else if (data.type === 'fscommand') {
          this.processFSCommand(data.command, data.args);
        } else if (data.type === 'timelineResponse' && data.timeline) {
          // Transform timeline into a Timeline object.
          data.timeline.__proto__ = TimelineBuffer.prototype;
          data.timeline._marks.__proto__ = CircularBuffer.prototype;
          data.timeline._times.__proto__ = CircularBuffer.prototype;
          this._timelineRequests[data.request](<TimelineBuffer>data.timeline);
        } else {
          // release || Debug.assertUnreachable("Unhandled remoting event " + data.type);
        }
      }
    }
  }
}
