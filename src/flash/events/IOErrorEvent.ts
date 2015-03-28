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
// Class: IOErrorEvent
module Shumway.AVMX.AS.flash.events {
  export class IOErrorEvent extends flash.events.ErrorEvent {
    static classInitializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor(type: string, bubbles: boolean = false, cancelable: boolean = false,
                text: string = "", id: number /*int*/ = 0) {
      super(type, bubbles, cancelable, text, id);
    }

    // JS -> AS Bindings
    static IO_ERROR: string = "ioError";
    static NETWORK_ERROR: string = "networkError";
    static DISK_ERROR: string = "diskError";
    static VERIFY_ERROR: string = "verifyError";

    clone(): Event {
      var event = new IOErrorEvent(this.type, this.bubbles, this.cancelable, this.text,
                                   this.errorID);
      this.copyNativeData(event);
      return event;
    }

    toString(): string {
      return this.formatToString('IOErrorEvent', 'type', 'bubbles', 'cancelable', 'text',
                                 'errorID');
    }
  }
}
