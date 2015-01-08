/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference path='references.ts'/>
module Shumway.SWF {
  export var MP3WORKER_PATH: string = '../../lib/mp3/mp3worker.js';

  var mp3Worker: Worker = null;

  function ensureMP3Worker(): Worker {
    if (!mp3Worker) {
      mp3Worker = new Worker(MP3WORKER_PATH);
      mp3Worker.addEventListener('message', function (e) {
        if (e.data.action === 'console') {
          console[e.data.method].call(console, e.data.message);
        }
      });
    }
    return mp3Worker;
  }

  var nextSessionId: number = 0;

  export class MP3DecoderSession {
    private _sessionId: number;
    private _onworkermessageBound: (any) => void;
    private _worker: Worker;

    public onframedata: (frameData: Uint8Array, channels: number, sampleRate: number, bitRate: number) => void;
    public onid3tag: (tagData: any) => void;
    public onclosed: () => void;
    public onerror: (error: string) => void;

    public constructor() {
      this._sessionId = (nextSessionId++);
      this._onworkermessageBound = this.onworkermessage.bind(this);
      this._worker = ensureMP3Worker();
      this._worker.addEventListener('message', this._onworkermessageBound, false);
      this._worker.postMessage({
        sessionId: this._sessionId,
        action: 'create'
      });
    }

    private onworkermessage(e) {
      if (e.data.sessionId !== this._sessionId)
        return;
      var action = e.data.action;
      switch (action) {
        case 'closed':
          if (this.onclosed) {
            this.onclosed();
          }
          this._worker.removeEventListener('message', this._onworkermessageBound, false);
          this._worker = null;
          break;
        case 'frame':
          this.onframedata(e.data.frameData, e.data.channels,
            e.data.sampleRate, e.data.bitRate);
          break;
        case 'id3':
          if (this.onid3tag) {
            this.onid3tag(e.data.id3Data);
          }
          break;
        case 'error':
          if (this.onerror) {
            this.onerror(e.data.message);
          }
          break;
      }
    }

    pushAsync(data) {
      this._worker.postMessage({
        sessionId: this._sessionId,
        action: 'decode',
        data: data
      });
    }

    close() {
      this._worker.postMessage({
        sessionId: this._sessionId,
        action: 'close'
      });
    }


    public static processAll(data: Uint8Array): Promise<{data:Uint8Array; id3Tags: any;}> {
      var currentBufferSize = 8000;
      var currentBuffer = new Float32Array(currentBufferSize);
      var bufferPosition = 0;
      var id3Tags = [];
      var sessionAborted = false;

      var promiseWrapper = new PromiseWrapper<{data:Uint8Array; id3Tags: any;}>();
      var session = new MP3DecoderSession();
      session.onframedata = function (frameData, channels, sampleRate, bitRate) {
        var needed = frameData.length + bufferPosition;
        if (needed > currentBufferSize) {
          do {
            currentBufferSize *= 2;
          } while (needed > currentBufferSize);
          var newBuffer = new Float32Array(currentBufferSize);
          newBuffer.set(currentBuffer);
          currentBuffer = newBuffer;
        }
        currentBuffer.set(frameData, bufferPosition);
        bufferPosition += frameData.length;
      };
      session.onid3tag = function (tagData) {
        id3Tags.push(tagData);
      };
      session.onclosed = function () {
        if (sessionAborted)
          return;
        promiseWrapper.resolve({data: currentBuffer.subarray(0, bufferPosition), id3Tags: id3Tags});
      };
      session.onerror = function (error) {
        if (sessionAborted)
          return;
        sessionAborted = true;
        promiseWrapper.reject(error);
      };
      session.pushAsync(data);
      session.close();

      return promiseWrapper.promise;
    }
  }
}