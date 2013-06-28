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
/*global FileLoadingService, Stream, utf8encode */

var URLStreamDefinition = (function () {
  var def = {
    initialize: function () {
      this._stream = null;
      this._connected = false;
      this._littleEndian = false;
    },

    close: function close() {
      this._session.close();
    },
    load: function load(request) {
      var session = FileLoadingService.createSession();
      var self = this;
      var initStream = true;
      session.onprogress = function (data, progressState) {
        if (initStream) {
          initStream = false;
          var length = Math.max(progressState.bytesTotal, data.length);
          var buffer = new ArrayBuffer(length);
          self._stream = new Stream(buffer, 0, 0, length);
        } else if (self._stream.end + data.length > self._stream.bytes.length) {
          var length = self._stream.end + data.length;
          var buffer = new ArrayBuffer(length);
          var newStream = new Stream(buffer, 0, 0, length);
          newStream.push(self._stream.bytes.subarray(0, self._stream.end));
          self._stream = newStream;
        }
        self._stream.push(data);
        var ProgressEventClass = avm2.systemDomain.getClass("flash.events.ProgressEvent");
        self._dispatchEvent(ProgressEventClass.createInstance(["progress",
           false, false, progressState.bytesLoaded, progressState.bytesTotal]));
      };
      session.onerror = function (error) {
        self._connected = false;
        if (!self._stream) {
          // We need to have something to return in data
          self._stream = new Stream(new ArrayBuffer(0), 0, 0, 0);
        }
        self._dispatchEvent(new flash.events.IOErrorEvent(
          flash.events.IOErrorEvent.class.IO_ERROR, false, false, error));
      };
      session.onopen = function () {
        self._connected = true;
        self._dispatchEvent(new flash.events.Event("open", false, false));
      };
      session.onhttpstatus = function (location, httpStatus, httpHeaders) {
        var HTTPStatusEventClass = avm2.systemDomain.getClass("flash.events.HTTPStatusEvent");
        var URLRequestHeaderClass = avm2.systemDomain.getClass("flash.net.URLRequestHeader");
        var httpStatusEvent = HTTPStatusEventClass.createInstance([
          'httpStatus', false, false, httpStatus]);
        var headers = [];
        httpHeaders.split(/\r\n/g).forEach(function (h) {
          var m = /^([^:]+): (.*)$/.exec(h);
          if (m) {
            headers.push(URLRequestHeaderClass.createInstance([m[1], m[2]]));
            if (m[1] === 'Location') { // Headers have redirect location
              location = m[2];
            }
          }
        });

        httpStatusEvent.public$responseHeaders = headers;
        httpStatusEvent.public$responseURL = location;
        self._dispatchEvent(httpStatusEvent);
      };
      session.onclose = function () {
        self._connected = false;
        if (!self._stream) {
          // We need to have something to return in data
          self._stream = new Stream(new ArrayBuffer(0), 0, 0, 0);
        }

        self._dispatchEvent(new flash.events.Event("complete", false, false));
      };
      session.open(request._toFileRequest());
      this._session = session;
    },
    readBoolean: function readBoolean() {
      throw 'Not implemented: URLStream.readBoolean';
    },
    readByte: function readByte() {
      var stream = this._stream;
      stream.ensure(1);
      return stream.bytes[stream.pos++];
    },
    readBytes: function readBytes(bytes, offset, length) {
      if (length < 0)
        throw 'Invalid length argument';
      var stream = this._stream;
      if (!length)
        length = stream.remaining();
      else
        stream.ensure(length);
      bytes.writeRawBytes(stream.bytes.subarray(stream.pos,
                          stream.pos + length), offset, length);
      stream.pos += length;
    },
    readDouble: function readDouble() {
      throw 'Not implemented: URLStream.readDouble';
    },
    readFloat: function readFloat() {
      throw 'Not implemented: URLStream.readFloat';
    },
    readInt: function readInt() {
      throw 'Not implemented: URLStream.readInt';
    },
    readMultiByte: function readMultiByte(length, charSet) {
      throw 'Not implemented: URLStream.readMultiByte';
    },
    readObject: function readObject() {
      throw 'Not implemented: URLStream.readObject';
    },
    readShort: function readShort() {
      throw 'Not implemented: URLStream.readShort';
    },
    readUTF: function readUTF() {
      return this.readUTFBytes(this.readUnsignedShort());
    },
    readUTFBytes: function readUTFBytes(length) {
      if (length < 0)
        throw 'Invalid length argument';

      var stream = this._stream;
      stream.ensure(length);
      var str = utf8encode(stream.bytes.subarray(stream.pos,
                           stream.pos + length));
      stream.pos += length;
      return str;
    },
    readUnsignedByte: function readUnsignedByte() {
      throw 'Not implemented: URLStream.readUnsignedByte';
    },
    readUnsignedInt: function readUnsignedInt() {
      throw 'Not implemented: URLStream.readUnsignedInt';
    },
    readUnsignedShort: function readUnsignedShort() {
      var stream = this._stream;
      stream.ensure(2);
      var result = stream.getUint16(stream.pos, this._littleEndian);
      stream.pos += 2;
      return result;
    },

    get bytesAvailable() {
      return this._stream.remaining();
    },
    get connected() {
      return this._connected;
    },
    get endian() {
      return this._littleEndian ? 'littleEndian' : 'bigEndian';
    },
    set endian(val) {
      this._littleEndian = (val == 'littleEndian');
    },
    get objectEncoding() {
      throw 'Not implemented: URLStream.objectEncoding$get';
    },
    set objectEncoding(val) {
      throw 'Not implemented: URLStream.objectEncoding$set';
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        close: def.close,
        load: def.load,
        readBoolean: def.readBoolean,
        readByte: def.readByte,
        readBytes: def.readBytes,
        readDouble: def.readDouble,
        readFloat: def.readFloat,
        readInt: def.readInt,
        readMultiByte: def.readMultiByte,
        readObject: def.readObject,
        readShort: def.readShort,
        readUTF: def.readUTF,
        readUTFBytes: def.readUTFBytes,
        readUnsignedByte: def.readUnsignedByte,
        readUnsignedInt: def.readUnsignedInt,
        readUnsignedShort: def.readUnsignedShort,
        bytesAvailable: desc(def, 'bytesAvailable'),
        connected: desc(def, 'connected'),
        endian: desc(def, 'endian'),
        objectEncoding: desc(def, 'objectEncoding')
      }
    }
  };

  return def;
}).call(this);
