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
// Class: TabStop
module Shumway.AVMX.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class TabStop extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor (alignment: string = "start", position: number = 0, decimalAlignmentToken: string = "") {
      alignment = axCoerceString(alignment); position = +position; decimalAlignmentToken = axCoerceString(decimalAlignmentToken);
      super();
      dummyConstructor("public flash.text.engine.TabStop");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _alignment: string;
    // _position: number;
    // _decimalAlignmentToken: string;
    get alignment(): string {
      release || notImplemented("public flash.text.engine.TabStop::get alignment"); return;
      // return this._alignment;
    }
    set alignment(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.text.engine.TabStop::set alignment"); return;
      // this._alignment = value;
    }
    get position(): number {
      release || notImplemented("public flash.text.engine.TabStop::get position"); return;
      // return this._position;
    }
    set position(value: number) {
      value = +value;
      release || notImplemented("public flash.text.engine.TabStop::set position"); return;
      // this._position = value;
    }
    get decimalAlignmentToken(): string {
      release || notImplemented("public flash.text.engine.TabStop::get decimalAlignmentToken"); return;
      // return this._decimalAlignmentToken;
    }
    set decimalAlignmentToken(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.text.engine.TabStop::set decimalAlignmentToken"); return;
      // this._decimalAlignmentToken = value;
    }
  }
}
