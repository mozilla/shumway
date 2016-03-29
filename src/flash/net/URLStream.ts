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
/// <reference path='../references.ts'/>
module Shumway.AVMX.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import FileLoadingService = Shumway.FileLoadingService;

  export class URLStream extends flash.events.EventDispatcher implements flash.utils.IDataInput {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];

    constructor () {
      super();
      this._buffer = new this.sec.flash.utils.ByteArray();
      this._writePosition = 0;
      this._connected = false;
    }

    private _buffer: utils.ByteArray;
    private _writePosition: number;
    private _session: FileLoadingSession;

    private _connected: boolean;
    // _diskCacheEnabled: boolean;
    get connected(): boolean {
      return this._connected;
    }
    get bytesAvailable(): number /*uint*/ {
      return this._buffer.length - this._buffer.position;
    }
    get objectEncoding(): number /*uint*/ {
      return this._buffer.objectEncoding;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      this._buffer.objectEncoding = version;
    }
    get endian(): string {
      return this._buffer.endian;
    }
    set endian(type: string) {
      type = axCoerceString(type);
      this._buffer.endian = type;
    }
    get diskCacheEnabled(): boolean {
      release || notImplemented("public flash.net.URLStream::get diskCacheEnabled"); return;
      // return this._diskCacheEnabled;
    }
    get position(): number {
      return this._buffer.position;
    }
    set position(offset: number) {
      offset = +offset;
      this._buffer.position = offset;
    }
    get length(): number {
      return this._buffer.length;
    }
    load(request: flash.net.URLRequest): void {
      var Event = flash.events.Event;
      var IOErrorEvent = flash.events.IOErrorEvent;
      var ProgressEvent = flash.events.ProgressEvent;
      var HTTPStatusEvent = flash.events.HTTPStatusEvent;

      var session = FileLoadingService.instance.createSession();
      var self = this;
      var initStream = true;
      var eventsPackage = this.sec.flash.events;
      session.onprogress = function (data, progressState) {
        var readPosition = self._buffer.position;
        self._buffer.position = self._writePosition;
        self._buffer.writeRawBytes(data);
        self._writePosition = self._buffer.position;
        self._buffer.position = readPosition;

        self.dispatchEvent(new eventsPackage.ProgressEvent(ProgressEvent.PROGRESS, false, false,
                                                           progressState.bytesLoaded,
                                                           progressState.bytesTotal));
      };
      session.onerror = function (error) {
        self._connected = false;
        self.dispatchEvent(new eventsPackage.IOErrorEvent(IOErrorEvent.IO_ERROR, false, false,
                                                          error));
        var isXDomainError = typeof error === 'string' && error.indexOf('XDOMAIN') >= 0;
        Telemetry.instance.reportTelemetry({topic: 'loadResource',
          resultType: isXDomainError ? Telemetry.LoadResource.StreamCrossdomain :
                                       Telemetry.LoadResource.StreamDenied});
      };
      session.onopen = function () {
        self._connected = true;
        self.dispatchEvent(new eventsPackage.Event(Event.OPEN, false, false));
        Telemetry.instance.reportTelemetry({topic: 'loadResource',
          resultType: Telemetry.LoadResource.StreamAllowed});
      };
      session.onhttpstatus = function (location: string, httpStatus: number, httpHeaders: any) {
        var httpStatusEvent = new eventsPackage.HTTPStatusEvent(HTTPStatusEvent.HTTP_STATUS, false,
                                                                false, httpStatus);
        var headers = [];
        httpHeaders.split(/(?:\n|\r?\n)/g).forEach(function (h) {
          var m = /^([^:]+): (.*)$/.exec(h);
          if (m) {
            headers.push(new self.sec.flash.net.URLRequestHeader(m[1], m[2]));
            if (m[1] === 'Location') { // Headers have redirect location
              location = m[2];
            }
          }
        });
        var boxedHeaders = self.sec.createArray(headers);
        httpStatusEvent.axSetPublicProperty('responseHeaders', boxedHeaders);
        httpStatusEvent.axSetPublicProperty('responseURL', location);
        self.dispatchEvent(httpStatusEvent);
      };
      session.onclose = function () {
        self._connected = false;
        self.dispatchEvent(new eventsPackage.Event(Event.COMPLETE, false, false));
      };
      session.open(request._toFileRequest());
      this._session = session;
    }
    readBytes(bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
      offset = offset >>> 0; length = length >>> 0;
      if (length < 0) {
        this.sec.throwError('ArgumentError', Errors.InvalidArgumentError, "length");
      }

      this._buffer.readBytes(bytes, offset, length);
    }
    readBoolean(): boolean {
      release || notImplemented("public flash.net.URLStream::readBoolean"); return;
    }
    readByte(): number /*int*/ {
      return this._buffer.readByte();
    }
    readUnsignedByte(): number /*uint*/ {
      release || notImplemented("public flash.net.URLStream::readUnsignedByte"); return;
    }
    readShort(): number /*int*/ {
      release || notImplemented("public flash.net.URLStream::readShort"); return;
    }
    readUnsignedShort(): number /*uint*/ {
      return this._buffer.readUnsignedShort();
    }
    readUnsignedInt(): number /*uint*/ {
      release || notImplemented("public flash.net.URLStream::readUnsignedInt"); return;
    }
    readInt(): number /*int*/ {
      release || notImplemented("public flash.net.URLStream::readInt"); return;
    }
    readFloat(): number {
      release || notImplemented("public flash.net.URLStream::readFloat"); return;
    }
    readDouble(): number {
      release || notImplemented("public flash.net.URLStream::readDouble"); return;
    }
    readMultiByte(length: number /*uint*/, charSet: string): string {
      length = length >>> 0; charSet = axCoerceString(charSet);
      release || notImplemented("public flash.net.URLStream::readMultiByte"); return;
    }
    readUTF(): string {
      return this._buffer.readUTF();
    }
    readUTFBytes(length: number /*uint*/): string {
      return this._buffer.readUTFBytes(length);
    }
    close(): void {
      if (this._session) {
        this._session.close();
      }
    }
    readObject(): any {
      release || notImplemented("public flash.net.URLStream::readObject"); return;
    }
    stop(): void {
      release || notImplemented("public flash.net.URLStream::stop"); return;
    }
  }
}
