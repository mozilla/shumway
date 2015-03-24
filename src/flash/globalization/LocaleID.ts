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
// Class: LocaleID
module Shumway.AVMX.AS.flash.globalization {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVMX.asCoerceString;
  export class LocaleID extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor (name: string) {
      name = asCoerceString(name);
      false && super();
      dummyConstructor("public flash.globalization.LocaleID");
    }
    
    // JS -> AS Bindings
    static DEFAULT: string = "i-default";
    
    
    // AS -> JS Bindings
    static determinePreferredLocales(want: ASVector<any>, have: ASVector<any>, keyword: string = "userinterface"): ASVector<any> {
      want = want; have = have; keyword = asCoerceString(keyword);
      notImplemented("public flash.globalization.LocaleID::static determinePreferredLocales"); return;
    }
    
    // _name: string;
    // _lastOperationStatus: string;
    get name(): string {
      notImplemented("public flash.globalization.LocaleID::get name"); return;
      // return this._name;
    }
    get lastOperationStatus(): string {
      notImplemented("public flash.globalization.LocaleID::get lastOperationStatus"); return;
      // return this._lastOperationStatus;
    }
    getLanguage(): string {
      notImplemented("public flash.globalization.LocaleID::getLanguage"); return;
    }
    getRegion(): string {
      notImplemented("public flash.globalization.LocaleID::getRegion"); return;
    }
    getScript(): string {
      notImplemented("public flash.globalization.LocaleID::getScript"); return;
    }
    getVariant(): string {
      notImplemented("public flash.globalization.LocaleID::getVariant"); return;
    }
    getKeysAndValues(): ASObject {
      notImplemented("public flash.globalization.LocaleID::getKeysAndValues"); return;
    }
    isRightToLeft(): boolean {
      notImplemented("public flash.globalization.LocaleID::isRightToLeft"); return;
    }
    ctor(name: string): void {
      name = asCoerceString(name);
      notImplemented("public flash.globalization.LocaleID::ctor"); return;
    }
  }
}
