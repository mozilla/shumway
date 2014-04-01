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
// Class: Collator
module Shumway.AVM2.AS.flash.globalization {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Collator extends ASNative {
    static initializer: any = null;
    constructor (requestedLocaleIDName: string, initialMode: string = "sorting") {
      requestedLocaleIDName = "" + requestedLocaleIDName; initialMode = "" + initialMode;
      false && super();
      notImplemented("Dummy Constructor: public flash.globalization.Collator");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static getAvailableLocaleIDNames(): ASVector<string> {
      notImplemented("public flash.globalization.Collator::static getAvailableLocaleIDNames"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    ctor(requestedLocaleIDName: string, initialMode: string): void {
      requestedLocaleIDName = "" + requestedLocaleIDName; initialMode = "" + initialMode;
      notImplemented("public flash.globalization.Collator::ctor"); return;
    }
    get ignoreCase(): boolean {
      notImplemented("public flash.globalization.Collator::get ignoreCase"); return;
    }
    set ignoreCase(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.Collator::set ignoreCase"); return;
    }
    get ignoreDiacritics(): boolean {
      notImplemented("public flash.globalization.Collator::get ignoreDiacritics"); return;
    }
    set ignoreDiacritics(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.Collator::set ignoreDiacritics"); return;
    }
    get ignoreKanaType(): boolean {
      notImplemented("public flash.globalization.Collator::get ignoreKanaType"); return;
    }
    set ignoreKanaType(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.Collator::set ignoreKanaType"); return;
    }
    get ignoreSymbols(): boolean {
      notImplemented("public flash.globalization.Collator::get ignoreSymbols"); return;
    }
    set ignoreSymbols(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.Collator::set ignoreSymbols"); return;
    }
    get ignoreCharacterWidth(): boolean {
      notImplemented("public flash.globalization.Collator::get ignoreCharacterWidth"); return;
    }
    set ignoreCharacterWidth(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.Collator::set ignoreCharacterWidth"); return;
    }
    get numericComparison(): boolean {
      notImplemented("public flash.globalization.Collator::get numericComparison"); return;
    }
    set numericComparison(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.Collator::set numericComparison"); return;
    }
    compare(string1: string, string2: string): number /*int*/ {
      string1 = "" + string1; string2 = "" + string2;
      notImplemented("public flash.globalization.Collator::compare"); return;
    }
    equals(string1: string, string2: string): boolean {
      string1 = "" + string1; string2 = "" + string2;
      notImplemented("public flash.globalization.Collator::equals"); return;
    }
    get lastOperationStatus(): string {
      notImplemented("public flash.globalization.Collator::get lastOperationStatus"); return;
    }
    get actualLocaleIDName(): string {
      notImplemented("public flash.globalization.Collator::get actualLocaleIDName"); return;
    }
    get requestedLocaleIDName(): string {
      notImplemented("public flash.globalization.Collator::get requestedLocaleIDName"); return;
    }
  }
}
