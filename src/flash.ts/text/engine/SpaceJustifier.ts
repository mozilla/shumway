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
    static initializer: any = null;
    constructor (locale: string = "en", lineJustification: string = "unjustified", letterSpacing: boolean = false) {
      locale = "" + locale; lineJustification = "" + lineJustification; letterSpacing = !!letterSpacing;
      false && super(undefined, undefined);
      notImplemented("Dummy Constructor: public flash.text.engine.SpaceJustifier");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.text.engine.TextJustifier;
    // Instance AS -> JS Bindings
    get letterSpacing(): boolean {
      notImplemented("public flash.text.engine.SpaceJustifier::get letterSpacing"); return;
    }
    set letterSpacing(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.engine.SpaceJustifier::set letterSpacing"); return;
    }
    get minimumSpacing(): number {
      notImplemented("public flash.text.engine.SpaceJustifier::get minimumSpacing"); return;
    }
    set minimumSpacing(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.SpaceJustifier::set minimumSpacing"); return;
    }
    get optimumSpacing(): number {
      notImplemented("public flash.text.engine.SpaceJustifier::get optimumSpacing"); return;
    }
    set optimumSpacing(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.SpaceJustifier::set optimumSpacing"); return;
    }
    get maximumSpacing(): number {
      notImplemented("public flash.text.engine.SpaceJustifier::get maximumSpacing"); return;
    }
    set maximumSpacing(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.SpaceJustifier::set maximumSpacing"); return;
    }
    cloneSpacing(justifier: flash.text.engine.SpaceJustifier): void {
      justifier = justifier;
      notImplemented("public flash.text.engine.SpaceJustifier::cloneSpacing"); return;
    }
  }
}
