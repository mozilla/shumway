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
// Class: DRMManagerSession
module Shumway.AVM2.AS.flash.net.drm {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMManagerSession extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: packageInternal flash.net.drm.DRMManagerSession");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    onSessionError: () => void;
    onSessionComplete: () => void;
    setTimerUp: () => void;
    metadata: flash.net.drm.DRMContentData;
    checkStatus: () => number /*uint*/;
    onCheckStatus: (ev: flash.events.TimerEvent) => any;
    m_metadata: flash.net.drm.DRMContentData;
    m_checkStatusTimer: flash.utils.Timer;
    m_isInSession: boolean;
    issueDRMStatusEvent: (inMetadata: flash.net.drm.DRMContentData, voucher: flash.net.drm.DRMVoucher) => any;
    // Instance AS -> JS Bindings
    getLastError(): number /*uint*/ {
      notImplemented("packageInternal flash.net.drm.DRMManagerSession::getLastError"); return;
    }
    getLastSubErrorID(): number /*uint*/ {
      notImplemented("packageInternal flash.net.drm.DRMManagerSession::getLastSubErrorID"); return;
    }
    issueDRMStatusEventInner(specificEventType: string, metadata: flash.net.drm.DRMContentData, voucher: flash.net.drm.DRMVoucher, isLocal: boolean): void {
      specificEventType = "" + specificEventType; metadata = metadata; voucher = voucher; isLocal = !!isLocal;
      notImplemented("packageInternal flash.net.drm.DRMManagerSession::issueDRMStatusEventInner"); return;
    }
    issueDRMErrorEvent(metadata: flash.net.drm.DRMContentData, errorID: number /*int*/, subErrorID: number /*int*/, eventType: string = null): void {
      metadata = metadata; errorID = errorID | 0; subErrorID = subErrorID | 0; eventType = "" + eventType;
      notImplemented("packageInternal flash.net.drm.DRMManagerSession::issueDRMErrorEvent"); return;
    }
    errorCodeToThrow(errorCode: number /*uint*/): void {
      errorCode = errorCode >>> 0;
      notImplemented("packageInternal flash.net.drm.DRMManagerSession::errorCodeToThrow"); return;
    }
    checkStatusInner(): number /*uint*/ {
      notImplemented("packageInternal flash.net.drm.DRMManagerSession::checkStatusInner"); return;
    }
  }
}
