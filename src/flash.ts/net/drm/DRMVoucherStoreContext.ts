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
// Class: DRMVoucherStoreContext
module Shumway.AVM2.AS.flash.net.drm {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMVoucherStoreContext extends flash.net.drm.DRMManagerSession {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: packageInternal flash.net.drm.DRMVoucherStoreContext");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    getVoucherFromStore: (inMetadata: flash.net.drm.DRMContentData) => void;
    voucher: flash.net.drm.DRMVoucher;
    onSessionComplete: () => void;
    onSessionError: () => void;
    // Instance AS -> JS Bindings
    getVoucherFromStoreInner(data: flash.net.drm.DRMContentData): number /*uint*/ {
      data = data;
      notImplemented("packageInternal flash.net.drm.DRMVoucherStoreContext::getVoucherFromStoreInner"); return;
    }
    getVoucherInner(): flash.net.drm.DRMVoucher {
      notImplemented("packageInternal flash.net.drm.DRMVoucherStoreContext::getVoucherInner"); return;
    }
  }
}
