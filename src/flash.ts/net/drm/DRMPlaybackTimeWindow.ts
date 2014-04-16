/**
 * Copyright 2013 Mozilla Foundation
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
// Class: DRMPlaybackTimeWindow
module Shumway.AVM2.AS.flash.net.drm {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMPlaybackTimeWindow extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.net.drm.DRMPlaybackTimeWindow");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    init: (length: number, start: number, end: number) => void;
    m_length: number /*uint*/;
    m_startDate: ASDate;
    m_endDate: ASDate;
    period: number /*uint*/;
    startDate: ASDate;
    endDate: ASDate;
    // Instance AS -> JS Bindings
  }
}
