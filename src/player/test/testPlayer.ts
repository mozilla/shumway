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
  import IPlayerChannel = Shumway.Remoting.IPlayerChannel;
  import Player = Shumway.Player.Player;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;

  export class TestPlayer extends Player implements IPlayerChannel {
    private _channelEventUpdatesListener: (updates: DataBuffer) => void;
    private _worker;

    constructor() {
      super(this);

      // TODO this is temporary worker to test postMessage tranfers
      this._worker = Shumway.Player.Test.FakeSyncWorker.instance;
      this._worker.addEventListener('message', this._onWorkerMessage.bind(this));
      this._worker.onsyncmessage = this._onWorkerMessage.bind(this);
    }

    public sendUpdates(updates: DataBuffer, assets: Array<DataBuffer>) {
      var bytes = updates.getBytes();
      this._worker.postMessage({
        type: 'player',
        updates: bytes,
        assets: assets
      }, [bytes.buffer]);
    }

    public registerForEventUpdates(listener: (updates: DataBuffer) => void) {
      this._channelEventUpdatesListener = listener;
    }

    private _onWorkerMessage(e) {
      var data = e.data;
      if (typeof data !== 'object' || data === null) {
        return;
      }
      switch (data.type) {
        case 'gfx':
          if (!this._channelEventUpdatesListener) {
            return;
          }
          var updates = DataBuffer.FromArrayBuffer(e.data.updates.buffer);
          this._channelEventUpdatesListener(updates);
          break;
      }
    }
  }
}