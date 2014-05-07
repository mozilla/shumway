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
// Class: IEventDispatcher
module Shumway.AVM2.AS.flash.events {

  export interface EventHandler {
    (event: flash.events.Event): void;
  }

  export interface IEventDispatcher {
    addEventListener: (type: string, listener: EventHandler, useCapture: boolean = false,
                       priority: number /*int*/ = 0, useWeakReference: boolean = false) => void;
    removeEventListener: (type: string, listener: EventHandler,
                          useCapture: boolean = false) => void;
    hasEventListener: (type: string) => boolean;
    willTrigger: (type: string) => boolean;
    dispatchEvent: (event: flash.events.Event) => boolean;
  }
}
