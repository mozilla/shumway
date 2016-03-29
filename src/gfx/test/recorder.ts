/**
 * Copyright 2015 Mozilla Foundation
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

module Shumway.GFX.Test {
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import PlainObjectDataBuffer = Shumway.ArrayUtilities.PlainObjectDataBuffer;

  enum MovieRecordObjectType {
    Undefined = 0,
    Null = 1,
    True = 2,
    False = 3,
    Number = 4,
    String = 5,
    Array = 6,
    Object = 7,
    ArrayBuffer = 8,
    Uint8Array = 9,
    PlainObjectDataBufferLE = 10,
    PlainObjectDataBufferBE = 11,
    Int32Array = 12,
  }

  function writeUint8Array(buffer, data) {
    buffer.writeInt(data.length);
    buffer.writeRawBytes(data);
  }

  // Borrowed from other frame typed arrays does not match current global
  // objects, so instanceof does not work.
  function isInstanceOfTypedArray(obj, name: string): boolean {
    return ('byteLength' in obj) &&
           ('buffer' in obj) &&
           (obj.constructor && obj.constructor.name) === name;
  }

  function isInstanceOfArrayBuffer(obj): boolean {
    return ('byteLength' in obj) &&
           (obj.constructor && obj.constructor.name) === 'ArrayBuffer';
  }

  function serializeObj(obj) {
    function serialize(item) {
      switch (typeof item) {
        case 'undefined':
          buffer.writeByte(MovieRecordObjectType.Undefined);
          break;
        case 'boolean':
          buffer.writeByte(item ? MovieRecordObjectType.True : MovieRecordObjectType.False);
          break;
        case 'number':
          buffer.writeByte(MovieRecordObjectType.Number);
          buffer.writeDouble(item);
          break;
        case 'string':
          buffer.writeByte(MovieRecordObjectType.String);
          buffer.writeUTF(item);
          break;
        default: // 'object'
          if (item === null) {
            buffer.writeByte(MovieRecordObjectType.Null);
            break;
          }

          if (Array.isArray(item)) {
            buffer.writeByte(MovieRecordObjectType.Array);
            buffer.writeInt(item.length);
            for (var i = 0; i < item.length; i++) {
              serialize(item[i]);
            }
          } else if (isInstanceOfTypedArray(item, 'Uint8Array')) {
            buffer.writeByte(MovieRecordObjectType.Uint8Array);
            writeUint8Array(buffer, item);
          } else if (('length' in item) && ('buffer' in item) && ('littleEndian' in item)) {
            buffer.writeByte(item.littleEndian ?
              MovieRecordObjectType.PlainObjectDataBufferLE :
              MovieRecordObjectType.PlainObjectDataBufferBE);
            writeUint8Array(buffer, new Uint8Array(item.buffer, 0, item.length));
          } else if (isInstanceOfArrayBuffer(item)) {
            buffer.writeByte(MovieRecordObjectType.ArrayBuffer);
            writeUint8Array(buffer, new Uint8Array(item));
          } else if (isInstanceOfTypedArray(item, 'Int32Array')) {
            buffer.writeByte(MovieRecordObjectType.Int32Array);
            writeUint8Array(buffer, new Uint8Array(item.buffer, item.byteOffset, item.byteLength));
          } else {
            if (!isNullOrUndefined(item.buffer) &&
              isInstanceOfArrayBuffer(item.buffer) &&
              (typeof item.byteOffset === 'number')) {
              throw new Error('Some unsupported TypedArray is used')
            }
            buffer.writeByte(MovieRecordObjectType.Object);
            for (var key in item) {
              buffer.writeUTF(key);
              serialize(item[key]);
            }
            buffer.writeUTF('');
          }
          break;
      }
    }

    var buffer = new DataBuffer();
    serialize(obj);
    return buffer.getBytes();
  }

  export const enum MovieRecordType {
    None = 0,
    PlayerCommand = 1,
    PlayerCommandAsync = 2,
    Frame = 3,
    Font = 4,
    Image = 5,
    FSCommand = 6
  }

  export class MovieRecorder {
    private _recording: DataBuffer;
    private _recordingStarted: number;
    private _stopped: boolean;
    private _maxRecordingSize: number;

    public constructor(maxRecordingSize: number) {
      this._maxRecordingSize = maxRecordingSize;
      this._recording = new DataBuffer();
      this._recordingStarted = 0;
      this._recording.writeRawBytes(new Uint8Array([0x4D, 0x53, 0x57, 0x46]));
      this._stopped = false;
    }

    public stop() {
      this._stopped = true;
    }

    public getRecording(): Blob {
      return new Blob([this._recording.getBytes()], {type: 'application/octet-stream'});
    }

    public dump() {
      var parser = new MovieRecordParser(this._recording.getBytes());
      parser.dump();
    }

    private _createRecord(type: MovieRecordType, buffer: DataBuffer) {
      if (this._stopped) {
        return;
      }

      if (this._recording.length + 8 + (buffer ? buffer.length : 0) >= this._maxRecordingSize) {
        console.error('Recording limit reached');
        this._stopped = true;
        return
      }

      if (this._recordingStarted === 0) {
        this._recordingStarted = Date.now();
        this._recording.writeInt(0);
      } else {
        this._recording.writeInt(Date.now() - this._recordingStarted);
      }

      this._recording.writeInt(type);
      if (buffer !== null) {
        this._recording.writeInt(buffer.length);
        this._recording.writeRawBytes(buffer.getBytes());
      } else {
        this._recording.writeInt(0);
      }
    }

    public recordPlayerCommand(async: boolean, updates: Uint8Array, assets: any[]) {
      var buffer = new DataBuffer();
      writeUint8Array(buffer, updates);

      buffer.writeInt(assets.length);
      assets.forEach(function (a) {
        var data = serializeObj(a);
        writeUint8Array(buffer, data);
      });
      this._createRecord(async ? MovieRecordType.PlayerCommandAsync : MovieRecordType.PlayerCommand, buffer);
    }

    public recordFrame() {
      this._createRecord(MovieRecordType.Frame, null);
    }

    public recordFont(syncId: number, data: Uint8Array) {
      var buffer = new DataBuffer();
      buffer.writeInt(syncId);
      writeUint8Array(buffer, serializeObj(data));
      this._createRecord(MovieRecordType.Font, buffer);
    }

    public recordImage(syncId: number, symbolId: number, imageType: ImageType,
                       data: Uint8Array, alphaData: Uint8Array) {
      var buffer = new DataBuffer();
      buffer.writeInt(syncId);
      buffer.writeInt(symbolId);
      buffer.writeInt(imageType);
      writeUint8Array(buffer, serializeObj(data));
      writeUint8Array(buffer, serializeObj(alphaData));
      this._createRecord(MovieRecordType.Image, buffer);
    }

    public recordFSCommand(command: string, args: string) {
      var buffer = new DataBuffer();
      buffer.writeUTF(command);
      buffer.writeUTF(args || '');
      this._createRecord(MovieRecordType.FSCommand, buffer);
    }
  }

  function readUint8Array(buffer: DataBuffer): Uint8Array {
    var data = new DataBuffer();
    var length = buffer.readInt();
    buffer.readBytes(data, 0, length);
    return data.getBytes();
  }

  function deserializeObj(source: DataBuffer) {
    var buffer = new DataBuffer();
    var length = source.readInt();
    source.readBytes(buffer, 0, length);
    return deserializeObjImpl(buffer);
  }

  function deserializeObjImpl(buffer: DataBuffer) {
    var type: MovieRecordObjectType = buffer.readByte();
    switch(type) {
      case MovieRecordObjectType.Undefined:
        return undefined;
      case MovieRecordObjectType.Null:
        return null;
      case MovieRecordObjectType.True:
        return true;
      case MovieRecordObjectType.False:
        return false;
      case MovieRecordObjectType.Number:
        return buffer.readDouble();
      case MovieRecordObjectType.String:
        return buffer.readUTF();
      case MovieRecordObjectType.Array:
        var arr = [];
        var length = buffer.readInt();
        for (var i = 0; i < length; i++) {
          arr[i] = deserializeObjImpl(buffer);
        }
        return arr;
      case MovieRecordObjectType.Object:
        var obj = {};
        var key;
        while ((key = buffer.readUTF())) {
          obj[key] = deserializeObjImpl(buffer);
        }
        return obj;
      case MovieRecordObjectType.ArrayBuffer:
        return readUint8Array(buffer).buffer;
      case MovieRecordObjectType.Uint8Array:
        return readUint8Array(buffer);
      case MovieRecordObjectType.PlainObjectDataBufferBE:
      case MovieRecordObjectType.PlainObjectDataBufferLE:
        var data = readUint8Array(buffer);
        return new PlainObjectDataBuffer(data.buffer, data.length,
                                         type === MovieRecordObjectType.PlainObjectDataBufferLE);
      case MovieRecordObjectType.Int32Array:
        return new Int32Array(readUint8Array(buffer).buffer);
      default:
        release || Debug.assert(false);
        break
    }
  }

  export class MovieRecordParser {
    private _buffer: DataBuffer;

    public currentTimestamp: number;
    public currentType: MovieRecordType;
    public currentData: DataBuffer;

    constructor(data: Uint8Array) {
      this._buffer = new DataBuffer();
      this._buffer.writeRawBytes(data);
      this._buffer.position = 4;
    }

    public readNextRecord(): MovieRecordType  {
      if (this._buffer.position >= this._buffer.length) {
        return MovieRecordType.None;
      }
      var timestamp: number = this._buffer.readInt();
      var type: MovieRecordType = this._buffer.readInt();
      var length: number = this._buffer.readInt();
      var data: DataBuffer = null;

      if (length > 0) {
        data = new DataBuffer();
        this._buffer.readBytes(data, 0, length);
      }

      this.currentTimestamp = timestamp;
      this.currentType = type;
      this.currentData = data;

      return type;
    }

    public parsePlayerCommand(): any {
      var updates = readUint8Array(this.currentData);
      var assetsLength = this.currentData.readInt();
      var assets = [];
      for (var i = 0; i < assetsLength; i++) {
        assets.push(deserializeObj(this.currentData));
      }
      return { updates: updates, assets: assets };
    }

    public parseFSCommand(): any {
      var command = this.currentData.readUTF();
      var args = this.currentData.readUTF();
      return { command: command, args: args };
    }

    public parseFont(): any {
      var syncId = this.currentData.readInt();
      var data = deserializeObj(this.currentData);
      return {syncId: syncId, data: data};
    }

    public parseImage(): any {
      var syncId = this.currentData.readInt();
      var symbolId = this.currentData.readInt();
      var imageType = this.currentData.readInt();
      var data = deserializeObj(this.currentData);
      var alphaData = deserializeObj(this.currentData);
      return {syncId: syncId, symbolId: symbolId, imageType: imageType, data: data, alphaData: alphaData};
    }

    public dump() {
      var type: MovieRecordType;
      while ((type = this.readNextRecord())) {
        console.log('record ' + type + ' @' + this.currentTimestamp);
        switch (type) {
          case MovieRecordType.PlayerCommand:
          case MovieRecordType.PlayerCommandAsync:
            console.log(this.parsePlayerCommand());
            break;
          case MovieRecordType.FSCommand:
            console.log(this.parseFSCommand());
            break;
          case MovieRecordType.Font:
            console.log(this.parseFont());
            break;
          case MovieRecordType.Image:
            console.log(this.parseImage());
            break;
        }
      }
    }
  }
}
