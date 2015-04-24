/*
 * Copyright 2015 Mozilla Foundation
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

module Shumway {
  // Produces similar output as flashlog.txt It can be produced by the
  // debug builds of Flash Player.
  // See https://github.com/mozilla/shumway/wiki/Trace-Output-with-Flash-Player-Debugger
  export class FlashLog {
    public isAS3TraceOn: boolean = true;

    private _startTime: number;

    public constructor() {
      this._startTime = Date.now();
    }

    public get currentTimestamp(): number {
      return Date.now() - this._startTime;
    }

    _writeLine(line: string): void {
      Debug.abstractMethod('FlashLog._writeLine');
    }

    public writeAS3Trace(msg: string): void {
      if (this.isAS3TraceOn) {
        this._writeLine(this.currentTimestamp + ' AVMINF: ' + msg);
      }
    }
  }

  export var flashlog: FlashLog = null;
}
