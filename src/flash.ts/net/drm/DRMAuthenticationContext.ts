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
// Class: DRMAuthenticationContext
module Shumway.AVM2.AS.flash.net.drm {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DRMAuthenticationContext extends flash.net.drm.DRMManagerSession {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: packageInternal flash.net.drm.DRMAuthenticationContext");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    authenticate: (url: string, domain: string, username: string, password: string) => void;
    onSessionComplete: () => void;
    onSessionError: () => void;
    authenticationToken: flash.utils.ByteArray;
    m_url: string;
    m_domain: string;
    // Instance AS -> JS Bindings
    authenticateInner(url: string, domain: string, username: string, password: string): number /*uint*/ {
      url = "" + url; domain = "" + domain; username = "" + username; password = "" + password;
      notImplemented("packageInternal flash.net.drm.DRMAuthenticationContext::authenticateInner"); return;
    }
    getTokenInner(outToken: flash.utils.ByteArray): void {
      outToken = outToken;
      notImplemented("packageInternal flash.net.drm.DRMAuthenticationContext::getTokenInner"); return;
    }
  }
}
