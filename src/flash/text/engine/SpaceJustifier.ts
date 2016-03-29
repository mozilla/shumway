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
// Class: SpaceJustifier
module Shumway.AVMX.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class SpaceJustifier extends flash.text.engine.TextJustifier {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["clone"];
    
    constructor (locale: string = "en", lineJustification: string = "unjustified", letterSpacing: boolean = false) {
      locale = axCoerceString(locale); lineJustification = axCoerceString(lineJustification); letterSpacing = !!letterSpacing;
      super(undefined, undefined);
      dummyConstructor("public flash.text.engine.SpaceJustifier");
    }
    
    // JS -> AS Bindings
    
    clone: () => flash.text.engine.TextJustifier;
    
    // AS -> JS Bindings
    
    // _letterSpacing: boolean;
    // _minimumSpacing: number;
    // _optimumSpacing: number;
    // _maximumSpacing: number;
    get letterSpacing(): boolean {
      release || notImplemented("public flash.text.engine.SpaceJustifier::get letterSpacing"); return;
      // return this._letterSpacing;
    }
    set letterSpacing(value: boolean) {
      value = !!value;
      release || notImplemented("public flash.text.engine.SpaceJustifier::set letterSpacing"); return;
      // this._letterSpacing = value;
    }
    get minimumSpacing(): number {
      release || notImplemented("public flash.text.engine.SpaceJustifier::get minimumSpacing"); return;
      // return this._minimumSpacing;
    }
    set minimumSpacing(value: number) {
      value = +value;
      release || notImplemented("public flash.text.engine.SpaceJustifier::set minimumSpacing"); return;
      // this._minimumSpacing = value;
    }
    get optimumSpacing(): number {
      release || notImplemented("public flash.text.engine.SpaceJustifier::get optimumSpacing"); return;
      // return this._optimumSpacing;
    }
    set optimumSpacing(value: number) {
      value = +value;
      release || notImplemented("public flash.text.engine.SpaceJustifier::set optimumSpacing"); return;
      // this._optimumSpacing = value;
    }
    get maximumSpacing(): number {
      release || notImplemented("public flash.text.engine.SpaceJustifier::get maximumSpacing"); return;
      // return this._maximumSpacing;
    }
    set maximumSpacing(value: number) {
      value = +value;
      release || notImplemented("public flash.text.engine.SpaceJustifier::set maximumSpacing"); return;
      // this._maximumSpacing = value;
    }
  }
}
