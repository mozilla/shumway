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
// Class: URLStream
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class URLStream extends flash.events.EventDispatcher implements flash.utils.IDataInput {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.URLStream");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    load(request: flash.net.URLRequest): void {
      request = request;
      notImplemented("public flash.net.URLStream::load"); return;
    }
    readBytes(bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
      bytes = bytes; offset = offset >>> 0; length = length >>> 0;
      notImplemented("public flash.net.URLStream::readBytes"); return;
    }
    readBoolean(): boolean {
      notImplemented("public flash.net.URLStream::readBoolean"); return;
    }
    readByte(): number /*int*/ {
      notImplemented("public flash.net.URLStream::readByte"); return;
    }
    readUnsignedByte(): number /*uint*/ {
      notImplemented("public flash.net.URLStream::readUnsignedByte"); return;
    }
    readShort(): number /*int*/ {
      notImplemented("public flash.net.URLStream::readShort"); return;
    }
    readUnsignedShort(): number /*uint*/ {
      notImplemented("public flash.net.URLStream::readUnsignedShort"); return;
    }
    readUnsignedInt(): number /*uint*/ {
      notImplemented("public flash.net.URLStream::readUnsignedInt"); return;
    }
    readInt(): number /*int*/ {
      notImplemented("public flash.net.URLStream::readInt"); return;
    }
    readFloat(): number {
      notImplemented("public flash.net.URLStream::readFloat"); return;
    }
    readDouble(): number {
      notImplemented("public flash.net.URLStream::readDouble"); return;
    }
    readMultiByte(length: number /*uint*/, charSet: string): string {
      length = length >>> 0; charSet = "" + charSet;
      notImplemented("public flash.net.URLStream::readMultiByte"); return;
    }
    readUTF(): string {
      notImplemented("public flash.net.URLStream::readUTF"); return;
    }
    readUTFBytes(length: number /*uint*/): string {
      length = length >>> 0;
      notImplemented("public flash.net.URLStream::readUTFBytes"); return;
    }
    get connected(): boolean {
      notImplemented("public flash.net.URLStream::get connected"); return;
    }
    get bytesAvailable(): number /*uint*/ {
      notImplemented("public flash.net.URLStream::get bytesAvailable"); return;
    }
    close(): void {
      notImplemented("public flash.net.URLStream::close"); return;
    }
    readObject(): any {
      notImplemented("public flash.net.URLStream::readObject"); return;
    }
    get objectEncoding(): number /*uint*/ {
      notImplemented("public flash.net.URLStream::get objectEncoding"); return;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("public flash.net.URLStream::set objectEncoding"); return;
    }
    get endian(): string {
      notImplemented("public flash.net.URLStream::get endian"); return;
    }
    set endian(type: string) {
      type = "" + type;
      notImplemented("public flash.net.URLStream::set endian"); return;
    }
    get diskCacheEnabled(): boolean {
      notImplemented("public flash.net.URLStream::get diskCacheEnabled"); return;
    }
    get position(): number {
      notImplemented("public flash.net.URLStream::get position"); return;
    }
    set position(offset: number) {
      offset = +offset;
      notImplemented("public flash.net.URLStream::set position"); return;
    }
    get length(): number {
      notImplemented("public flash.net.URLStream::get length"); return;
    }
    stop(): void {
      notImplemented("public flash.net.URLStream::stop"); return;
    }
  }
}
