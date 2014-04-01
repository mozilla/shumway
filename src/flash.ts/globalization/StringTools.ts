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
// Class: StringTools
module Shumway.AVM2.AS.flash.globalization {
  import notImplemented = Shumway.Debug.notImplemented;
  export class StringTools extends ASNative {
    static initializer: any = null;
    constructor (requestedLocaleIDName: string) {
      requestedLocaleIDName = "" + requestedLocaleIDName;
      false && super();
      notImplemented("Dummy Constructor: public flash.globalization.StringTools");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static getAvailableLocaleIDNames(): ASVector<string> {
      notImplemented("public flash.globalization.StringTools::static getAvailableLocaleIDNames"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    ctor(requestedLocaleIDName: string): void {
      requestedLocaleIDName = "" + requestedLocaleIDName;
      notImplemented("public flash.globalization.StringTools::ctor"); return;
    }
    get lastOperationStatus(): string {
      notImplemented("public flash.globalization.StringTools::get lastOperationStatus"); return;
    }
    get requestedLocaleIDName(): string {
      notImplemented("public flash.globalization.StringTools::get requestedLocaleIDName"); return;
    }
    get actualLocaleIDName(): string {
      notImplemented("public flash.globalization.StringTools::get actualLocaleIDName"); return;
    }
    toLowerCase(s: string): string {
      s = "" + s;
      notImplemented("public flash.globalization.StringTools::toLowerCase"); return;
    }
    toUpperCase(s: string): string {
      s = "" + s;
      notImplemented("public flash.globalization.StringTools::toUpperCase"); return;
    }
  }
}
