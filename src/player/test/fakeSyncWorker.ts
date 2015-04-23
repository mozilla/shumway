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

    //private _worker: Worker;
    private _onmessageListeners: any[];
    private _onsyncmessageListeners: any[];

    constructor() {
      //this._worker = new Worker(FakeSyncWorker.WORKER_PATH);
      this._onmessageListeners = [];
      this._onsyncmessageListeners = [];
    }

    addEventListener(type: string, listener: any, useCapture?: boolean): void {
      release || Debug.assert(type === 'syncmessage' || type === 'message');
      if (type !== 'syncmessage') {
        this._onmessageListeners.push(listener);
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
      var i = this._onmessageListeners.indexOf(listener);
      if (i >= 0) {
        this._onmessageListeners.splice(i, 1);
      }
    }

    postMessage(message: any, ports?: any): any {
      var result;
      this._onmessageListeners.some(function (listener) {
        var ev = { data: message, result: undefined, handled: false };
        try {
          if (typeof listener === 'function') {
            listener(ev);
          } else {
            listener.handleEvent(ev);
          }
          if (!ev.handled) {
            return false;
          }
        } catch (ex) {
          Debug.warning('Failure at postMessage: ' + ex.message);
        }
        result = ev.result;
        return true;
      });
      return result;
    }

    postSyncMessage(message: any, ports?: any): any {
      var result;
      this._onsyncmessageListeners.some(function (listener) {
        var ev = { data: message, result: undefined, handled: false };
        try {
          if (typeof listener === 'function') {
            listener(ev);
          } else {
            listener.handleEvent(ev);
          }
          if (!ev.handled) {
            return false;
          }
        } catch (ex) {
          Debug.warning('Failure at postSyncMessage: ' + ex.message);
        }
        result = ev.result;
        return true;
      });
      return result;
    }
  }
}
