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
// Class: ShaderParameterType
module Shumway.AVMX.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVMX.asCoerceString;
  export class ShaderParameterType extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super();
      dummyConstructor("public flash.display.ShaderParameterType");
    }
    
    // JS -> AS Bindings
    static FLOAT: string = "float";
    static FLOAT2: string = "float2";
    static FLOAT3: string = "float3";
    static FLOAT4: string = "float4";
    static INT: string = "int";
    static INT2: string = "int2";
    static INT3: string = "int3";
    static INT4: string = "int4";
    static BOOL: string = "bool";
    static BOOL2: string = "bool2";
    static BOOL3: string = "bool3";
    static BOOL4: string = "bool4";
    static MATRIX2X2: string = "matrix2x2";
    static MATRIX3X3: string = "matrix3x3";
    static MATRIX4X4: string = "matrix4x4";
    
    
    // AS -> JS Bindings
    
  }
}
