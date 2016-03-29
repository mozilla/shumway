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
// Class: StatusEvent
module Shumway.AVMX.AS.flash.events {
  export class StatusEvent extends flash.events.Event {

    static classInitializer: any = null;

    private _code: string;
    private _level: string;

    constructor(type: string, bubbles: boolean = false, cancelable: boolean = false,
                code: string = "", level: string = "") {
      super(type, bubbles, cancelable);
      this._code = axCoerceString(code);
      this._level = axCoerceString(level);
    }

    public get level(): string {
      return this._level;
    }

    public set level(value: string) {
      this._level = value;
    }
    public get code(): string {
      return this._code;
    }

    public set code(value: string) {
      this._code = value;
    }

    clone(): Shumway.AVMX.AS.flash.events.Event {
      return new this.sec.flash.events.StatusEvent(this._type, this._bubbles, this._cancelable,
                                                   this._code, this._level);
    }

    toString(): string {
      return this.formatToString('StatusEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                                 'code', 'level');
    }

    static STATUS: string = "status";
  }
}
