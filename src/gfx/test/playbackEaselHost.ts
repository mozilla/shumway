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
  import Easel = Shumway.GFX.Easel;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;

  import CircularBuffer = Shumway.CircularBuffer;

  import VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;
  import DisplayParameters = Shumway.Remoting.DisplayParameters;

  var MINIMAL_TIMER_INTERVAL = 5;

  export class PlaybackEaselHost extends EaselHost {
    private _parser: MovieRecordParser;
    private _lastTimestamp: number;

    public ignoreTimestamps: boolean = false;
    public alwaysRenderFrame: boolean = false;
    public cpuTimeUpdates: number = 0;
    public cpuTimeRendering: number = 0;

    public onComplete: () => void = null;

    public constructor(easel: Easel) {
      super(easel);
    }

    public get cpuTime(): number {
      return this.cpuTimeUpdates + this.cpuTimeRendering;
    }

    private playUrl(url: string) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function () {
        this.playBytes(new Uint8Array(xhr.response));
      }.bind(this);
      xhr.send();
    }

    private playBytes(data: Uint8Array) {
      this._parser = new MovieRecordParser(data);
      this._lastTimestamp = 0;
      this._parseNext();
    }

    onSendUpdates(updates: DataBuffer, assets: Array<DataBuffer>) {
      // Ignoring
    }

    onDisplayParameters(params: DisplayParameters) {
      // Ignoring
    }

    onVideoPlaybackEvent(id: number, eventType: VideoPlaybackEvent, data: any) {
      // Ignoring
    }

    private _parseNext() {
      var type = this._parser.readNextRecord();
      if (type !== MovieRecordType.None) {
        var runRecordBound = this._runRecord.bind(this);
        var interval = this._parser.currentTimestamp - this._lastTimestamp;
        this._lastTimestamp = this._parser.currentTimestamp;
        if (interval < MINIMAL_TIMER_INTERVAL) {
          // Records are too close to each other, running on next script turn.
          Promise.resolve(undefined).then(runRecordBound);
        } else if (this.ignoreTimestamps) {
          setTimeout(runRecordBound);
        } else {
          setTimeout(runRecordBound, interval);
        }
      } else {
        if (this.onComplete) {
          this.onComplete();
        }
      }
    }

    private _runRecord() {
      var data;
      var start = performance.now();
      switch (this._parser.currentType) {
        case MovieRecordType.PlayerCommand:
        case MovieRecordType.PlayerCommandAsync:
          data = this._parser.parsePlayerCommand();
          var async = this._parser.currentType === MovieRecordType.PlayerCommandAsync;
          var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
          if (async) {
            this.processUpdates(updates, data.assets);
          } else {
            var output = new DataBuffer();
            this.processUpdates(updates, data.assets, output);
          }
          break;
        case MovieRecordType.Frame:
          this.processFrame();
          break;
        case MovieRecordType.Font:
          data = this._parser.parseFont();
          this.processRegisterFont(data.syncId, data.data, function () {});
          break;
        case MovieRecordType.Image:
          data = this._parser.parseImage();
          this.processRegisterImage(data.syncId, data.symbolId, data.imageType, data.data,
                                    data.alphaData, function () {});
          break;
        case MovieRecordType.FSCommand:
          data = this._parser.parseFSCommand();
          this.processFSCommand(data.command, data.args);
          break;
        default:
          throw new Error('Invalid movie record type');
      }
      this.cpuTimeUpdates += performance.now() - start;

      if (this._parser.currentType === MovieRecordType.Frame &&
          this.alwaysRenderFrame) {
        requestAnimationFrame(this._renderFrameJustAfterRAF.bind(this));
      } else {
        this._parseNext();
      }
    }

    private _renderFrameJustAfterRAF() {
      var start = performance.now();
      this.easel.render();
      this.cpuTimeRendering += performance.now() - start;

      this._parseNext();
    }
  }
}
