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
// Class: EastAsianJustifier
module Shumway.AVMX.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import axCoerceString = Shumway.AVMX.axCoerceString;
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
      locale = axCoerceString(locale); lineJustification = axCoerceString(lineJustification); justificationStyle = axCoerceString(justificationStyle);
      super(undefined, undefined);
      dummyConstructor("public flash.text.engine.EastAsianJustifier");
    }
    
    // JS -> AS Bindings
    
    clone: () => flash.text.engine.TextJustifier;
    
    // AS -> JS Bindings
    
    // _justificationStyle: string;
    // _composeTrailingIdeographicSpaces: boolean;
    get justificationStyle(): string {
      release || notImplemented("public flash.text.engine.EastAsianJustifier::get justificationStyle"); return;
      // return this._justificationStyle;
    }
    set justificationStyle(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.text.engine.EastAsianJustifier::set justificationStyle"); return;
      // this._justificationStyle = value;
    }
    get composeTrailingIdeographicSpaces(): boolean {
      release || notImplemented("public flash.text.engine.EastAsianJustifier::get composeTrailingIdeographicSpaces"); return;
      // return this._composeTrailingIdeographicSpaces;
    }
    set composeTrailingIdeographicSpaces(value: boolean) {
      value = !!value;
      release || notImplemented("public flash.text.engine.EastAsianJustifier::set composeTrailingIdeographicSpaces"); return;
      // this._composeTrailingIdeographicSpaces = value;
    }
  }
}
