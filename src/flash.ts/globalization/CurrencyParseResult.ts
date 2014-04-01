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
// Class: CurrencyParseResult
module Shumway.AVM2.AS.flash.globalization {
  import notImplemented = Shumway.Debug.notImplemented;
  export class CurrencyParseResult extends ASNative {
    static initializer: any = null;
    constructor (value: number = NaN, symbol: string = "") {
      value = +value; symbol = "" + symbol;
      false && super();
      notImplemented("Dummy Constructor: public flash.globalization.CurrencyParseResult");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    ctor(value: number, symbol: string): void {
      value = +value; symbol = "" + symbol;
      notImplemented("public flash.globalization.CurrencyParseResult::ctor"); return;
    }
    get value(): number {
      notImplemented("public flash.globalization.CurrencyParseResult::get value"); return;
    }
    get currencyString(): string {
      notImplemented("public flash.globalization.CurrencyParseResult::get currencyString"); return;
    }
  }
}
