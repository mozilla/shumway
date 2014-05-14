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

package avm1lib {
import flash.events.Event;
import flash.events.HTTPStatusEvent;
import flash.events.IOErrorEvent;
import flash.events.SecurityErrorEvent;
import flash.net.URLLoader;
import flash.net.URLLoaderDataFormat;
import flash.net.URLRequest;
import flash.net.URLRequestHeader;
import flash.net.URLRequestMethod;
import flash.net.URLVariables;
import flash.net.navigateToURL;

public dynamic class LoadVars {

  public function LoadVars() {
    request = new URLRequest();
    loader = new URLLoader();
    loader.dataFormat = URLLoaderDataFormat.TEXT;
    loader.addEventListener(Event.COMPLETE, loader_complete);
    loader.addEventListener(HTTPStatusEvent.HTTP_STATUS, loader_HTTPStatus);
    loader.addEventListener(IOErrorEvent.IO_ERROR, loader_error);
    loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, loader_error);
  }

  public var contentType: String = 'application/x-www-form-urlencoded';
  public var loaded: Object = undefined; // Not a Boolean because it defaults to `undefined`.
  private var request: URLRequest;
  private var loader: URLLoader;

  public function addRequestHeader(header: Object, headerValue: String): void {
    if (header is Array) {
      var headers: Array = header as Array;
      for (var i: int = 0; i < headers.length; i += 2) {
        request.requestHeaders.push(new URLRequestHeader(headers[i] || '', headers[i + 1] || ''));
      }
    } else {
      request.requestHeaders.push(new URLRequestHeader(header + '' || '', headerValue || ''));
    }
  }

  public function decode(queryString: String): void {
    var variables: URLVariables = new URLVariables(queryString);
    for (var key: String in variables) {
      this[key] = variables[key];
    }
  }

  public function getBytesLoaded(): Number {
    return loader.bytesLoaded;
  }

  public function getBytesTotal(): Number {
    return loader.bytesTotal;
  }

  public function load(url: String): Boolean {
    if (!url) {
      return false;
    }
    request.url = url;
    request.method = URLRequestMethod.GET;
    request.contentType = contentType;
    request.data = null;
    loader.load(request);
    return true;
  }

  public function send(url: String, target: String, method: String = ''): Boolean {
    if (!url) {
      return false;
    }
    request.url = url;
    setMethod(method);
    request.contentType = contentType;
    request.data = collectSendVars();
    navigateToURL(request, target);
    return true;
  }

  public function sendAndLoad(url: String, target: Object, method: String = ''): Boolean {
    if (!url) {
      return false;
    }
    request.url = url;
    setMethod(method);
    request.contentType = contentType;
    request.data = collectSendVars();
    loader.load(request);
    return true;
  }

  public function toString(): String {
    return collectSendVars().toString();
  }

  private function collectSendVars(): URLVariables {
    var variables: URLVariables = new URLVariables();
    for (var key: String in this) {
      if (key === 'onLoad' || key === 'onData' || key === 'onStatus') {
        continue;
      }
      variables[key] = this[key];
    }
    return variables;
  }

  private function setMethod(method: String): void {
    method = method.toUpperCase();
    if (method !== 'GET' && method !== 'POST') {
      method = 'GET';
    }
    request.method = method;
  }

  private function loader_complete(e: Event): void {
    // Invoke onData if it's defined. Otherwise do the same with onLoad.
    if (this.onData) {
      this.onData(loader.data);
    } else {
      decode(loader.data);
      if (this.onLoad) {
        this.onLoad(true);
      }
    }
  }
  private function loader_HTTPStatus(e: HTTPStatusEvent): void {
    if (this.onHTTPStatus) {
      this.onHTTPStatus(e.status);
    }
  }
  private function loader_error(e: Event): void {
    if (this.onLoad) {
      this.onLoad(false);
    }
  }
}

}
