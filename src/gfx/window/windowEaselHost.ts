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

  export class WindowEaselHost extends EaselHost {
    private _timelineRequests: Map<(data) => void>;
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
      this._window.addEventListener('syncmessage', function (e) {
        this.onWindowMessage(e.detail, false);
      }.bind(this));
    }

    onSendEventUpdates(updates: DataBuffer) {
      var bytes = updates.getBytes();
      this._playerWindow.postMessage({
        type: 'gfx',
        updates: bytes
      }, '*', [bytes.buffer]);
    }

    onExernalCallback(request) {
      var event = this._playerWindow.document.createEvent('CustomEvent');
      event.initCustomEvent('syncmessage', false, false, {
        type: 'externalCallback',
        request: request
      });
      this._playerWindow.dispatchEvent(event);
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
        } else if (data.type === 'external') {
          this.processExternalCommand(data.request);
        } else if (data.type === 'timelineResponse' && data.timeline) {
          // Transform timeline into a Timeline object.
          data.timeline.__proto__ = TimelineBuffer.prototype;
          data.timeline._marks.__proto__ = CircularBuffer.prototype;
          data.timeline._times.__proto__ = CircularBuffer.prototype;
          this._timelineRequests[data.request](<TimelineBuffer>data.timeline);
        }
      }
    }
  }
}
