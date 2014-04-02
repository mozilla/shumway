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
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["checkPolicyFile", "applicationDomain", "securityDomain", "allowCodeImport", "requestedContentParent", "parameters", "imageDecodingPolicy"];
    
    constructor (checkPolicyFile: boolean = false, applicationDomain: flash.system.ApplicationDomain = null, securityDomain: flash.system.SecurityDomain = null) {
      checkPolicyFile = !!checkPolicyFile; applicationDomain = applicationDomain; securityDomain = securityDomain;
      false && super();
      notImplemented("Dummy Constructor: public flash.system.LoaderContext");
    }
    
    // JS -> AS Bindings
    
    checkPolicyFile: boolean;
    applicationDomain: flash.system.ApplicationDomain;
    securityDomain: flash.system.SecurityDomain;
    allowCodeImport: boolean;
    requestedContentParent: flash.display.DisplayObjectContainer;
    parameters: ASObject;
    imageDecodingPolicy: string;
    
    // AS -> JS Bindings
    
  }
}
