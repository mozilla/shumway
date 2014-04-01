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
// Class: LoaderContext
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class LoaderContext extends ASNative {
    static initializer: any = null;
    constructor (checkPolicyFile: boolean = false, applicationDomain: flash.system.ApplicationDomain = null, securityDomain: flash.system.SecurityDomain = null) {
      checkPolicyFile = !!checkPolicyFile; applicationDomain = applicationDomain; securityDomain = securityDomain;
      false && super();
      notImplemented("Dummy Constructor: public flash.system.LoaderContext");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    checkPolicyFile: boolean;
    applicationDomain: flash.system.ApplicationDomain;
    securityDomain: flash.system.SecurityDomain;
    allowLoadBytesCodeExecution: boolean;
    allowCodeImport: boolean;
    requestedContentParent: flash.display.DisplayObjectContainer;
    parameters: ASObject;
    imageDecodingPolicy: string;
    // Instance AS -> JS Bindings
  }
}
