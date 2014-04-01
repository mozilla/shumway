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
// Class: CurrencyFormatter
module Shumway.AVM2.AS.flash.globalization {
  import notImplemented = Shumway.Debug.notImplemented;
  export class CurrencyFormatter extends ASNative {
    static initializer: any = null;
    constructor (requestedLocaleIDName: string) {
      requestedLocaleIDName = "" + requestedLocaleIDName;
      false && super();
      notImplemented("Dummy Constructor: public flash.globalization.CurrencyFormatter");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static getAvailableLocaleIDNames(): ASVector<string> {
      notImplemented("public flash.globalization.CurrencyFormatter::static getAvailableLocaleIDNames"); return;
    }
    // Instance JS -> AS Bindings
    format: (value: number, withCurrencySymbol: boolean = false) => string;
    // Instance AS -> JS Bindings
    ctor(requestedLocaleIDName: string): void {
      requestedLocaleIDName = "" + requestedLocaleIDName;
      notImplemented("public flash.globalization.CurrencyFormatter::ctor"); return;
    }
    get currencyISOCode(): string {
      notImplemented("public flash.globalization.CurrencyFormatter::get currencyISOCode"); return;
    }
    get currencySymbol(): string {
      notImplemented("public flash.globalization.CurrencyFormatter::get currencySymbol"); return;
    }
    setCurrency(currencyISOCode: string, currencySymbol: string): void {
      currencyISOCode = "" + currencyISOCode; currencySymbol = "" + currencySymbol;
      notImplemented("public flash.globalization.CurrencyFormatter::setCurrency"); return;
    }
    formatImplementation(value: number, withCurrencySymbol: boolean): string {
      value = +value; withCurrencySymbol = !!withCurrencySymbol;
      notImplemented("public flash.globalization.CurrencyFormatter::formatImplementation"); return;
    }
    formattingWithCurrencySymbolIsSafe(requestedISOCode: string): boolean {
      requestedISOCode = "" + requestedISOCode;
      notImplemented("public flash.globalization.CurrencyFormatter::formattingWithCurrencySymbolIsSafe"); return;
    }
    parse(inputString: string): flash.globalization.CurrencyParseResult {
      inputString = "" + inputString;
      notImplemented("public flash.globalization.CurrencyFormatter::parse"); return;
    }
    get lastOperationStatus(): string {
      notImplemented("public flash.globalization.CurrencyFormatter::get lastOperationStatus"); return;
    }
    get requestedLocaleIDName(): string {
      notImplemented("public flash.globalization.CurrencyFormatter::get requestedLocaleIDName"); return;
    }
    get actualLocaleIDName(): string {
      notImplemented("public flash.globalization.CurrencyFormatter::get actualLocaleIDName"); return;
    }
    get fractionalDigits(): number /*int*/ {
      notImplemented("public flash.globalization.CurrencyFormatter::get fractionalDigits"); return;
    }
    set fractionalDigits(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.globalization.CurrencyFormatter::set fractionalDigits"); return;
    }
    get useGrouping(): boolean {
      notImplemented("public flash.globalization.CurrencyFormatter::get useGrouping"); return;
    }
    set useGrouping(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.CurrencyFormatter::set useGrouping"); return;
    }
    get groupingPattern(): string {
      notImplemented("public flash.globalization.CurrencyFormatter::get groupingPattern"); return;
    }
    set groupingPattern(value: string) {
      value = "" + value;
      notImplemented("public flash.globalization.CurrencyFormatter::set groupingPattern"); return;
    }
    get digitsType(): number /*uint*/ {
      notImplemented("public flash.globalization.CurrencyFormatter::get digitsType"); return;
    }
    set digitsType(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.globalization.CurrencyFormatter::set digitsType"); return;
    }
    get decimalSeparator(): string {
      notImplemented("public flash.globalization.CurrencyFormatter::get decimalSeparator"); return;
    }
    set decimalSeparator(value: string) {
      value = "" + value;
      notImplemented("public flash.globalization.CurrencyFormatter::set decimalSeparator"); return;
    }
    get groupingSeparator(): string {
      notImplemented("public flash.globalization.CurrencyFormatter::get groupingSeparator"); return;
    }
    set groupingSeparator(value: string) {
      value = "" + value;
      notImplemented("public flash.globalization.CurrencyFormatter::set groupingSeparator"); return;
    }
    get negativeSymbol(): string {
      notImplemented("public flash.globalization.CurrencyFormatter::get negativeSymbol"); return;
    }
    set negativeSymbol(value: string) {
      value = "" + value;
      notImplemented("public flash.globalization.CurrencyFormatter::set negativeSymbol"); return;
    }
    get negativeCurrencyFormat(): number /*uint*/ {
      notImplemented("public flash.globalization.CurrencyFormatter::get negativeCurrencyFormat"); return;
    }
    set negativeCurrencyFormat(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.globalization.CurrencyFormatter::set negativeCurrencyFormat"); return;
    }
    get positiveCurrencyFormat(): number /*uint*/ {
      notImplemented("public flash.globalization.CurrencyFormatter::get positiveCurrencyFormat"); return;
    }
    set positiveCurrencyFormat(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.globalization.CurrencyFormatter::set positiveCurrencyFormat"); return;
    }
    get leadingZero(): boolean {
      notImplemented("public flash.globalization.CurrencyFormatter::get leadingZero"); return;
    }
    set leadingZero(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.CurrencyFormatter::set leadingZero"); return;
    }
    get trailingZeros(): boolean {
      notImplemented("public flash.globalization.CurrencyFormatter::get trailingZeros"); return;
    }
    set trailingZeros(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.CurrencyFormatter::set trailingZeros"); return;
    }
  }
}
