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
  import Easel = Shumway.GFX.Easel;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;

  import CircularBuffer = Shumway.CircularBuffer;
  import TimelineBuffer = Shumway.Tools.Profiler.TimelineBuffer;

  export class TestEaselHost extends EaselHost {
    private _worker;

    public constructor(easel: Easel) {
      super(easel);

      // TODO this is temporary worker to test postMessage tranfers
      this._worker = Shumway.Player.Test.FakeSyncWorker.instance;
      this._worker.addEventListener('message', this._onWorkerMessage.bind(this));
      this._worker.addEventListener('syncmessage', this._onWorkerMessage.bind(this));
    }

    onSendEventUpdates(updates: DataBuffer) {
      var bytes = updates.getBytes();
      this._worker.postMessage({
        type: 'gfx',
        updates: bytes
      }, [bytes.buffer]);
    }

    onExernalCallback(request) {
      this._worker.postSyncMessage({
        type: 'externalCallback',
        request: request
      });
    }

    requestTimeline(type: string, cmd: string): Promise<TimelineBuffer> {
      var buffer: TimelineBuffer;
      switch (type) {
        case 'AVM2':
          if (cmd === 'clear') {
            Shumway.AVM2.timelineBuffer.reset();
          } else {
            buffer = Shumway.AVM2.timelineBuffer;
          }
          break;
        case 'Player':
          if (cmd === 'clear') {
            Shumway.Player.timelineBuffer.reset();
          } else {
            buffer = Shumway.Player.timelineBuffer;
          }
          break;
        case 'SWF':
          if (cmd === 'clear') {
            Shumway.SWF.timelineBuffer.reset();
          } else {
            buffer = Shumway.SWF.timelineBuffer;
          }
          break;
      }
      return Promise.resolve(buffer);
    }

    private _onWorkerMessage(e) {
      var data = e.data;
      if (typeof data !== 'object' || data === null) {
        return;
      }
      var type = data.type;
      switch (type) {
        case 'player':
          var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
          this.processUpdates(updates, data.assets);
          break;
        case 'external':
          this.processExternalCommand(data.command);
          break;
      }
    }
  }
}
