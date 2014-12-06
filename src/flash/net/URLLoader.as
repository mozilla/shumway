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
import flash.events.Event;
import flash.events.EventDispatcher;
import flash.events.HTTPStatusEvent;
import flash.events.IOErrorEvent;
import flash.events.ProgressEvent;
import flash.events.SecurityErrorEvent;
import flash.utils.ByteArray;

[native(cls="URLLoaderClass")]
public class URLLoader extends EventDispatcher {
  public function URLLoader(request:URLRequest = null) {
    _stream = new URLStream();

    _stream.addEventListener(Event.OPEN, onStreamOpen);
    _stream.addEventListener(Event.COMPLETE, onStreamComplete);
    _stream.addEventListener(ProgressEvent.PROGRESS, onStreamProgress);
    _stream.addEventListener(IOErrorEvent.IO_ERROR, onStreamIOError);
    _stream.addEventListener(HTTPStatusEvent.HTTP_STATUS, onStreamHTTPStatus);
    _stream.addEventListener(HTTPStatusEvent.HTTP_RESPONSE_STATUS, onStreamHTTPResponseStatus);
    _stream.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onStreamSecurityError);

    if (request) {
      load(request);
    }
  }
  public var data;
  public var dataFormat:String = "text";
  public var bytesLoaded:uint;
  public var bytesTotal:uint;
  public override function addEventListener(type:String, listener:Function, useCapture:Boolean = false, priority:int = 0, useWeakReference:Boolean = false):void {
    super.addEventListener(type, listener, useCapture, priority, useWeakReference);

    // Looks like there is some bug related to the HTTP_RESPONSE_STATUS
    if (type == HTTPStatusEvent.HTTP_RESPONSE_STATUS) {
      _httpResponseEventBound = true;
    }
  }
  public function load(request:URLRequest):void {
    _stream.load(request);
  }
  public function close():void {
    _stream.close();
  }

  public native function _getDecodeErrorsIgnored():Boolean;
  public native function _setDecodeErrorsIgnored(value:Boolean):void;

  private var _stream:URLStream;
  private var _httpResponseEventBound:Boolean;

  private function complete() {
    var response:ByteArray = new ByteArray();
    _stream.readBytes(response);

    if (dataFormat == 'binary') {
      data = response;
      return;
    }

    data = response.toString();
    if (response.length > 0 && dataFormat == 'variables') {
      var variable: URLVariables = new URLVariables();
      if (this._getDecodeErrorsIgnored()) {
        variable._setErrorsIgnored(true);
      }
      variable.decode(String(data));
      data = variable;
    }
  }
  private function onStreamOpen(e:Event) {
    dispatchEvent(e);
  }
  private function onStreamComplete(e:Event) {
    complete();

    dispatchEvent(e);
  }
  private function onStreamProgress(e:ProgressEvent) {
    bytesLoaded = e.bytesLoaded;
    bytesTotal = e.bytesTotal;

    dispatchEvent(e);
  }
  private function onStreamIOError(e:IOErrorEvent) {
    complete();

    dispatchEvent(e);
  }
  private function onStreamHTTPStatus(e:HTTPStatusEvent) {
    dispatchEvent(e);
  }
  private function onStreamHTTPResponseStatus(e:HTTPStatusEvent) {
    if (!_httpResponseEventBound) {
      return;
    }
    dispatchEvent(e);
  }
  private function onStreamSecurityError(e:SecurityErrorEvent) {
    dispatchEvent(e);
  }
}
}
