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
// Class: ByteArray
module Shumway.AVM2.AS.flash.utils {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ByteArray extends ASNative implements IDataInput2, IDataOutput2 {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.utils.ByteArray");
    }
    // Static   JS -> AS Bindings
    static _defaultObjectEncoding: number /*uint*/;
    // Static   AS -> JS Bindings
    get defaultObjectEncoding(): number /*uint*/ {
      notImplemented("public flash.utils.ByteArray::get defaultObjectEncoding"); return;
    }
    set defaultObjectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("public flash.utils.ByteArray::set defaultObjectEncoding"); return;
    }
    // Instance JS -> AS Bindings
    deflate: () => void;
    compress: (algorithm: string = "zlib") => void;
    inflate: () => void;
    uncompress: (algorithm: string = "zlib") => void;
    // Instance AS -> JS Bindings
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
      value = "" + value; charSet = "" + charSet;
      notImplemented("public flash.utils.ByteArray::writeMultiByte"); return;
    }
    writeUTF(value: string): void {
      value = "" + value;
      notImplemented("public flash.utils.ByteArray::writeUTF"); return;
    }
    writeUTFBytes(value: string): void {
      value = "" + value;
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
      length = length >>> 0; charSet = "" + charSet;
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
    }
    set length(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.utils.ByteArray::set length"); return;
    }
    writeObject(object: any): void {
      
      notImplemented("public flash.utils.ByteArray::writeObject"); return;
    }
    readObject(): any {
      notImplemented("public flash.utils.ByteArray::readObject"); return;
    }
    _compress(algorithm: string): void {
      algorithm = "" + algorithm;
      notImplemented("public flash.utils.ByteArray::_compress"); return;
    }
    _uncompress(algorithm: string): void {
      algorithm = "" + algorithm;
      notImplemented("public flash.utils.ByteArray::_uncompress"); return;
    }
    _toString(): string {
      notImplemented("public flash.utils.ByteArray::_toString"); return;
    }
    get bytesAvailable(): number /*uint*/ {
      notImplemented("public flash.utils.ByteArray::get bytesAvailable"); return;
    }
    get position(): number /*uint*/ {
      notImplemented("public flash.utils.ByteArray::get position"); return;
    }
    set position(offset: number /*uint*/) {
      offset = offset >>> 0;
      notImplemented("public flash.utils.ByteArray::set position"); return;
    }
    get objectEncoding(): number /*uint*/ {
      notImplemented("public flash.utils.ByteArray::get objectEncoding"); return;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("public flash.utils.ByteArray::set objectEncoding"); return;
    }
    get endian(): string {
      notImplemented("public flash.utils.ByteArray::get endian"); return;
    }
    set endian(type: string) {
      type = "" + type;
      notImplemented("public flash.utils.ByteArray::set endian"); return;
    }
    clear(): void {
      notImplemented("public flash.utils.ByteArray::clear"); return;
    }
    atomicCompareAndSwapIntAt(byteIndex: number /*int*/, expectedValue: number /*int*/, newValue: number /*int*/): number /*int*/ {
      byteIndex = byteIndex | 0; expectedValue = expectedValue | 0; newValue = newValue | 0;
      notImplemented("public flash.utils.ByteArray::atomicCompareAndSwapIntAt"); return;
    }
    atomicCompareAndSwapLength(expectedLength: number /*int*/, newLength: number /*int*/): number /*int*/ {
      expectedLength = expectedLength | 0; newLength = newLength | 0;
      notImplemented("public flash.utils.ByteArray::atomicCompareAndSwapLength"); return;
    }
    get shareable(): boolean {
      notImplemented("public flash.utils.ByteArray::get shareable"); return;
    }
    set shareable(newValue: boolean) {
      newValue = !!newValue;
      notImplemented("public flash.utils.ByteArray::set shareable"); return;
    }
  }
}
