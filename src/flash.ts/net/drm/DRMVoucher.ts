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
 * limitations undxr the License.
 */
// Class: DRMVoucher
module Shumway.AVM2.AS.flash.net.drm {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMVoucher extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.net.drm.DRMVoucher");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    voucherStartDate: ASDate;
    voucherEndDate: ASDate;
    offlineLeaseStartDate: ASDate;
    offlineLeaseEndDate: ASDate;
    policies: ASObject;
    setCustomPolicyObject: (customPolicyObject: ASObject) => void;
    playbackTimeWindow: flash.net.drm.DRMPlaybackTimeWindow;
    toByteArray: () => flash.utils.ByteArray;
    m_endDate: ASDate;
    m_startDate: ASDate;
    m_offlineLeaseStartDate: ASDate;
    m_offlineLeaseExpirationDate: ASDate;
    m_customPolicies: ASObject;
    m_playbackTimeWindow: flash.net.drm.DRMPlaybackTimeWindow;
    // Instance AS -> JS Bindings
    getEndDateInner(): number {
      notImplemented("public flash.net.drm.DRMVoucher::getEndDateInner"); return;
    }
    getStartDateInner(): number {
      notImplemented("public flash.net.drm.DRMVoucher::getStartDateInner"); return;
    }
    getOfflineLeaseStartDateInner(): number {
      notImplemented("public flash.net.drm.DRMVoucher::getOfflineLeaseStartDateInner"); return;
    }
    getOfflineLeaseExpirationDateInner(): number {
      notImplemented("public flash.net.drm.DRMVoucher::getOfflineLeaseExpirationDateInner"); return;
    }
    createCustomPolicyObject(): void {
      notImplemented("public flash.net.drm.DRMVoucher::createCustomPolicyObject"); return;
    }
    get playStartTime(): number {
      notImplemented("public flash.net.drm.DRMVoucher::get playStartTime"); return;
    }
    get playbackEndTime(): number {
      notImplemented("public flash.net.drm.DRMVoucher::get playbackEndTime"); return;
    }
    get playbackWindow(): number {
      notImplemented("public flash.net.drm.DRMVoucher::get playbackWindow"); return;
    }
    createDRMPlaybackTimeWindow(length: number, start: number, end: number): flash.net.drm.DRMPlaybackTimeWindow {
      length = +length; start = +start; end = +end;
      notImplemented("public flash.net.drm.DRMVoucher::createDRMPlaybackTimeWindow"); return;
    }
    toByteArrayInner(): flash.utils.ByteArray {
      notImplemented("public flash.net.drm.DRMVoucher::toByteArrayInner"); return;
    }
  }
}
