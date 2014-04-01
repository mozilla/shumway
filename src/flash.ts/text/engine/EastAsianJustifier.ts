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
// Class: EastAsianJustifier
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class EastAsianJustifier extends flash.text.engine.TextJustifier {
    static initializer: any = null;
    constructor (locale: string = "ja", lineJustification: string = "allButLast", justificationStyle: string = "pushInKinsoku") {
      locale = "" + locale; lineJustification = "" + lineJustification; justificationStyle = "" + justificationStyle;
      false && super(undefined, undefined);
      notImplemented("Dummy Constructor: public flash.text.engine.EastAsianJustifier");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.text.engine.TextJustifier;
    // Instance AS -> JS Bindings
    get justificationStyle(): string {
      notImplemented("public flash.text.engine.EastAsianJustifier::get justificationStyle"); return;
    }
    set justificationStyle(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.EastAsianJustifier::set justificationStyle"); return;
    }
    get composeTrailingIdeographicSpaces(): boolean {
      notImplemented("public flash.text.engine.EastAsianJustifier::get composeTrailingIdeographicSpaces"); return;
    }
    set composeTrailingIdeographicSpaces(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.engine.EastAsianJustifier::set composeTrailingIdeographicSpaces"); return;
    }
  }
}
