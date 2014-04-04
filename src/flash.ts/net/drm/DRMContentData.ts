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
// Class: DRMContentData
module Shumway.AVM2.AS.flash.net.drm {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMContentData extends ASNative {
    static initializer: any = null;
    constructor (rawData: flash.utils.ByteArray = null) {
      rawData = rawData;
      false && super();
      notImplemented("Dummy Constructor: public flash.net.drm.DRMContentData");
    }
    // Static   JS -> AS Bindings
    static m_internalOnly: flash.utils.ByteArray;
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    serverURL: string;
    licenseID: string;
    domain: string;
    getVoucherAccessInfo: () => ASVector<flash.net.drm.VoucherAccessInfo>;
    m_licenseID: string;
    m_domain: string;
    m_voucherAccessInfo: ASVector<flash.net.drm.VoucherAccessInfo>;
    addVoucherAccessInfo: (newVoucherAccessInfo: flash.net.drm.VoucherAccessInfo) => void;
    // Instance AS -> JS Bindings
    get FMRMSURL(): string {
      notImplemented("public flash.net.drm.DRMContentData::get FMRMSURL"); return;
    }
    get authenticationMethod(): string {
      notImplemented("public flash.net.drm.DRMContentData::get authenticationMethod"); return;
    }
    getLicenseIDInner(): string {
      notImplemented("public flash.net.drm.DRMContentData::getLicenseIDInner"); return;
    }
    getDomainInner(): string {
      notImplemented("public flash.net.drm.DRMContentData::getDomainInner"); return;
    }
    setRawMetadataInner(inRawData: flash.utils.ByteArray): number /*uint*/ {
      inRawData = inRawData;
      notImplemented("public flash.net.drm.DRMContentData::setRawMetadataInner"); return;
    }
    errorCodeToThrow(errorCode: number /*uint*/): void {
      errorCode = errorCode >>> 0;
      notImplemented("public flash.net.drm.DRMContentData::errorCodeToThrow"); return;
    }
    populateVoucherAccessInfo(): void {
      notImplemented("public flash.net.drm.DRMContentData::populateVoucherAccessInfo"); return;
    }
  }
}
