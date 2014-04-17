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
 * limitations under the License.
 */
// Class: TextJustifier
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class TextJustifier extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // ["getJustifierForLocale"];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["clone"];
    
    constructor (locale: string, lineJustification: string) {
      locale = asCoerceString(locale); lineJustification = asCoerceString(lineJustification);
      false && super();
      notImplemented("Dummy Constructor: public flash.text.engine.TextJustifier");
    }
    
    // JS -> AS Bindings
    static getJustifierForLocale: (locale: string) => flash.text.engine.TextJustifier;
    
    clone: () => flash.text.engine.TextJustifier;
    
    // AS -> JS Bindings
    
    // _locale: string;
    // _lineJustification: string;
    get locale(): string {
      notImplemented("public flash.text.engine.TextJustifier::get locale"); return;
      // return this._locale;
    }
    get lineJustification(): string {
      notImplemented("public flash.text.engine.TextJustifier::get lineJustification"); return;
      // return this._lineJustification;
    }
    set lineJustification(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.text.engine.TextJustifier::set lineJustification"); return;
      // this._lineJustification = value;
    }
    setLocale(value: string): void {
      value = asCoerceString(value);
      notImplemented("public flash.text.engine.TextJustifier::setLocale"); return;
    }
  }
}
