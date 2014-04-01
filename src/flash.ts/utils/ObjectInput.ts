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
// Class: ObjectInput
module Shumway.AVM2.AS.flash.utils {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ObjectInput extends ASNative implements flash.utils.IDataInput {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: packageInternal flash.utils.ObjectInput");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
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
      length = length >>> 0; charSet = "" + charSet;
      notImplemented("packageInternal flash.utils.ObjectInput::readMultiByte"); return;
    }
    readUTF(): string {
      notImplemented("packageInternal flash.utils.ObjectInput::readUTF"); return;
    }
    readUTFBytes(length: number /*uint*/): string {
      length = length >>> 0;
      notImplemented("packageInternal flash.utils.ObjectInput::readUTFBytes"); return;
    }
    get bytesAvailable(): number /*uint*/ {
      notImplemented("packageInternal flash.utils.ObjectInput::get bytesAvailable"); return;
    }
    readObject(): any {
      notImplemented("packageInternal flash.utils.ObjectInput::readObject"); return;
    }
    get objectEncoding(): number /*uint*/ {
      notImplemented("packageInternal flash.utils.ObjectInput::get objectEncoding"); return;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("packageInternal flash.utils.ObjectInput::set objectEncoding"); return;
    }
    get endian(): string {
      notImplemented("packageInternal flash.utils.ObjectInput::get endian"); return;
    }
    set endian(type: string) {
      type = "" + type;
      notImplemented("packageInternal flash.utils.ObjectInput::set endian"); return;
    }
  }
}
