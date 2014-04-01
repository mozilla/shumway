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
// Class: TabStop
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TabStop extends ASNative {
    static initializer: any = null;
    constructor (alignment: string = "start", position: number = 0, decimalAlignmentToken: string = "") {
      alignment = "" + alignment; position = +position; decimalAlignmentToken = "" + decimalAlignmentToken;
      false && super();
      notImplemented("Dummy Constructor: public flash.text.engine.TabStop");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get alignment(): string {
      notImplemented("public flash.text.engine.TabStop::get alignment"); return;
    }
    set alignment(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.TabStop::set alignment"); return;
    }
    get position(): number {
      notImplemented("public flash.text.engine.TabStop::get position"); return;
    }
    set position(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.TabStop::set position"); return;
    }
    get decimalAlignmentToken(): string {
      notImplemented("public flash.text.engine.TabStop::get decimalAlignmentToken"); return;
    }
    set decimalAlignmentToken(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.TabStop::set decimalAlignmentToken"); return;
    }
  }
}
