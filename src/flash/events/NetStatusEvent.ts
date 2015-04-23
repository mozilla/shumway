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
// Class: NetStatusEvent
module Shumway.AVMX.AS.flash.events {
  export class NetStatusEvent extends flash.events.Event {

    static classInitializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor(type: string, bubbles: boolean = false, cancelable: boolean = false,
                info: Object = null) {
      super(type, bubbles, cancelable);
      this._info = info;
    }

    private _info: Object;

    get info(): Object {
      return this._info;
    }

    set info(value: Object) {
      this._info = value;
    }

    // JS -> AS Bindings
    public static NET_STATUS: string = "netStatus";

    clone(): Event {
      return new this.sec.flash.events.NetStatusEvent(this.type, this.bubbles,
                                                                 this.cancelable, this.info);
    }

    toString(): string {
      return this.formatToString('NetStatusEvent', 'type', 'bubbles', 'cancelable', 'eventPhase', 'info');
    }
  }
}
