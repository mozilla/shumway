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
  export class FakeSyncWorker {
    private _worker: Worker;
    onsyncmessage: (ev: any) => any;

    constructor(url: string) {
      this._worker = new Worker(url);
    }

    set onmessage(value: (ev: any) => any) {
      this._worker.onmessage = value;
    }

    addEventListener(type: string, listener: EventListener, useCapture?: boolean): void {
      if (type !== 'syncmessage') {
        this._worker.addEventListener(type, listener, useCapture);
      }
    }

    removeEventListener(eventType: string, callback: (ev: any) => any): void {
      this._worker.removeEventListener(eventType, callback);
    }

    postMessage(message: any, ports?: any): void {
      this._worker.postMessage(message, ports);
    }

    postSyncMessage(message: any, ports?: any): void {
      if (this.onsyncmessage) {
        this.onsyncmessage({ data: message });
      }
    }

    terminate(): void {
      this._worker.terminate();
    }
  }
}
