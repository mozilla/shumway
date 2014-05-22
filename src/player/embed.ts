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

    private _worker: Worker;
    private _channelEventUpdatesListener: (updates: DataBuffer) => void;
    private _channelUpdatesListener: (updates: DataBuffer, assets: Array<DataBuffer>) => void;

    constructor(easel: Easel) {
      this._easelHost = new EaselHost(easel, this);

      // TODO this is temporary worker to test postMessage tranfers
      this._worker = new Worker('../../src/player/fakechannel.js');
      this._worker.addEventListener('message', this._onWorkerMessage.bind(this));
    }

    private _onWorkerMessage(e) {
      var type = e.data.type;
      switch (type) {
        case 'player':
          var updates = DataBuffer.fromArrayBuffer(e.data.updates.buffer);
          var assets = e.data.assets.map(function (assetBytes) {
            return DataBuffer.fromArrayBuffer(assetBytes.buffer);
          });
          this._channelUpdatesListener(updates, assets);
          break;
        case 'gfx':
          var updates = DataBuffer.fromArrayBuffer(e.data.updates.buffer);
          this._channelEventUpdatesListener(updates);
          break;
      }
    }

    // IPlayerChannel
    sendUpdates(updates: DataBuffer, assets: Array<DataBuffer>) : void {
      var bytes = updates.getBytes();
      var assetsBytes = assets.map(function (asset) {
        return asset.getBytes();
      });
      this._worker.postMessage({
        type: 'player',
        updates: bytes,
        assets: assetsBytes
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
