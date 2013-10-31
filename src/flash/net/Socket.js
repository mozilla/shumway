/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
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

var SocketDefinition = (function () {
  return {
    // (host:String = null, port:int = 0)
    __class__: "flash.net.Socket",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          internalGetSecurityErrorMessage: function internalGetSecurityErrorMessage(host, port) { // (host:String, port:int) -> String
            notImplemented("Socket.internalGetSecurityErrorMessage");
          },
          internalConnect: function internalConnect(host, port) { // (host:String, port:int) -> void
            notImplemented("Socket.internalConnect");
          },
          didFailureOccur: function didFailureOccur() { // (void) -> Boolean
            notImplemented("Socket.didFailureOccur");
          },
          readBytes: function readBytes(bytes, offset, length) { // (bytes:ByteArray, offset:uint = 0, length:uint = 0) -> void
            notImplemented("Socket.readBytes");
          },
          writeBytes: function writeBytes(bytes, offset, length) { // (bytes:ByteArray, offset:uint = 0, length:uint = 0) -> void
            notImplemented("Socket.writeBytes");
          },
          writeBoolean: function writeBoolean(value) { // (value:Boolean) -> void
            notImplemented("Socket.writeBoolean");
          },
          writeByte: function writeByte(value) { // (value:int) -> void
            notImplemented("Socket.writeByte");
          },
          writeShort: function writeShort(value) { // (value:int) -> void
            notImplemented("Socket.writeShort");
          },
          writeInt: function writeInt(value) { // (value:int) -> void
            notImplemented("Socket.writeInt");
          },
          writeUnsignedInt: function writeUnsignedInt(value) { // (value:uint) -> void
            notImplemented("Socket.writeUnsignedInt");
          },
          writeFloat: function writeFloat(value) { // (value:Number) -> void
            notImplemented("Socket.writeFloat");
          },
          writeDouble: function writeDouble(value) { // (value:Number) -> void
            notImplemented("Socket.writeDouble");
          },
          writeMultiByte: function writeMultiByte(value, charSet) { // (value:String, charSet:String) -> void
            notImplemented("Socket.writeMultiByte");
          },
          writeUTF: function writeUTF(value) { // (value:String) -> void
            notImplemented("Socket.writeUTF");
          },
          writeUTFBytes: function writeUTFBytes(value) { // (value:String) -> void
            notImplemented("Socket.writeUTFBytes");
          },
          readBoolean: function readBoolean() { // (void) -> Boolean
            notImplemented("Socket.readBoolean");
          },
          readByte: function readByte() { // (void) -> int
            notImplemented("Socket.readByte");
          },
          readUnsignedByte: function readUnsignedByte() { // (void) -> uint
            notImplemented("Socket.readUnsignedByte");
          },
          readShort: function readShort() { // (void) -> int
            notImplemented("Socket.readShort");
          },
          readUnsignedShort: function readUnsignedShort() { // (void) -> uint
            notImplemented("Socket.readUnsignedShort");
          },
          readInt: function readInt() { // (void) -> int
            notImplemented("Socket.readInt");
          },
          readUnsignedInt: function readUnsignedInt() { // (void) -> uint
            notImplemented("Socket.readUnsignedInt");
          },
          readFloat: function readFloat() { // (void) -> Number
            notImplemented("Socket.readFloat");
          },
          readDouble: function readDouble() { // (void) -> Number
            notImplemented("Socket.readDouble");
          },
          readMultiByte: function readMultiByte(length, charSet) { // (length:uint, charSet:String) -> String
            notImplemented("Socket.readMultiByte");
          },
          readUTF: function readUTF() { // (void) -> String
            notImplemented("Socket.readUTF");
          },
          readUTFBytes: function readUTFBytes(length) { // (length:uint) -> String
            notImplemented("Socket.readUTFBytes");
          },
          internalClose: function internalClose() { // (void) -> void
            notImplemented("Socket.internalClose");
          },
          flush: function flush() { // (void) -> void
            notImplemented("Socket.flush");
          },
          writeObject: function writeObject(object) { // (object) -> void
            notImplemented("Socket.writeObject");
          },
          readObject: function readObject() { // (void) -> any
            notImplemented("Socket.readObject");
          },
          bytesAvailable: {
            get: function bytesAvailable() { // (void) -> uint
              notImplemented("Socket.bytesAvailable");
              return this._bytesAvailable;
            }
          },
          connected: {
            get: function connected() { // (void) -> Boolean
              notImplemented("Socket.connected");
              return this._connected;
            }
          },
          objectEncoding: {
            get: function objectEncoding() { // (void) -> uint
              notImplemented("Socket.objectEncoding");
              return this._objectEncoding;
            },
            set: function objectEncoding(version) { // (version:uint) -> void
              notImplemented("Socket.objectEncoding");
              this._objectEncoding = version;
            }
          },
          endian: {
            get: function endian() { // (void) -> String
              notImplemented("Socket.endian");
              return this._endian;
            },
            set: function endian(type) { // (type:String) -> void
              notImplemented("Socket.endian");
              this._endian = type;
            }
          },
          bytesPending: {
            get: function bytesPending() { // (void) -> uint
              notImplemented("Socket.bytesPending");
              return this._bytesPending;
            }
          }
        }
      },
      script: {
        instance: Glue.ALL
      }
    }
  };
}).call(this);
