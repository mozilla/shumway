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
// Class: EastAsianJustifier
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class EastAsianJustifier extends flash.text.engine.TextJustifier {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["clone"];
    
    constructor (locale: string = "ja", lineJustification: string = "allButLast", justificationStyle: string = "pushInKinsoku") {
      locale = asCoerceString(locale); lineJustification = asCoerceString(lineJustification); justificationStyle = asCoerceString(justificationStyle);
      false && super(undefined, undefined);
      notImplemented("Dummy Constructor: public flash.text.engine.EastAsianJustifier");
    }
    
    // JS -> AS Bindings
    
    clone: () => flash.text.engine.TextJustifier;
    
    // AS -> JS Bindings
    
    // _justificationStyle: string;
    // _composeTrailingIdeographicSpaces: boolean;
    get justificationStyle(): string {
      notImplemented("public flash.text.engine.EastAsianJustifier::get justificationStyle"); return;
      // return this._justificationStyle;
    }
    set justificationStyle(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.text.engine.EastAsianJustifier::set justificationStyle"); return;
      // this._justificationStyle = value;
    }
    get composeTrailingIdeographicSpaces(): boolean {
      notImplemented("public flash.text.engine.EastAsianJustifier::get composeTrailingIdeographicSpaces"); return;
      // return this._composeTrailingIdeographicSpaces;
    }
    set composeTrailingIdeographicSpaces(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.engine.EastAsianJustifier::set composeTrailingIdeographicSpaces"); return;
      // this._composeTrailingIdeographicSpaces = value;
    }
  }
}
