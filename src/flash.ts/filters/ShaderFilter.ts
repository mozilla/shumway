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
// Class: ShaderFilter
module Shumway.AVM2.AS.flash.filters {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ShaderFilter extends flash.filters.BitmapFilter {
    static initializer: any = null;
    constructor (shader: flash.display.Shader = null) {
      shader = shader;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.ShaderFilter");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    leftExtension: number /*int*/;
    topExtension: number /*int*/;
    rightExtension: number /*int*/;
    bottomExtension: number /*int*/;
    // Instance AS -> JS Bindings
    get shader(): flash.display.Shader {
      notImplemented("public flash.filters.ShaderFilter::get shader"); return;
    }
    set shader(shader: flash.display.Shader) {
      shader = shader;
      notImplemented("public flash.filters.ShaderFilter::set shader"); return;
    }
    get _extendBy(): flash.geom.Rectangle {
      notImplemented("public flash.filters.ShaderFilter::get _extendBy"); return;
    }
    set _extendBy(extend: flash.geom.Rectangle) {
      extend = extend;
      notImplemented("public flash.filters.ShaderFilter::set _extendBy"); return;
    }
  }
}
