/**
 * Copyright 2015 Mozilla Foundation
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

module Shumway.GFX.Test {
  import WindowEaselHost = Shumway.GFX.Window.WindowEaselHost;

  export class RecordingEaselHost extends WindowEaselHost {
    private _recorder: MovieRecorder = null;

    public get recorder(): MovieRecorder  {
      return this._recorder;
    }

    constructor(easel: Easel, peer: Shumway.Remoting.ITransportPeer, recordingLimit: number = 0) {
      super(easel, peer);

      this._recorder = new MovieRecorder(recordingLimit);
    }

    _onWindowMessage(data: any, async: boolean): any {
      release || Debug.assert(typeof data === 'object' && data !== null);
      var type = data.type;
      switch (type) {
        case 'player':
          this._recorder.recordPlayerCommand(async, data.updates, data.assets);
          break;
        case 'frame':
          this._recorder.recordFrame();
          break;
        case 'registerFont':
          this._recorder.recordFont(data.syncId, data.data);
          break;
        case 'registerImage':
          this._recorder.recordImage(data.syncId, data.symbolId, data.imageType,
                                     data.data, data.alphaData);
          break;
        case 'fscommand':
          this._recorder.recordFSCommand(data.command, data.args);
          break;
      }

      return super._onWindowMessage(data, async);
    }
  }
}
