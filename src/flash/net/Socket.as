/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package flash.net {
import flash.events.EventDispatcher;
import flash.utils.ByteArray;
import flash.utils.IDataInput;
import flash.utils.IDataOutput;

[native(cls='SocketClass')]
public class Socket extends EventDispatcher implements IDataInput, IDataOutput {
  public function Socket(host: String = null, port: int = 0) {}
  public function get timeout(): uint {
    notImplemented("timeout");
    return 0;
  }
  public function set timeout(value: uint): void { notImplemented("timeout"); }
  public native function get bytesAvailable(): uint;
  public native function get connected(): Boolean;
  public native function get objectEncoding(): uint;
  public native function set objectEncoding(version: uint): void;
  public native function get endian(): String;
  public native function set endian(type: String): void;
  public native function get bytesPending(): uint;
  public function connect(host: String, port: int): void { notImplemented("connect"); }
  public native function readBytes(bytes: ByteArray, offset: uint = 0, length: uint = 0): void;
  public native function writeBytes(bytes: ByteArray, offset: uint = 0, length: uint = 0): void;
  public native function writeBoolean(value: Boolean): void;
  public native function writeByte(value: int): void;
  public native function writeShort(value: int): void;
  public native function writeInt(value: int): void;
  public native function writeUnsignedInt(value: uint): void;
  public native function writeFloat(value: Number): void;
  public native function writeDouble(value: Number): void;
  public native function writeMultiByte(value: String, charSet: String): void;
  public native function writeUTF(value: String): void;
  public native function writeUTFBytes(value: String): void;
  public native function readBoolean(): Boolean;
  public native function readByte(): int;
  public native function readUnsignedByte(): uint;
  public native function readShort(): int;
  public native function readUnsignedShort(): uint;
  public native function readInt(): int;
  public native function readUnsignedInt(): uint;
  public native function readFloat(): Number;
  public native function readDouble(): Number;
  public native function readMultiByte(length: uint, charSet: String): String;
  public native function readUTF(): String;
  public native function readUTFBytes(length: uint): String;
  public function close(): void { notImplemented("close"); }
  public native function flush(): void;
  public native function writeObject(object): void;
  public native function readObject();
}
}
