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
// Class: DRMStatusEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMStatusEvent extends flash.events.Event {
    static initializer: any = null;
    constructor (type: string = "drmStatus", bubbles: boolean = false, cancelable: boolean = false, inMetadata: flash.net.drm.DRMContentData = null, inVoucher: flash.net.drm.DRMVoucher = null, inLocal: boolean = false) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; inMetadata = inMetadata; inVoucher = inVoucher; inLocal = !!inLocal;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.DRMStatusEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.events.Event;
    contentData: flash.net.drm.DRMContentData;
    voucher: flash.net.drm.DRMVoucher;
    isLocal: boolean;
    m_detail: string;
    m_voucher: flash.net.drm.DRMVoucher;
    m_metadata: flash.net.drm.DRMContentData;
    m_isLocal: boolean;
    // Instance AS -> JS Bindings
  }
}
