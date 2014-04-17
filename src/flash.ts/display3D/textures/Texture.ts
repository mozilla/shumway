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
// Class: Texture
module Shumway.AVM2.AS.flash.display3D.textures {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class Texture extends flash.display3D.textures.TextureBase {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display3D.textures.Texture");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    uploadFromBitmapData(source: flash.display.BitmapData, miplevel: number /*uint*/ = 0): void {
      source = source; miplevel = miplevel >>> 0;
      notImplemented("public flash.display3D.textures.Texture::uploadFromBitmapData"); return;
    }
    uploadFromByteArray(data: flash.utils.ByteArray, byteArrayOffset: number /*uint*/, miplevel: number /*uint*/ = 0): void {
      data = data; byteArrayOffset = byteArrayOffset >>> 0; miplevel = miplevel >>> 0;
      notImplemented("public flash.display3D.textures.Texture::uploadFromByteArray"); return;
    }
    uploadCompressedTextureFromByteArray(data: flash.utils.ByteArray, byteArrayOffset: number /*uint*/, async: boolean = false): void {
      data = data; byteArrayOffset = byteArrayOffset >>> 0; async = !!async;
      notImplemented("public flash.display3D.textures.Texture::uploadCompressedTextureFromByteArray"); return;
    }
  }
}
