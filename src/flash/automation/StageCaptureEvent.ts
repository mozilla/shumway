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
// Class: StageCaptureEvent
module Shumway.AVMX.AS.flash.automation {
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import notImplemented = Shumway.Debug.notImplemented;
  export class StageCaptureEvent extends flash.events.Event {
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, url: string = "", checksum: number /*uint*/ = 0) {
      type = axCoerceString(type); bubbles = !!bubbles; cancelable = !!cancelable; url = axCoerceString(url); checksum = checksum >>> 0;
      super(undefined, undefined, undefined);
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_url: string;
    m_checksum: number /*uint*/;
    clone: () => flash.events.Event;
    url: string;
    checksum: number /*uint*/;
    // Instance AS -> JS Bindings
  }
}
