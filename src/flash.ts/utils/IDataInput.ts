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
// Class: IDataInput
module Shumway.AVM2.AS.flash.utils {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export interface IDataInput {
    
    // JS -> AS Bindings
    
    readBytes: (bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0) => void;
    readBoolean: () => boolean;
    readByte: () => number /*int*/;
    readUnsignedByte: () => number /*uint*/;
    readShort: () => number /*int*/;
    readUnsignedShort: () => number /*uint*/;
    readInt: () => number /*int*/;
    readUnsignedInt: () => number /*uint*/;
    readFloat: () => number;
    readDouble: () => number;
    readMultiByte: (length: number /*uint*/, charSet: string) => string;
    readUTF: () => string;
    readUTFBytes: (length: number /*uint*/) => string;
    bytesAvailable: number /*uint*/;
    readObject: () => any;
    objectEncoding: number /*uint*/;
    endian: string;
    
    // AS -> JS Bindings
    
    // _bytesAvailable: number /*uint*/;
    // _objectEncoding: number /*uint*/;
    // _endian: string;
  }
}
