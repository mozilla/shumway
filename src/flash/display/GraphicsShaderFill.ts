/**
 * Copyright 2014 Mozilla Foundation
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
// Class: GraphicsShaderFill
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class GraphicsShaderFill extends ASNative implements IGraphicsFill, IGraphicsData {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["shader", "matrix"];
    
    constructor (shader: flash.display.Shader = null, matrix: flash.geom.Matrix = null) {
      shader = shader; matrix = matrix;
      false && super();
      dummyConstructor("public flash.display.GraphicsShaderFill");
    }
    
    // JS -> AS Bindings
    
    shader: flash.display.Shader;
    matrix: flash.geom.Matrix;
    
    // AS -> JS Bindings
    
  }
}
