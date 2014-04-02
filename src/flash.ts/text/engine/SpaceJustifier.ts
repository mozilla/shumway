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
// Class: SpaceJustifier
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class SpaceJustifier extends flash.text.engine.TextJustifier {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["clone"];
    
    constructor (locale: string = "en", lineJustification: string = "unjustified", letterSpacing: boolean = false) {
      locale = "" + locale; lineJustification = "" + lineJustification; letterSpacing = !!letterSpacing;
      false && super(undefined, undefined);
      notImplemented("Dummy Constructor: public flash.text.engine.SpaceJustifier");
    }
    
    // JS -> AS Bindings
    
    clone: () => flash.text.engine.TextJustifier;
    
    // AS -> JS Bindings
    
    // _letterSpacing: boolean;
    // _minimumSpacing: number;
    // _optimumSpacing: number;
    // _maximumSpacing: number;
    get letterSpacing(): boolean {
      notImplemented("public flash.text.engine.SpaceJustifier::get letterSpacing"); return;
      // return this._letterSpacing;
    }
    set letterSpacing(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.engine.SpaceJustifier::set letterSpacing"); return;
      // this._letterSpacing = value;
    }
    get minimumSpacing(): number {
      notImplemented("public flash.text.engine.SpaceJustifier::get minimumSpacing"); return;
      // return this._minimumSpacing;
    }
    set minimumSpacing(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.SpaceJustifier::set minimumSpacing"); return;
      // this._minimumSpacing = value;
    }
    get optimumSpacing(): number {
      notImplemented("public flash.text.engine.SpaceJustifier::get optimumSpacing"); return;
      // return this._optimumSpacing;
    }
    set optimumSpacing(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.SpaceJustifier::set optimumSpacing"); return;
      // this._optimumSpacing = value;
    }
    get maximumSpacing(): number {
      notImplemented("public flash.text.engine.SpaceJustifier::get maximumSpacing"); return;
      // return this._maximumSpacing;
    }
    set maximumSpacing(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.SpaceJustifier::set maximumSpacing"); return;
      // this._maximumSpacing = value;
    }
  }
}
