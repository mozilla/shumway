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
// Class: AuthorizedFeaturesLoader
module Shumway.AVMX.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class AuthorizedFeaturesLoader extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
    }

    // _authorizedFeatures: flash.system.AuthorizedFeatures;
    get authorizedFeatures(): flash.system.AuthorizedFeatures {
      release || notImplemented("public flash.system.AuthorizedFeaturesLoader::get authorizedFeatures"); return;
      // return this._authorizedFeatures;
    }
    loadAuthorizedFeatures(): void {
      release || notImplemented("public flash.system.AuthorizedFeaturesLoader::loadAuthorizedFeatures"); return;
    }
    makeGlobal(): void {
      release || notImplemented("public flash.system.AuthorizedFeaturesLoader::makeGlobal"); return;
    }
  }
}
