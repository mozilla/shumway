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
// Class: NumberFormatter
module Shumway.AVM2.AS.flash.globalization {
  import notImplemented = Shumway.Debug.notImplemented;
  export class NumberFormatter extends ASNative {
    static initializer: any = null;
    constructor (requestedLocaleIDName: string) {
      requestedLocaleIDName = "" + requestedLocaleIDName;
      false && super();
      notImplemented("Dummy Constructor: public flash.globalization.NumberFormatter");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static getAvailableLocaleIDNames(): ASVector<string> {
      notImplemented("public flash.globalization.NumberFormatter::static getAvailableLocaleIDNames"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    ctor(requestedLocaleIDName: string): void {
      requestedLocaleIDName = "" + requestedLocaleIDName;
      notImplemented("public flash.globalization.NumberFormatter::ctor"); return;
    }
    get lastOperationStatus(): string {
      notImplemented("public flash.globalization.NumberFormatter::get lastOperationStatus"); return;
    }
    get requestedLocaleIDName(): string {
      notImplemented("public flash.globalization.NumberFormatter::get requestedLocaleIDName"); return;
    }
    get actualLocaleIDName(): string {
      notImplemented("public flash.globalization.NumberFormatter::get actualLocaleIDName"); return;
    }
    get fractionalDigits(): number /*int*/ {
      notImplemented("public flash.globalization.NumberFormatter::get fractionalDigits"); return;
    }
    set fractionalDigits(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.globalization.NumberFormatter::set fractionalDigits"); return;
    }
    get useGrouping(): boolean {
      notImplemented("public flash.globalization.NumberFormatter::get useGrouping"); return;
    }
    set useGrouping(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.NumberFormatter::set useGrouping"); return;
    }
    get groupingPattern(): string {
      notImplemented("public flash.globalization.NumberFormatter::get groupingPattern"); return;
    }
    set groupingPattern(value: string) {
      value = "" + value;
      notImplemented("public flash.globalization.NumberFormatter::set groupingPattern"); return;
    }
    get digitsType(): number /*uint*/ {
      notImplemented("public flash.globalization.NumberFormatter::get digitsType"); return;
    }
    set digitsType(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.globalization.NumberFormatter::set digitsType"); return;
    }
    get decimalSeparator(): string {
      notImplemented("public flash.globalization.NumberFormatter::get decimalSeparator"); return;
    }
    set decimalSeparator(value: string) {
      value = "" + value;
      notImplemented("public flash.globalization.NumberFormatter::set decimalSeparator"); return;
    }
    get groupingSeparator(): string {
      notImplemented("public flash.globalization.NumberFormatter::get groupingSeparator"); return;
    }
    set groupingSeparator(value: string) {
      value = "" + value;
      notImplemented("public flash.globalization.NumberFormatter::set groupingSeparator"); return;
    }
    get negativeSymbol(): string {
      notImplemented("public flash.globalization.NumberFormatter::get negativeSymbol"); return;
    }
    set negativeSymbol(value: string) {
      value = "" + value;
      notImplemented("public flash.globalization.NumberFormatter::set negativeSymbol"); return;
    }
    get negativeNumberFormat(): number /*uint*/ {
      notImplemented("public flash.globalization.NumberFormatter::get negativeNumberFormat"); return;
    }
    set negativeNumberFormat(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.globalization.NumberFormatter::set negativeNumberFormat"); return;
    }
    get leadingZero(): boolean {
      notImplemented("public flash.globalization.NumberFormatter::get leadingZero"); return;
    }
    set leadingZero(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.NumberFormatter::set leadingZero"); return;
    }
    get trailingZeros(): boolean {
      notImplemented("public flash.globalization.NumberFormatter::get trailingZeros"); return;
    }
    set trailingZeros(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.NumberFormatter::set trailingZeros"); return;
    }
    parse(parseString: string): flash.globalization.NumberParseResult {
      parseString = "" + parseString;
      notImplemented("public flash.globalization.NumberFormatter::parse"); return;
    }
    parseNumber(parseString: string): number {
      parseString = "" + parseString;
      notImplemented("public flash.globalization.NumberFormatter::parseNumber"); return;
    }
    formatInt(value: number /*int*/): string {
      value = value | 0;
      notImplemented("public flash.globalization.NumberFormatter::formatInt"); return;
    }
    formatUint(value: number /*uint*/): string {
      value = value >>> 0;
      notImplemented("public flash.globalization.NumberFormatter::formatUint"); return;
    }
    formatNumber(value: number): string {
      value = +value;
      notImplemented("public flash.globalization.NumberFormatter::formatNumber"); return;
    }
  }
}
