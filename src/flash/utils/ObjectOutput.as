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

package flash.utils {

[native(cls='ObjectOutputClass')]
internal class ObjectOutput implements IDataOutput {
  public native function get objectEncoding(): uint;
  public native function set objectEncoding(version: uint): void;
  public native function get endian(): String;
  public native function set endian(type: String): void;
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
  public native function writeObject(object: *): void;
}
}
