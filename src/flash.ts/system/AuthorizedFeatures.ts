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
// Class: AuthorizedFeatures
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class AuthorizedFeatures extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.system.AuthorizedFeatures");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    createApplicationInstaller(strings: ASXML, icon: flash.utils.ByteArray): flash.system.ApplicationInstaller {
      strings = strings; icon = icon;
      notImplemented("public flash.system.AuthorizedFeatures::createApplicationInstaller"); return;
    }
    enableDiskCache(stream: flash.net.URLStream): boolean {
      stream = stream;
      notImplemented("public flash.system.AuthorizedFeatures::enableDiskCache"); return;
    }
    isFeatureEnabled(feature: string, data: string = null): boolean {
      feature = "" + feature; data = "" + data;
      notImplemented("public flash.system.AuthorizedFeatures::isFeatureEnabled"); return;
    }
    isNegativeToken(): boolean {
      notImplemented("public flash.system.AuthorizedFeatures::isNegativeToken"); return;
    }
  }
}
