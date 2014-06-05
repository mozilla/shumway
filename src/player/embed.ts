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

module Shumway {
  import IGFXChannel = Shumway.Remoting.IGFXChannel;
  import IPlayerChannel = Shumway.Remoting.IPlayerChannel;

  import Easel = Shumway.GFX.Easel;

  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;

  export class EaselEmbedding implements IPlayerChannel, IGFXChannel {

    private _player: Player;
    private _easelHost: EaselHost;

    private _worker: Shumway.FakeSyncWorker;
    private _channelEventUpdatesListener: (updates: DataBuffer) => void;
    private _channelUpdatesListener: (updates: DataBuffer, assets: Array<DataBuffer>) => void;

    constructor(easel: Easel) {
      this._easelHost = new EaselHost(easel, this);

      // TODO this is temporary worker to test postMessage tranfers
      this._worker = new Shumway.FakeSyncWorker('../../src/player/fakechannel.js');
      this._worker.addEventListener('message', this._onWorkerMessage.bind(this));
      this._worker.onsyncmessage = this._onWorkerMessage.bind(this);
    }

    private _onWorkerMessage(e) {
      var type = e.data.type;
      switch (type) {
        case 'player':
          var updates = DataBuffer.FromArrayBuffer(e.data.updates.buffer);
          this._channelUpdatesListener(updates, e.data.assets);
          break;
        case 'gfx':
          var updates = DataBuffer.FromArrayBuffer(e.data.updates.buffer);
          this._channelEventUpdatesListener(updates);
          break;
      }
    }

    // IPlayerChannel
    sendUpdates(updates: DataBuffer, assets: any[]) : void {
      var bytes = updates.getBytes();
      this._worker.postMessage({
        type: 'player',
        updates: bytes,
        assets: assets,
      }, [bytes.buffer]);
    }
    registerForEventUpdates(listener: (updates: DataBuffer) => void) : void {
      this._channelEventUpdatesListener = listener;
    }

    // IGFXChannel
    registerForUpdates(listener: (updates: DataBuffer, assets: Array<DataBuffer>) => void) {
      this._channelUpdatesListener = listener;
    }
    sendEventUpdates(updates: DataBuffer) {
      var bytes = updates.getBytes();
      this._worker.postMessage({type: 'gfx', updates: bytes}, [bytes.buffer]);
    }

    public embed(): Player {
      return this._player = new Shumway.Player(this);
    }
  }
}
