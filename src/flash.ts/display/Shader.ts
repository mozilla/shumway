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
// Class: Shader
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Shader extends ASNative {
    static initializer: any = null;
    constructor (code: flash.utils.ByteArray = null) {
      code = code;
      false && super();
      notImplemented("Dummy Constructor: public flash.display.Shader");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    byteCode: flash.utils.ByteArray;
    // Instance AS -> JS Bindings
    get data(): flash.display.ShaderData {
      notImplemented("public flash.display.Shader::get data"); return;
    }
    set data(p: flash.display.ShaderData) {
      p = p;
      notImplemented("public flash.display.Shader::set data"); return;
    }
    get precisionHint(): string {
      notImplemented("public flash.display.Shader::get precisionHint"); return;
    }
    set precisionHint(p: string) {
      p = "" + p;
      notImplemented("public flash.display.Shader::set precisionHint"); return;
    }
  }
}
