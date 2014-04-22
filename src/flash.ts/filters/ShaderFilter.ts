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
 * limitations under the License.
 */
// Class: ShaderFilter
module Shumway.AVM2.AS.flash.filters {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class ShaderFilter extends flash.filters.BitmapFilter {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["leftExtension", "leftExtension", "topExtension", "topExtension", "rightExtension", "rightExtension", "bottomExtension", "bottomExtension"];
    
    constructor (shader: flash.display.Shader = null) {
      shader = shader;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.ShaderFilter");
    }
    
    // JS -> AS Bindings
    
    leftExtension: number /*int*/;
    topExtension: number /*int*/;
    rightExtension: number /*int*/;
    bottomExtension: number /*int*/;
    
    // AS -> JS Bindings
    
    // _shader: flash.display.Shader;
    // _leftExtension: number /*int*/;
    // _topExtension: number /*int*/;
    // _rightExtension: number /*int*/;
    // _bottomExtension: number /*int*/;
    get shader(): flash.display.Shader {
      notImplemented("public flash.filters.ShaderFilter::get shader"); return;
      // return this._shader;
    }
    set shader(shader: flash.display.Shader) {
      shader = shader;
      notImplemented("public flash.filters.ShaderFilter::set shader"); return;
      // this._shader = shader;
    }
  }
}
