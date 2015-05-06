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
// Class: AsyncErrorEvent
module Shumway.AVMX.AS.flash.events {
  export class AsyncErrorEvent extends flash.events.ErrorEvent {

    static ASYNC_ERROR: string = "asyncError";

    static classInitializer: any = null;

    $Bgerror: ASError;


    constructor(type: string, bubbles: boolean = false, cancelable: boolean = false,
                text: string = "", error: ASError = null) {
      super(type, bubbles, cancelable, text);
      this.$Bgerror = error;
    }

    public get error() {
      return this.$Bgerror;
    }

    clone(): Event {
      return new this.sec.flash.events.AsyncErrorEvent(this._type, this._bubbles, this._cancelable,
                                                       this._text, this.$Bgerror);
    }

    toString(): string {
      return this.formatToString('AsyncErrorEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                                 'text', 'error');
    }
  }
}
