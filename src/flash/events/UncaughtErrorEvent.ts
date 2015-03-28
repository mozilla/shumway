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
// Class: UncaughtErrorEvent
module Shumway.AVMX.AS.flash.events {
  export class UncaughtErrorEvent extends flash.events.ErrorEvent {

    static classInitializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor(type: string = "uncaughtError", bubbles: boolean = true, cancelable: boolean = true,
                error_in: any = null) {
      super(type, bubbles, cancelable, error_in);
    }

    // JS -> AS Bindings
    static UNCAUGHT_ERROR: string = "uncaughtError";
  }
}
