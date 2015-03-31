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
// Class: URLLoader
module Shumway.AVMX.AS.flash.net {
  import asCoerceString = Shumway.AVMX.asCoerceString;

  import Event = flash.events.Event;
  import IOErrorEvent = flash.events.IOErrorEvent;
  import ProgressEvent = flash.events.ProgressEvent;
  import HTTPStatusEvent = flash.events.HTTPStatusEvent;
  import SecurityErrorEvent = flash.events.SecurityErrorEvent;

  export class URLLoader extends flash.events.EventDispatcher {
    
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null;
    
    constructor (request?: flash.net.URLRequest) {
      super();
      var stream = this._stream = new URLStream();

      stream.addEventListener(Event.OPEN, this.onStreamOpen.bind(this));
      stream.addEventListener(Event.COMPLETE, this.onStreamComplete.bind(this));
      stream.addEventListener(ProgressEvent.PROGRESS, this.onStreamProgress.bind(this));
      stream.addEventListener(IOErrorEvent.IO_ERROR, this.onStreamIOError.bind(this));
      stream.addEventListener(HTTPStatusEvent.HTTP_STATUS, this.onStreamHTTPStatus.bind(this));
      stream.addEventListener(HTTPStatusEvent.HTTP_RESPONSE_STATUS,
                              this.onStreamHTTPResponseStatus.bind(this));
      stream.addEventListener(SecurityErrorEvent.SECURITY_ERROR,
                              this.onStreamSecurityError.bind(this));

      this.$BgdataFormat = 'text';

      if (request) {
        this.load(request);
      }
    }

    $Bgdata: any;
    $BgdataFormat: string;
    $BgbytesLoaded: number /*uint*/;
    $BgbytesTotal: number /*uint*/;

    get data() {
      return this.$Bgdata;
    }
    get dataFormat() {
      return this.$BgdataFormat;
    }
    set dataFormat(format: string) {
      release || Debug.assert(typeof format === 'string');
      this.$BgdataFormat = format;
    }
    get bytesLoaded() {
      return this.$BgbytesLoaded;
    }
    get bytesTotal() {
      return this.$BgbytesTotal;
    }

    private _stream: flash.net.URLStream;
    private _httpResponseEventBound: boolean;
    _ignoreDecodeErrors: boolean;

    load(request: URLRequest) {
      this._stream.load(request);
    }

    close() {
      this._stream.close();
    }

    complete() {
      var response = new utils.ByteArray();
      this._stream.readBytes(response);

      if (this.$BgdataFormat === 'binary') {
        this.$Bgdata = response;
        return;
      }

      var data = response.toString();
      if (response.length > 0 && this.$BgdataFormat === 'variables') {
        var variable: URLVariables = new URLVariables();
        if (this._ignoreDecodeErrors) {
          variable._ignoreDecodingErrors = true;
        }
        variable.decode(String(data));
        this.$Bgdata = variable;
      } else {
        this.$Bgdata = data;
      }
    }

    addEventListener(type: string, listener: (event: Event) => void, useCapture?: boolean,
                     priority?: number, useWeakReference?: boolean): void {
      super.addEventListener(type, listener, useCapture, priority, useWeakReference);

      // Looks like there is some bug related to the HTTP_RESPONSE_STATUS
      if (type === HTTPStatusEvent.HTTP_RESPONSE_STATUS) {
        this._httpResponseEventBound = true;
      }
    }
    
    private onStreamOpen(e: Event) {
      this.dispatchEvent(e);
    }
    private onStreamComplete(e: Event) {
      this.complete();
      this.dispatchEvent(e);
    }
    private onStreamProgress(e: ProgressEvent) {
      this.$BgbytesLoaded = e.bytesLoaded;
      this.$BgbytesTotal = e.bytesTotal;
      this.dispatchEvent(e);
    }
    private onStreamIOError(e: IOErrorEvent) {
      this.complete();
      this.dispatchEvent(e);
    }
    private onStreamHTTPStatus(e: HTTPStatusEvent) {
      this.dispatchEvent(e);
    }
    private onStreamHTTPResponseStatus(e: HTTPStatusEvent) {
      if (!this._httpResponseEventBound) {
        return;
      }
      this.dispatchEvent(e);
    }
    private onStreamSecurityError(e: SecurityErrorEvent) {
      this.dispatchEvent(e);
    }
  }
}
