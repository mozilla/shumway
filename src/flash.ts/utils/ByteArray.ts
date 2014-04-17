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
// Class: ByteArray
module Shumway.AVM2.AS.flash.utils {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class ByteArray extends ASNative implements IDataInput2, IDataOutput2 {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // ["_defaultObjectEncoding"];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["deflate", "compress", "inflate", "uncompress"];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.utils.ByteArray");
    }
    
    // JS -> AS Bindings
    static _defaultObjectEncoding: number /*uint*/;
    
    deflate: () => void;
    compress: (algorithm: string = "zlib") => void;
    inflate: () => void;
    uncompress: (algorithm: string = "zlib") => void;
    
    // AS -> JS Bindings
    // static _defaultObjectEncoding: number /*uint*/;
    get defaultObjectEncoding(): number /*uint*/ {
      notImplemented("public flash.utils.ByteArray::get defaultObjectEncoding"); return;
      // return this._defaultObjectEncoding;
    }
    set defaultObjectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("public flash.utils.ByteArray::set defaultObjectEncoding"); return;
      // this._defaultObjectEncoding = version;
    }
    
    // _length: number /*uint*/;
    // _bytesAvailable: number /*uint*/;
    // _position: number /*uint*/;
    // _objectEncoding: number /*uint*/;
    // _endian: string;
    readBytes(bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
      bytes = bytes; offset = offset >>> 0; length = length >>> 0;
      notImplemented("public flash.utils.ByteArray::readBytes"); return;
    }
    writeBytes(bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
      bytes = bytes; offset = offset >>> 0; length = length >>> 0;
      notImplemented("public flash.utils.ByteArray::writeBytes"); return;
    }
    writeBoolean(value: boolean): void {
      value = !!value;
      notImplemented("public flash.utils.ByteArray::writeBoolean"); return;
    }
    writeByte(value: number /*int*/): void {
      value = value | 0;
      notImplemented("public flash.utils.ByteArray::writeByte"); return;
    }
    writeShort(value: number /*int*/): void {
      value = value | 0;
      notImplemented("public flash.utils.ByteArray::writeShort"); return;
    }
    writeInt(value: number /*int*/): void {
      value = value | 0;
      notImplemented("public flash.utils.ByteArray::writeInt"); return;
    }
    writeUnsignedInt(value: number /*uint*/): void {
      value = value >>> 0;
      notImplemented("public flash.utils.ByteArray::writeUnsignedInt"); return;
    }
    writeFloat(value: number): void {
      value = +value;
      notImplemented("public flash.utils.ByteArray::writeFloat"); return;
    }
    writeDouble(value: number): void {
      value = +value;
      notImplemented("public flash.utils.ByteArray::writeDouble"); return;
    }
    writeMultiByte(value: string, charSet: string): void {
      value = asCoerceString(value); charSet = asCoerceString(charSet);
      notImplemented("public flash.utils.ByteArray::writeMultiByte"); return;
    }
    writeUTF(value: string): void {
      value = asCoerceString(value);
      notImplemented("public flash.utils.ByteArray::writeUTF"); return;
    }
    writeUTFBytes(value: string): void {
      value = asCoerceString(value);
      notImplemented("public flash.utils.ByteArray::writeUTFBytes"); return;
    }
    readBoolean(): boolean {
      notImplemented("public flash.utils.ByteArray::readBoolean"); return;
    }
    readByte(): number /*int*/ {
      notImplemented("public flash.utils.ByteArray::readByte"); return;
    }
    readUnsignedByte(): number /*uint*/ {
      notImplemented("public flash.utils.ByteArray::readUnsignedByte"); return;
    }
    readShort(): number /*int*/ {
      notImplemented("public flash.utils.ByteArray::readShort"); return;
    }
    readUnsignedShort(): number /*uint*/ {
      notImplemented("public flash.utils.ByteArray::readUnsignedShort"); return;
    }
    readInt(): number /*int*/ {
      notImplemented("public flash.utils.ByteArray::readInt"); return;
    }
    readUnsignedInt(): number /*uint*/ {
      notImplemented("public flash.utils.ByteArray::readUnsignedInt"); return;
    }
    readFloat(): number {
      notImplemented("public flash.utils.ByteArray::readFloat"); return;
    }
    readDouble(): number {
      notImplemented("public flash.utils.ByteArray::readDouble"); return;
    }
    readMultiByte(length: number /*uint*/, charSet: string): string {
      length = length >>> 0; charSet = asCoerceString(charSet);
      notImplemented("public flash.utils.ByteArray::readMultiByte"); return;
    }
    readUTF(): string {
      notImplemented("public flash.utils.ByteArray::readUTF"); return;
    }
    readUTFBytes(length: number /*uint*/): string {
      length = length >>> 0;
      notImplemented("public flash.utils.ByteArray::readUTFBytes"); return;
    }
    get length(): number /*uint*/ {
      notImplemented("public flash.utils.ByteArray::get length"); return;
      // return this._length;
    }
    set length(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.utils.ByteArray::set length"); return;
      // this._length = value;
    }
    writeObject(object: any): void {
      
      notImplemented("public flash.utils.ByteArray::writeObject"); return;
    }
    readObject(): any {
      notImplemented("public flash.utils.ByteArray::readObject"); return;
    }
    _compress(algorithm: string): void {
      algorithm = asCoerceString(algorithm);
      notImplemented("public flash.utils.ByteArray::_compress"); return;
    }
    _uncompress(algorithm: string): void {
      algorithm = asCoerceString(algorithm);
      notImplemented("public flash.utils.ByteArray::_uncompress"); return;
    }
    toString(): string {
      notImplemented("public flash.utils.ByteArray::toString"); return;
    }
    get bytesAvailable(): number /*uint*/ {
      notImplemented("public flash.utils.ByteArray::get bytesAvailable"); return;
      // return this._bytesAvailable;
    }
    get position(): number /*uint*/ {
      notImplemented("public flash.utils.ByteArray::get position"); return;
      // return this._position;
    }
    set position(offset: number /*uint*/) {
      offset = offset >>> 0;
      notImplemented("public flash.utils.ByteArray::set position"); return;
      // this._position = offset;
    }
    get objectEncoding(): number /*uint*/ {
      notImplemented("public flash.utils.ByteArray::get objectEncoding"); return;
      // return this._objectEncoding;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("public flash.utils.ByteArray::set objectEncoding"); return;
      // this._objectEncoding = version;
    }
    get endian(): string {
      notImplemented("public flash.utils.ByteArray::get endian"); return;
      // return this._endian;
    }
    set endian(type: string) {
      type = asCoerceString(type);
      notImplemented("public flash.utils.ByteArray::set endian"); return;
      // this._endian = type;
    }
    clear(): void {
      notImplemented("public flash.utils.ByteArray::clear"); return;
    }
  }
}
