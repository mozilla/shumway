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
// Class: URLStream
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import FileLoadingService = Shumway.FileLoadingService;
  import throwError = Shumway.AVM2.Runtime.throwError;

  declare var Stream;

  export class URLStream extends flash.events.EventDispatcher implements flash.utils.IDataInput {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function () {
      this._stream = null;
      this._connected = false;
      this._littleEndian = false;
      this._endian = 'bigEndian';
    };
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.URLStream");
    }

    private _stream;
    private _session;
    private _littleEndian: boolean;

    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    private _connected: boolean;
    // _objectEncoding: number /*uint*/;
    private _endian: string;
    // _diskCacheEnabled: boolean;
    // _position: number;
    // _length: number;
    get connected(): boolean {
      return this._connected;
    }
    get bytesAvailable(): number /*uint*/ {
      return this._stream.remaining();
    }
    get objectEncoding(): number /*uint*/ {
      notImplemented("public flash.net.URLStream::get objectEncoding"); return;
      // return this._objectEncoding;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("public flash.net.URLStream::set objectEncoding"); return;
      // this._objectEncoding = version;
    }
    get endian(): string {
      return this._endian;
    }
    set endian(type: string) {
      type = asCoerceString(type);
      this._endian = type;
      this._littleEndian = type === 'littleEndian';
    }
    get diskCacheEnabled(): boolean {
      notImplemented("public flash.net.URLStream::get diskCacheEnabled"); return;
      // return this._diskCacheEnabled;
    }
    get position(): number {
      notImplemented("public flash.net.URLStream::get position"); return;
      // return this._position;
    }
    set position(offset: number) {
      offset = +offset;
      notImplemented("public flash.net.URLStream::set position"); return;
      // this._position = offset;
    }
    get length(): number {
      notImplemented("public flash.net.URLStream::get length"); return;
      // return this._length;
    }
    load(request: flash.net.URLRequest): void {
      var Event = flash.events.Event;
      var IOErrorEvent = flash.events.IOErrorEvent;
      var ProgressEvent = flash.events.ProgressEvent;
      var HTTPStatusEvent = flash.events.HTTPStatusEvent;

      var session = FileLoadingService.instance.createSession();
      var self = this;
      var initStream = true;
      session.onprogress = function (data, progressState) {
        var length: number;
        var buffer: ArrayBuffer;
        if (initStream) {
          initStream = false;
          length = Math.max(progressState.bytesTotal, data.length);
          buffer = new ArrayBuffer(length);
          self._stream = new Stream(buffer, 0, 0, length);
        } else if (self._stream.end + data.length > self._stream.bytes.length) {
          length = self._stream.end + data.length;
          buffer = new ArrayBuffer(length);
          var newStream = new Stream(buffer, 0, 0, length);
          newStream.push(self._stream.bytes.subarray(0, self._stream.end));
          self._stream = newStream;
        }
        self._stream.push(data);
        self.dispatchEvent(new ProgressEvent(ProgressEvent.PROGRESS,
          false, false, progressState.bytesLoaded, progressState.bytesTotal));
      };
      session.onerror = function (error) {
        self._connected = false;
        if (!self._stream) {
          // We need to have something to return in data
          self._stream = new Stream(new ArrayBuffer(0), 0, 0, 0);
        }
        self.dispatchEvent(new IOErrorEvent(IOErrorEvent.IO_ERROR, false, false, error));
      };
      session.onopen = function () {
        self._connected = true;
        self.dispatchEvent(new Event(Event.OPEN, false, false));
      };
      session.onhttpstatus = function (location: string, httpStatus: number, httpHeaders: any) {
        var httpStatusEvent = new HTTPStatusEvent(HTTPStatusEvent.HTTP_STATUS, false, false, httpStatus);
        var headers = [];
        httpHeaders.split(/(?:\n|\r?\n)/g).forEach(function (h) {
          var m = /^([^:]+): (.*)$/.exec(h);
          if (m) {
            headers.push(new flash.net.URLRequestHeader(m[1], m[2]));
            if (m[1] === 'Location') { // Headers have redirect location
              location = m[2];
            }
          }
        });
        httpStatusEvent.asSetPublicProperty('responseHeaders', headers);
        httpStatusEvent.asSetPublicProperty('responseURL', location);
        self.dispatchEvent(httpStatusEvent);
      };
      session.onclose = function () {
        self._connected = false;
        if (!self._stream) {
          // We need to have something to return in data
          self._stream = new Stream(new ArrayBuffer(0), 0, 0, 0);
        }

        self.dispatchEvent(new Event(Event.COMPLETE, false, false));
      };
      session.open(request._toFileRequest());
      this._session = session;
    }
    readBytes(bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
      offset = offset >>> 0; length = length >>> 0;
      if (length < 0) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      var stream = this._stream;
      if (!length) {
        length = stream.remaining();
      } else {
        stream.ensure(length);
      }
      bytes.position = offset;
      bytes.writeRawBytes(
        stream.bytes.subarray(stream.pos, stream.pos + length));
      stream.pos += length;
    }
    readBoolean(): boolean {
      notImplemented("public flash.net.URLStream::readBoolean"); return;
    }
    readByte(): number /*int*/ {
      var stream = this._stream;
      stream.ensure(1);
      return stream.bytes[stream.pos++];
    }
    readUnsignedByte(): number /*uint*/ {
      notImplemented("public flash.net.URLStream::readUnsignedByte"); return;
    }
    readShort(): number /*int*/ {
      notImplemented("public flash.net.URLStream::readShort"); return;
    }
    readUnsignedShort(): number /*uint*/ {
      var stream = this._stream;
      stream.ensure(2);
      var result = stream.getUint16(stream.pos, this._littleEndian);
      stream.pos += 2;
      return result;
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
      length = length >>> 0; charSet = asCoerceString(charSet);
      notImplemented("public flash.net.URLStream::readMultiByte"); return;
    }
    readUTF(): string {
      return this.readUTFBytes(this.readUnsignedShort());
    }
    readUTFBytes(length: number /*uint*/): string {
      length = length >>> 0;
      if (length < 0) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      var stream = this._stream;
      stream.ensure(length);
      var str = Shumway.StringUtilities.utf8encode(
        stream.bytes.subarray(stream.pos, stream.pos + length));
      stream.pos += length;
      return str;
    }
    close(): void {
      this._session.close();
    }
    readObject(): any {
      notImplemented("public flash.net.URLStream::readObject"); return;
    }
    stop(): void {
      notImplemented("public flash.net.URLStream::stop"); return;
    }
  }
}
