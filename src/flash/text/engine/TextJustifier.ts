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
// Class: TextJustifier
module Shumway.AVMX.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class TextJustifier extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // ["getJustifierForLocale"];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["clone"];
    
    constructor (locale: string, lineJustification: string) {
      locale = axCoerceString(locale); lineJustification = axCoerceString(lineJustification);
      super();
      dummyConstructor("public flash.text.engine.TextJustifier");
    }
    
    // JS -> AS Bindings
    static getJustifierForLocale: (locale: string) => flash.text.engine.TextJustifier;
    
    clone: () => flash.text.engine.TextJustifier;
    
    // AS -> JS Bindings
    
    // _locale: string;
    // _lineJustification: string;
    get locale(): string {
      release || notImplemented("public flash.text.engine.TextJustifier::get locale"); return;
      // return this._locale;
    }
    get lineJustification(): string {
      release || notImplemented("public flash.text.engine.TextJustifier::get lineJustification"); return;
      // return this._lineJustification;
    }
    set lineJustification(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.text.engine.TextJustifier::set lineJustification"); return;
      // this._lineJustification = value;
    }
    setLocale(value: string): void {
      value = axCoerceString(value);
      release || notImplemented("public flash.text.engine.TextJustifier::setLocale"); return;
    }
  }
}
