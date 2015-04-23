/**
 * Copyright 2014 Mozilla Foundation
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
// Class: LoaderContext
module Shumway.AVMX.AS.flash.system {
  export class LoaderContext extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = ["checkPolicyFile!", "applicationDomain!", "sec!", "allowCodeImport!", "requestedContentParent!", "parameters!", "imageDecodingPolicy!"];
    
    constructor (checkPolicyFile: boolean = false, applicationDomain: flash.system.ApplicationDomain = null, securityDomain: flash.system.SecurityDomain = null) {
      super();
      this.checkPolicyFile = checkPolicyFile;
      this.applicationDomain = applicationDomain;
      this.securityDomain = securityDomain;
      this.imageDecodingPolicy = flash.system.ImageDecodingPolicy.ON_DEMAND;
    }
    
    checkPolicyFile: boolean;
    applicationDomain: flash.system.ApplicationDomain;
    securityDomain: flash.system.SecurityDomain;
    allowCodeImport: boolean;
    requestedContentParent: flash.display.DisplayObjectContainer;
    parameters: ASObject;
    imageDecodingPolicy: string;
  }
}
