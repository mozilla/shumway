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
// Class: ObjectInput
module Shumway.AVM2.AS.flash.utils {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class ObjectInput extends ASNative implements flash.utils.IDataInput {
    
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
      notImplemented("Dummy Constructor: packageInternal flash.utils.ObjectInput");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _bytesAvailable: number /*uint*/;
    // _objectEncoding: number /*uint*/;
    // _endian: string;
    get bytesAvailable(): number /*uint*/ {
      notImplemented("packageInternal flash.utils.ObjectInput::get bytesAvailable"); return;
      // return this._bytesAvailable;
    }
    get objectEncoding(): number /*uint*/ {
      notImplemented("packageInternal flash.utils.ObjectInput::get objectEncoding"); return;
      // return this._objectEncoding;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("packageInternal flash.utils.ObjectInput::set objectEncoding"); return;
      // this._objectEncoding = version;
    }
    get endian(): string {
      notImplemented("packageInternal flash.utils.ObjectInput::get endian"); return;
      // return this._endian;
    }
    set endian(type: string) {
      type = asCoerceString(type);
      notImplemented("packageInternal flash.utils.ObjectInput::set endian"); return;
      // this._endian = type;
    }
    readBytes(bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
      bytes = bytes; offset = offset >>> 0; length = length >>> 0;
      notImplemented("packageInternal flash.utils.ObjectInput::readBytes"); return;
    }
    readBoolean(): boolean {
      notImplemented("packageInternal flash.utils.ObjectInput::readBoolean"); return;
    }
    readByte(): number /*int*/ {
      notImplemented("packageInternal flash.utils.ObjectInput::readByte"); return;
    }
    readUnsignedByte(): number /*uint*/ {
      notImplemented("packageInternal flash.utils.ObjectInput::readUnsignedByte"); return;
    }
    readShort(): number /*int*/ {
      notImplemented("packageInternal flash.utils.ObjectInput::readShort"); return;
    }
    readUnsignedShort(): number /*uint*/ {
      notImplemented("packageInternal flash.utils.ObjectInput::readUnsignedShort"); return;
    }
    readInt(): number /*int*/ {
      notImplemented("packageInternal flash.utils.ObjectInput::readInt"); return;
    }
    readUnsignedInt(): number /*uint*/ {
      notImplemented("packageInternal flash.utils.ObjectInput::readUnsignedInt"); return;
    }
    readFloat(): number {
      notImplemented("packageInternal flash.utils.ObjectInput::readFloat"); return;
    }
    readDouble(): number {
      notImplemented("packageInternal flash.utils.ObjectInput::readDouble"); return;
    }
    readMultiByte(length: number /*uint*/, charSet: string): string {
      length = length >>> 0; charSet = asCoerceString(charSet);
      notImplemented("packageInternal flash.utils.ObjectInput::readMultiByte"); return;
    }
    readUTF(): string {
      notImplemented("packageInternal flash.utils.ObjectInput::readUTF"); return;
    }
    readUTFBytes(length: number /*uint*/): string {
      length = length >>> 0;
      notImplemented("packageInternal flash.utils.ObjectInput::readUTFBytes"); return;
    }
    readObject(): any {
      notImplemented("packageInternal flash.utils.ObjectInput::readObject"); return;
    }
  }
}
