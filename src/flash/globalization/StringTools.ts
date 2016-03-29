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
// Class: StringTools
module Shumway.AVMX.AS.flash.globalization {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class StringTools extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor (requestedLocaleIDName: string) {
      super();
      requestedLocaleIDName = axCoerceString(requestedLocaleIDName);
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    static getAvailableLocaleIDNames(): ASVector<any> {
      release || notImplemented("public flash.globalization.StringTools::static getAvailableLocaleIDNames"); return;
    }
    
    // _lastOperationStatus: string;
    // _requestedLocaleIDName: string;
    // _actualLocaleIDName: string;
    get lastOperationStatus(): string {
      release || notImplemented("public flash.globalization.StringTools::get lastOperationStatus"); return;
      // return this._lastOperationStatus;
    }
    get requestedLocaleIDName(): string {
      release || notImplemented("public flash.globalization.StringTools::get requestedLocaleIDName"); return;
      // return this._requestedLocaleIDName;
    }
    get actualLocaleIDName(): string {
      release || notImplemented("public flash.globalization.StringTools::get actualLocaleIDName"); return;
      // return this._actualLocaleIDName;
    }
    toLowerCase(s: string): string {
      s = axCoerceString(s);
      release || notImplemented("public flash.globalization.StringTools::toLowerCase"); return;
    }
    toUpperCase(s: string): string {
      s = axCoerceString(s);
      release || notImplemented("public flash.globalization.StringTools::toUpperCase"); return;
    }
    ctor(requestedLocaleIDName: string): void {
      requestedLocaleIDName = axCoerceString(requestedLocaleIDName);
      release || notImplemented("public flash.globalization.StringTools::ctor"); return;
    }
  }
}
