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
// Class: ObjectOutput
module Shumway.AVM2.AS.flash.utils {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class ObjectOutput extends ASNative implements flash.utils.IDataOutput {
    
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
      notImplemented("Dummy Constructor: packageInternal flash.utils.ObjectOutput");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _objectEncoding: number /*uint*/;
    // _endian: string;
    get objectEncoding(): number /*uint*/ {
      notImplemented("packageInternal flash.utils.ObjectOutput::get objectEncoding"); return;
      // return this._objectEncoding;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("packageInternal flash.utils.ObjectOutput::set objectEncoding"); return;
      // this._objectEncoding = version;
    }
    get endian(): string {
      notImplemented("packageInternal flash.utils.ObjectOutput::get endian"); return;
      // return this._endian;
    }
    set endian(type: string) {
      type = asCoerceString(type);
      notImplemented("packageInternal flash.utils.ObjectOutput::set endian"); return;
      // this._endian = type;
    }
    writeBytes(bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
      bytes = bytes; offset = offset >>> 0; length = length >>> 0;
      notImplemented("packageInternal flash.utils.ObjectOutput::writeBytes"); return;
    }
    writeBoolean(value: boolean): void {
      value = !!value;
      notImplemented("packageInternal flash.utils.ObjectOutput::writeBoolean"); return;
    }
    writeByte(value: number /*int*/): void {
      value = value | 0;
      notImplemented("packageInternal flash.utils.ObjectOutput::writeByte"); return;
    }
    writeShort(value: number /*int*/): void {
      value = value | 0;
      notImplemented("packageInternal flash.utils.ObjectOutput::writeShort"); return;
    }
    writeInt(value: number /*int*/): void {
      value = value | 0;
      notImplemented("packageInternal flash.utils.ObjectOutput::writeInt"); return;
    }
    writeUnsignedInt(value: number /*uint*/): void {
      value = value >>> 0;
      notImplemented("packageInternal flash.utils.ObjectOutput::writeUnsignedInt"); return;
    }
    writeFloat(value: number): void {
      value = +value;
      notImplemented("packageInternal flash.utils.ObjectOutput::writeFloat"); return;
    }
    writeDouble(value: number): void {
      value = +value;
      notImplemented("packageInternal flash.utils.ObjectOutput::writeDouble"); return;
    }
    writeMultiByte(value: string, charSet: string): void {
      value = asCoerceString(value); charSet = asCoerceString(charSet);
      notImplemented("packageInternal flash.utils.ObjectOutput::writeMultiByte"); return;
    }
    writeUTF(value: string): void {
      value = asCoerceString(value);
      notImplemented("packageInternal flash.utils.ObjectOutput::writeUTF"); return;
    }
    writeUTFBytes(value: string): void {
      value = asCoerceString(value);
      notImplemented("packageInternal flash.utils.ObjectOutput::writeUTFBytes"); return;
    }
    writeObject(object: any): void {
      
      notImplemented("packageInternal flash.utils.ObjectOutput::writeObject"); return;
    }
  }
}
