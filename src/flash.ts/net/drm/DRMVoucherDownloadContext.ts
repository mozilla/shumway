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
// Class: DRMVoucherDownloadContext
module Shumway.AVM2.AS.flash.net.drm {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMVoucherDownloadContext extends flash.net.drm.DRMManagerSession {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: packageInternal flash.net.drm.DRMVoucherDownloadContext");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    download: (inMetadata: flash.net.drm.DRMContentData, previewVoucher: boolean = false) => void;
    onSessionComplete: () => void;
    onSessionError: () => void;
    voucher: flash.net.drm.DRMVoucher;
    // Instance AS -> JS Bindings
    downloadInner(metadata: flash.net.drm.DRMContentData, previewVoucher: boolean): number /*uint*/ {
      metadata = metadata; previewVoucher = !!previewVoucher;
      notImplemented("packageInternal flash.net.drm.DRMVoucherDownloadContext::downloadInner"); return;
    }
    getVoucherInner(): flash.net.drm.DRMVoucher {
      notImplemented("packageInternal flash.net.drm.DRMVoucherDownloadContext::getVoucherInner"); return;
    }
  }
}
