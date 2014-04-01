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
// Class: LocaleID
module Shumway.AVM2.AS.flash.globalization {
  import notImplemented = Shumway.Debug.notImplemented;
  export class LocaleID extends ASNative {
    static initializer: any = null;
    constructor (name: string) {
      name = "" + name;
      false && super();
      notImplemented("Dummy Constructor: public flash.globalization.LocaleID");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static determinePreferredLocales(want: ASVector<string>, have: ASVector<string>, keyword: string = "userinterface"): ASVector<string> {
      want = want; have = have; keyword = "" + keyword;
      notImplemented("public flash.globalization.LocaleID::static determinePreferredLocales"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    ctor(name: string): void {
      name = "" + name;
      notImplemented("public flash.globalization.LocaleID::ctor"); return;
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
    get name(): string {
      notImplemented("public flash.globalization.LocaleID::get name"); return;
    }
    getKeysAndValues(): ASObject {
      notImplemented("public flash.globalization.LocaleID::getKeysAndValues"); return;
    }
    get lastOperationStatus(): string {
      notImplemented("public flash.globalization.LocaleID::get lastOperationStatus"); return;
    }
    isRightToLeft(): boolean {
      notImplemented("public flash.globalization.LocaleID::isRightToLeft"); return;
    }
  }
}
