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
// Class: Socket
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Socket extends flash.events.EventDispatcher implements flash.utils.IDataInput, flash.utils.IDataOutput {
    static initializer: any = null;
    constructor (host: string = null, port: number /*int*/ = 0) {
      host = "" + host; port = port | 0;
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.Socket");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    _init: () => void;
    _timeout: number /*uint*/;
    _timeoutTimer: flash.utils.Timer;
    _timeoutEvent: flash.events.SecurityErrorEvent;
    connect: (host: string, port: number /*int*/) => void;
    timeout: number /*uint*/;
    onTimeout: (event: flash.events.TimerEvent) => void;
    close: () => void;
    // Instance AS -> JS Bindings
    internalGetSecurityErrorMessage(host: string, port: number /*int*/): string {
      host = "" + host; port = port | 0;
      notImplemented("public flash.net.Socket::internalGetSecurityErrorMessage"); return;
    }
    internalConnect(host: string, port: number /*int*/): void {
      host = "" + host; port = port | 0;
      notImplemented("public flash.net.Socket::internalConnect"); return;
    }
    didFailureOccur(): boolean {
      notImplemented("public flash.net.Socket::didFailureOccur"); return;
    }
    readBytes(bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
      bytes = bytes; offset = offset >>> 0; length = length >>> 0;
      notImplemented("public flash.net.Socket::readBytes"); return;
    }
    writeBytes(bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
      bytes = bytes; offset = offset >>> 0; length = length >>> 0;
      notImplemented("public flash.net.Socket::writeBytes"); return;
    }
    writeBoolean(value: boolean): void {
      value = !!value;
      notImplemented("public flash.net.Socket::writeBoolean"); return;
    }
    writeByte(value: number /*int*/): void {
      value = value | 0;
      notImplemented("public flash.net.Socket::writeByte"); return;
    }
    writeShort(value: number /*int*/): void {
      value = value | 0;
      notImplemented("public flash.net.Socket::writeShort"); return;
    }
    writeInt(value: number /*int*/): void {
      value = value | 0;
      notImplemented("public flash.net.Socket::writeInt"); return;
    }
    writeUnsignedInt(value: number /*uint*/): void {
      value = value >>> 0;
      notImplemented("public flash.net.Socket::writeUnsignedInt"); return;
    }
    writeFloat(value: number): void {
      value = +value;
      notImplemented("public flash.net.Socket::writeFloat"); return;
    }
    writeDouble(value: number): void {
      value = +value;
      notImplemented("public flash.net.Socket::writeDouble"); return;
    }
    writeMultiByte(value: string, charSet: string): void {
      value = "" + value; charSet = "" + charSet;
      notImplemented("public flash.net.Socket::writeMultiByte"); return;
    }
    writeUTF(value: string): void {
      value = "" + value;
      notImplemented("public flash.net.Socket::writeUTF"); return;
    }
    writeUTFBytes(value: string): void {
      value = "" + value;
      notImplemented("public flash.net.Socket::writeUTFBytes"); return;
    }
    readBoolean(): boolean {
      notImplemented("public flash.net.Socket::readBoolean"); return;
    }
    readByte(): number /*int*/ {
      notImplemented("public flash.net.Socket::readByte"); return;
    }
    readUnsignedByte(): number /*uint*/ {
      notImplemented("public flash.net.Socket::readUnsignedByte"); return;
    }
    readShort(): number /*int*/ {
      notImplemented("public flash.net.Socket::readShort"); return;
    }
    readUnsignedShort(): number /*uint*/ {
      notImplemented("public flash.net.Socket::readUnsignedShort"); return;
    }
    readInt(): number /*int*/ {
      notImplemented("public flash.net.Socket::readInt"); return;
    }
    readUnsignedInt(): number /*uint*/ {
      notImplemented("public flash.net.Socket::readUnsignedInt"); return;
    }
    readFloat(): number {
      notImplemented("public flash.net.Socket::readFloat"); return;
    }
    readDouble(): number {
      notImplemented("public flash.net.Socket::readDouble"); return;
    }
    readMultiByte(length: number /*uint*/, charSet: string): string {
      length = length >>> 0; charSet = "" + charSet;
      notImplemented("public flash.net.Socket::readMultiByte"); return;
    }
    readUTF(): string {
      notImplemented("public flash.net.Socket::readUTF"); return;
    }
    readUTFBytes(length: number /*uint*/): string {
      length = length >>> 0;
      notImplemented("public flash.net.Socket::readUTFBytes"); return;
    }
    get bytesAvailable(): number /*uint*/ {
      notImplemented("public flash.net.Socket::get bytesAvailable"); return;
    }
    get connected(): boolean {
      notImplemented("public flash.net.Socket::get connected"); return;
    }
    internalClose(): void {
      notImplemented("public flash.net.Socket::internalClose"); return;
    }
    flush(): void {
      notImplemented("public flash.net.Socket::flush"); return;
    }
    writeObject(object: any): void {
      
      notImplemented("public flash.net.Socket::writeObject"); return;
    }
    readObject(): any {
      notImplemented("public flash.net.Socket::readObject"); return;
    }
    get objectEncoding(): number /*uint*/ {
      notImplemented("public flash.net.Socket::get objectEncoding"); return;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("public flash.net.Socket::set objectEncoding"); return;
    }
    get endian(): string {
      notImplemented("public flash.net.Socket::get endian"); return;
    }
    set endian(type: string) {
      type = "" + type;
      notImplemented("public flash.net.Socket::set endian"); return;
    }
    get bytesPending(): number /*uint*/ {
      notImplemented("public flash.net.Socket::get bytesPending"); return;
    }
  }
}
