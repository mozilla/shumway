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
// Class: DRMManager
module Shumway.AVM2.AS.flash.net.drm {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMManager extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.drm.DRMManager");
    }
    // Static   JS -> AS Bindings
    static theManager: flash.net.drm.DRMManager;
    static getDRMManager: () => flash.net.drm.DRMManager;
    static isSupported: boolean;
    static checkRemoteSWFInvocation: () => void;
    // Static   AS -> JS Bindings
    static createDRMManager(): flash.net.drm.DRMManager {
      notImplemented("public flash.net.drm.DRMManager::static createDRMManager"); return;
    }
    static _checkSupported(): boolean {
      notImplemented("public flash.net.drm.DRMManager::static _checkSupported"); return;
    }
    static isCalledFromRemoteSWF(): boolean {
      notImplemented("public flash.net.drm.DRMManager::static isCalledFromRemoteSWF"); return;
    }
    // Instance JS -> AS Bindings
    authenticate: (serverURL: string, domain: string, username: string, password: string) => void;
    setAuthenticationToken: (serverUrl: string, domain: string, token: flash.utils.ByteArray) => void;
    loadVoucher: (contentData: flash.net.drm.DRMContentData, setting: string) => void;
    loadPreviewVoucher: (contentData: flash.net.drm.DRMContentData) => void;
    downloadVoucher: (contentData: flash.net.drm.DRMContentData, previewVoucher: boolean = false) => void;
    storeVoucher: (voucher: flash.utils.ByteArray) => void;
    onAuthenticationComplete: (theEvent: flash.events.DRMAuthenticationCompleteEvent) => void;
    onAuthenticationError: (theEvent: flash.events.DRMAuthenticationErrorEvent) => void;
    onGetVoucherFromStoreComplete: (theEvent: flash.events.DRMStatusEvent) => void;
    onGetVoucherFromStoreError: (theEvent: flash.events.DRMErrorEvent) => void;
    onDownloadVoucherComplete: (theEvent: flash.events.DRMStatusEvent) => void;
    onGetVoucherFromStoreWithAllowServerComplete: (theEvent: flash.events.DRMStatusEvent) => void;
    onDownloadVoucherError: (theEvent: flash.events.DRMErrorEvent) => void;
    onGetVoucherFromStoreWithAllowServerError: (theEvent: flash.events.DRMErrorEvent) => void;
    // Instance AS -> JS Bindings
    setSAMLTokenInner(serverUrl: string, domain: string, token: flash.utils.ByteArray): number /*uint*/ {
      serverUrl = "" + serverUrl; domain = "" + domain; token = token;
      notImplemented("public flash.net.drm.DRMManager::setSAMLTokenInner"); return;
    }
    errorCodeToThrow(errorCode: number /*uint*/): void {
      errorCode = errorCode >>> 0;
      notImplemented("public flash.net.drm.DRMManager::errorCodeToThrow"); return;
    }
    issueDRMStatusEvent(specificEventType: string, metadata: flash.net.drm.DRMContentData, voucher: flash.net.drm.DRMVoucher, isLocal: boolean): void {
      specificEventType = "" + specificEventType; metadata = metadata; voucher = voucher; isLocal = !!isLocal;
      notImplemented("public flash.net.drm.DRMManager::issueDRMStatusEvent"); return;
    }
    issueDRMErrorEvent(metadata: flash.net.drm.DRMContentData, errorID: number /*int*/, subErrorID: number /*int*/, eventType: string = null): void {
      metadata = metadata; errorID = errorID | 0; subErrorID = subErrorID | 0; eventType = "" + eventType;
      notImplemented("public flash.net.drm.DRMManager::issueDRMErrorEvent"); return;
    }
    storeVoucherInner(voucher: flash.utils.ByteArray): number /*uint*/ {
      voucher = voucher;
      notImplemented("public flash.net.drm.DRMManager::storeVoucherInner"); return;
    }
  }
}
