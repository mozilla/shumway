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
// Class: CurrencyParseResult
module Shumway.AVMX.AS.flash.globalization {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class CurrencyParseResult extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor (value: number = NaN, symbol: string = "") {
      super();
      value = +value; symbol = axCoerceString(symbol);
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _value: number;
    // _currencyString: string;
    get value(): number {
      release || notImplemented("public flash.globalization.CurrencyParseResult::get value"); return;
      // return this._value;
    }
    get currencyString(): string {
      release || notImplemented("public flash.globalization.CurrencyParseResult::get currencyString"); return;
      // return this._currencyString;
    }
    ctor(value: number, symbol: string): void {
      value = +value; symbol = axCoerceString(symbol);
      release || notImplemented("public flash.globalization.CurrencyParseResult::ctor"); return;
    }
  }
}
