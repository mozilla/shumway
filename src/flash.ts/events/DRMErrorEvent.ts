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
// Class: DRMErrorEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMErrorEvent extends flash.events.ErrorEvent {
    static initializer: any = null;
    constructor (type: string = "drmError", bubbles: boolean = false, cancelable: boolean = false, inErrorDetail: string = "", inErrorCode: number /*int*/ = 0, insubErrorID: number /*int*/ = 0, inMetadata: flash.net.drm.DRMContentData = null, inSystemUpdateNeeded: boolean = false, inDrmUpdateNeeded: boolean = false) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; inErrorDetail = "" + inErrorDetail; inErrorCode = inErrorCode | 0; insubErrorID = insubErrorID | 0; inMetadata = inMetadata; inSystemUpdateNeeded = !!inSystemUpdateNeeded; inDrmUpdateNeeded = !!inDrmUpdateNeeded;
      false && super(undefined, undefined, undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.DRMErrorEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.events.Event;
    subErrorID: number /*int*/;
    contentData: flash.net.drm.DRMContentData;
    systemUpdateNeeded: boolean;
    drmUpdateNeeded: boolean;
    m_metadata: flash.net.drm.DRMContentData;
    m_subErrorID: number /*int*/;
    m_systemUpdateNeeded: boolean;
    m_drmUpdateNeeded: boolean;
    // Instance AS -> JS Bindings
  }
}
