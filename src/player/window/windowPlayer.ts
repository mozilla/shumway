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

  export class WindowPlayer extends Player {
    private _window;
    private _parent;

    constructor(window, parent?) {
      super();
      this._window = window;
      this._parent = parent || window.parent;
      this._window.addEventListener('message', function (e) {
        this.onWindowMessage(e.data);
      }.bind(this));
    }

    public onSendUpdates(updates: DataBuffer, assets: Array<DataBuffer>) {
      var bytes = updates.getBytes();
      this._parent.postMessage({
        type: 'player',
        updates: bytes,
        assets: assets
      }, '*', [bytes.buffer]);
    }

    private onWindowMessage(data) {
      if (typeof data === 'object' && data !== null) {
        switch (data.type) {
          case 'gfx':
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
            this.processEventUpdates(updates);
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
                  type:'timelineResponse',
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
                  type:'timelineResponse',
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