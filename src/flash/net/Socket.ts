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
// Class: Socket
module Shumway.AVMX.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;

  export class Socket extends flash.events.EventDispatcher implements flash.utils.IDataInput, flash.utils.IDataOutput {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["timeout", "timeout", "connect", "close"];
    
    constructor (host: string = null, port: number /*int*/ = 0) {
      super(undefined);
      host = axCoerceString(host); port = port | 0;
    }
    
    // JS -> AS Bindings
    
    timeout: number /*uint*/;
    connect: (host: string, port: number /*int*/) => void;
    close: () => void;
    
    // AS -> JS Bindings
    
    // _timeout: number /*uint*/;
    // _bytesAvailable: number /*uint*/;
    // _connected: boolean;
    // _objectEncoding: number /*uint*/;
    // _endian: string;
    // _bytesPending: number /*uint*/;
    get bytesAvailable(): number /*uint*/ {
      release || notImplemented("public flash.net.Socket::get bytesAvailable"); return;
      // return this._bytesAvailable;
    }
    get connected(): boolean {
      release || notImplemented("public flash.net.Socket::get connected"); return;
      // return this._connected;
    }
    get objectEncoding(): number /*uint*/ {
      release || notImplemented("public flash.net.Socket::get objectEncoding"); return;
      // return this._objectEncoding;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      release || notImplemented("public flash.net.Socket::set objectEncoding"); return;
      // this._objectEncoding = version;
    }
    get endian(): string {
      release || notImplemented("public flash.net.Socket::get endian"); return;
      // return this._endian;
    }
    set endian(type: string) {
      type = axCoerceString(type);
      release || notImplemented("public flash.net.Socket::set endian"); return;
      // this._endian = type;
    }
    get bytesPending(): number /*uint*/ {
      release || notImplemented("public flash.net.Socket::get bytesPending"); return;
      // return this._bytesPending;
    }
    readBytes(bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
      bytes = bytes; offset = offset >>> 0; length = length >>> 0;
      release || notImplemented("public flash.net.Socket::readBytes"); return;
    }
    writeBytes(bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
      bytes = bytes; offset = offset >>> 0; length = length >>> 0;
      release || notImplemented("public flash.net.Socket::writeBytes"); return;
    }
    writeBoolean(value: boolean): void {
      value = !!value;
      release || notImplemented("public flash.net.Socket::writeBoolean"); return;
    }
    writeByte(value: number /*int*/): void {
      value = value | 0;
      release || notImplemented("public flash.net.Socket::writeByte"); return;
    }
    writeShort(value: number /*int*/): void {
      value = value | 0;
      release || notImplemented("public flash.net.Socket::writeShort"); return;
    }
    writeInt(value: number /*int*/): void {
      value = value | 0;
      release || notImplemented("public flash.net.Socket::writeInt"); return;
    }
    writeUnsignedInt(value: number /*uint*/): void {
      value = value >>> 0;
      release || notImplemented("public flash.net.Socket::writeUnsignedInt"); return;
    }
    writeFloat(value: number): void {
      value = +value;
      release || notImplemented("public flash.net.Socket::writeFloat"); return;
    }
    writeDouble(value: number): void {
      value = +value;
      release || notImplemented("public flash.net.Socket::writeDouble"); return;
    }
    writeMultiByte(value: string, charSet: string): void {
      value = axCoerceString(value); charSet = axCoerceString(charSet);
      release || notImplemented("public flash.net.Socket::writeMultiByte"); return;
    }
    writeUTF(value: string): void {
      value = axCoerceString(value);
      release || notImplemented("public flash.net.Socket::writeUTF"); return;
    }
    writeUTFBytes(value: string): void {
      value = axCoerceString(value);
      release || notImplemented("public flash.net.Socket::writeUTFBytes"); return;
    }
    readBoolean(): boolean {
      release || notImplemented("public flash.net.Socket::readBoolean"); return;
    }
    readByte(): number /*int*/ {
      release || notImplemented("public flash.net.Socket::readByte"); return;
    }
    readUnsignedByte(): number /*uint*/ {
      release || notImplemented("public flash.net.Socket::readUnsignedByte"); return;
    }
    readShort(): number /*int*/ {
      release || notImplemented("public flash.net.Socket::readShort"); return;
    }
    readUnsignedShort(): number /*uint*/ {
      release || notImplemented("public flash.net.Socket::readUnsignedShort"); return;
    }
    readInt(): number /*int*/ {
      release || notImplemented("public flash.net.Socket::readInt"); return;
    }
    readUnsignedInt(): number /*uint*/ {
      release || notImplemented("public flash.net.Socket::readUnsignedInt"); return;
    }
    readFloat(): number {
      release || notImplemented("public flash.net.Socket::readFloat"); return;
    }
    readDouble(): number {
      release || notImplemented("public flash.net.Socket::readDouble"); return;
    }
    readMultiByte(length: number /*uint*/, charSet: string): string {
      length = length >>> 0; charSet = axCoerceString(charSet);
      release || notImplemented("public flash.net.Socket::readMultiByte"); return;
    }
    readUTF(): string {
      release || notImplemented("public flash.net.Socket::readUTF"); return;
    }
    readUTFBytes(length: number /*uint*/): string {
      length = length >>> 0;
      release || notImplemented("public flash.net.Socket::readUTFBytes"); return;
    }
    flush(): void {
      release || notImplemented("public flash.net.Socket::flush"); return;
    }
    writeObject(object: any): void {
      
      release || notImplemented("public flash.net.Socket::writeObject"); return;
    }
    readObject(): any {
      release || notImplemented("public flash.net.Socket::readObject"); return;
    }
    internalGetSecurityErrorMessage(host, port): string {
      host = axCoerceString(host); port |= 0;
      release || somewhatImplemented("flash.net.Socket::internalGetSecurityErrorMessage");
      return 'SecurityErrorEvent';
    }
    internalConnect(host, port) {
      host = axCoerceString(host); port |= 0;
      release || somewhatImplemented("flash.net.Socket::internalConnect");
      this.sec.throwError('SecurityError', Errors.SocketConnectError, host, port);
    }
    didFailureOccur(): boolean {
      release || somewhatImplemented("flash.net.Socket::didFailureOccur");
      return true;
    }
  }
}
