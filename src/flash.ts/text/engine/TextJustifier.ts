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
// Class: TextJustifier
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TextJustifier extends ASNative {
    static initializer: any = null;
    constructor (locale: string, lineJustification: string) {
      locale = "" + locale; lineJustification = "" + lineJustification;
      false && super();
      notImplemented("Dummy Constructor: public flash.text.engine.TextJustifier");
    }
    // Static   JS -> AS Bindings
    static getJustifierForLocale: (locale: string) => flash.text.engine.TextJustifier;
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.text.engine.TextJustifier;
    // Instance AS -> JS Bindings
    get locale(): string {
      notImplemented("public flash.text.engine.TextJustifier::get locale"); return;
    }
    setLocale(value: string): void {
      value = "" + value;
      notImplemented("public flash.text.engine.TextJustifier::setLocale"); return;
    }
    get lineJustification(): string {
      notImplemented("public flash.text.engine.TextJustifier::get lineJustification"); return;
    }
    set lineJustification(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.TextJustifier::set lineJustification"); return;
    }
  }
}
