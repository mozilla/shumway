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
// Class: ShaderInput
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ShaderInput extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.ShaderInput");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get input(): ASObject {
      notImplemented("public flash.display.ShaderInput::get input"); return;
    }
    set input(input: ASObject) {
      input = input;
      notImplemented("public flash.display.ShaderInput::set input"); return;
    }
    get width(): number /*int*/ {
      notImplemented("public flash.display.ShaderInput::get width"); return;
    }
    set width(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.display.ShaderInput::set width"); return;
    }
    get height(): number /*int*/ {
      notImplemented("public flash.display.ShaderInput::get height"); return;
    }
    set height(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.display.ShaderInput::set height"); return;
    }
    get channels(): number /*int*/ {
      notImplemented("public flash.display.ShaderInput::get channels"); return;
    }
    get index(): number /*int*/ {
      notImplemented("public flash.display.ShaderInput::get index"); return;
    }
  }
}
