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
// Class: IndexBuffer3D
module Shumway.AVMX.AS.flash.display3D {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class IndexBuffer3D extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    uploadFromVector(data: ASVector<any>, startOffset: number /*int*/, count: number /*int*/): void {
      data = data; startOffset = startOffset | 0; count = count | 0;
      release || notImplemented("public flash.display3D.IndexBuffer3D::uploadFromVector"); return;
    }
    uploadFromByteArray(data: flash.utils.ByteArray, byteArrayOffset: number /*int*/, startOffset: number /*int*/, count: number /*int*/): void {
      data = data; byteArrayOffset = byteArrayOffset | 0; startOffset = startOffset | 0; count = count | 0;
      release || notImplemented("public flash.display3D.IndexBuffer3D::uploadFromByteArray"); return;
    }
    dispose(): void {
      release || notImplemented("public flash.display3D.IndexBuffer3D::dispose"); return;
    }
  }
}
