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
// Class: ShaderJob
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ShaderJob extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor (shader: flash.display.Shader = null, target: ASObject = null, width: number /*int*/ = 0, height: number /*int*/ = 0) {
      shader = shader; target = target; width = width | 0; height = height | 0;
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.display.ShaderJob");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    start(waitForCompletion: boolean = false): void {
      waitForCompletion = !!waitForCompletion;
      notImplemented("public flash.display.ShaderJob::start"); return;
    }
    cancel(): void {
      notImplemented("public flash.display.ShaderJob::cancel"); return;
    }
    get shader(): flash.display.Shader {
      notImplemented("public flash.display.ShaderJob::get shader"); return;
    }
    set shader(s: flash.display.Shader) {
      s = s;
      notImplemented("public flash.display.ShaderJob::set shader"); return;
    }
    get target(): ASObject {
      notImplemented("public flash.display.ShaderJob::get target"); return;
    }
    set target(s: ASObject) {
      s = s;
      notImplemented("public flash.display.ShaderJob::set target"); return;
    }
    get width(): number /*int*/ {
      notImplemented("public flash.display.ShaderJob::get width"); return;
    }
    set width(v: number /*int*/) {
      v = v | 0;
      notImplemented("public flash.display.ShaderJob::set width"); return;
    }
    get height(): number /*int*/ {
      notImplemented("public flash.display.ShaderJob::get height"); return;
    }
    set height(v: number /*int*/) {
      v = v | 0;
      notImplemented("public flash.display.ShaderJob::set height"); return;
    }
    get progress(): number {
      notImplemented("public flash.display.ShaderJob::get progress"); return;
    }
  }
}
