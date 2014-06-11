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

  export class TestPlayer extends Player {
    private _worker;

    constructor() {
      super();

      // TODO this is temporary worker to test postMessage tranfers
      this._worker = Shumway.Player.Test.FakeSyncWorker.instance;
      this._worker.addEventListener('message', this._onWorkerMessage.bind(this));
      this._worker.addEventListener('syncmessage', this._onWorkerMessage.bind(this));
    }

    public onSendUpdates(updates: DataBuffer, assets: Array<DataBuffer>) {
      var bytes = updates.getBytes();
      this._worker.postMessage({
        type: 'player',
        updates: bytes,
        assets: assets
      }, [bytes.buffer]);
    }

    onExternalCommand(command) {
      this._worker.postSyncMessage({
        type: 'external',
        command: command
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
          this.processEventUpdates(updates);
          break;
        case 'externalCallback':
          this.processExternalCallback(data.request);
          return;
      }
    }
  }
}
