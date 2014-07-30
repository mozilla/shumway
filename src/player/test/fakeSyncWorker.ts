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
  export class FakeSyncWorker {
    public static WORKER_PATH = '../../src/player/fakechannel.js';

    private static _singelton: FakeSyncWorker;

    public static get instance() {
      if (!FakeSyncWorker._singelton) {
        FakeSyncWorker._singelton = new FakeSyncWorker();
      }
      return FakeSyncWorker._singelton;
    }

    private _worker: Worker;
    private _onsyncmessageListeners: any[];

    constructor() {
      this._worker = new Worker(FakeSyncWorker.WORKER_PATH);
      this._onsyncmessageListeners = [];
    }

    addEventListener(type: string, listener: any, useCapture?: boolean): void {
      if (type !== 'syncmessage') {
        this._worker.addEventListener(type, listener, useCapture);
      } else {
        this._onsyncmessageListeners.push(listener);
      }
    }

    removeEventListener(type: string, listener: any, useCapture?: boolean): void {
      if (type === 'syncmessage') {
        var i = this._onsyncmessageListeners.indexOf(listener);
        if (i >= 0) {
          this._onsyncmessageListeners.splice(i, 1);
        }
        return;
      }
      this._worker.removeEventListener(type, listener, useCapture);

    }

    postMessage(message: any, ports?: any): void {
      this._worker.postMessage(message, ports);
    }

    postSyncMessage(message: any, ports?: any): any {
      var listener = this._onsyncmessageListeners[0];
      if (listener) {
        var ev = { data: message };
        if (typeof listener === 'function') {
          return listener(ev);
        } else {
          return listener.handleEvent(ev);
        }
      }
    }
  }
}
