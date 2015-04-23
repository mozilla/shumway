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
// Class: HTTPStatusEvent
module Shumway.AVMX.AS.flash.events {
  export class HTTPStatusEvent extends flash.events.Event {

    static classInitializer: any = null;

    constructor(type: string, bubbles: boolean = false, cancelable: boolean = false,
                status: number /*int*/ = 0) {
      super(type, bubbles, cancelable);
      this._status = status | 0;
    }

    static HTTP_STATUS: string = "httpStatus";
    static HTTP_RESPONSE_STATUS: string = "httpResponseStatus";

    private _status: number;

    _setStatus(value: number): void {
      this._status = value;
    }
    get status(): number {
      return this._status;
    }

    clone(): Event {
      return new this.sec.flash.events.HTTPStatusEvent(this.type, this.bubbles, this.cancelable,
                                                       this.status);
    }

    toString(): string {
      return this.formatToString('HTTPStatusEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                                 'status');
    }
  }
}
