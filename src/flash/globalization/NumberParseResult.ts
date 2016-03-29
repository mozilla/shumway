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
// Class: NumberParseResult
module Shumway.AVMX.AS.flash.globalization {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class NumberParseResult extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor (value: number = NaN, startIndex: number /*int*/ = 2147483647, endIndex: number /*int*/ = 2147483647) {
      super();
      value = +value; startIndex = startIndex | 0; endIndex = endIndex | 0;
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _value: number;
    // _startIndex: number /*int*/;
    // _endIndex: number /*int*/;
    get value(): number {
      release || notImplemented("public flash.globalization.NumberParseResult::get value"); return;
      // return this._value;
    }
    get startIndex(): number /*int*/ {
      release || notImplemented("public flash.globalization.NumberParseResult::get startIndex"); return;
      // return this._startIndex;
    }
    get endIndex(): number /*int*/ {
      release || notImplemented("public flash.globalization.NumberParseResult::get endIndex"); return;
      // return this._endIndex;
    }
    ctor(value: number, startIndex: number /*int*/, endIndex: number /*int*/): void {
      value = +value; startIndex = startIndex | 0; endIndex = endIndex | 0;
      release || notImplemented("public flash.globalization.NumberParseResult::ctor"); return;
    }
  }
}
