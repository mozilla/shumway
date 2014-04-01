/**
 * Copyright 2013 Mozilla Foundation
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
 * limitations undxr the License.
 */
// Class: URLRequest
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class URLRequest extends ASNative {
    static initializer: any = null;
    constructor (url: string = null) {
      url = "" + url;
      false && super();
      notImplemented("Dummy Constructor: public flash.net.URLRequest");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // method: string;
    // requestHeaders: any [];
    filterRequestHeaders: (item: any, index: number /*int*/, array: any []) => boolean;
    shouldFilterHTTPHeader: (header: string) => boolean;
    // Instance AS -> JS Bindings
    get url(): string {
      notImplemented("public flash.net.URLRequest::get url"); return;
    }
    set url(value: string) {
      value = "" + value;
      notImplemented("public flash.net.URLRequest::set url"); return;
    }
    get data(): ASObject {
      notImplemented("public flash.net.URLRequest::get data"); return;
    }
    set data(value: ASObject) {
      value = value;
      notImplemented("public flash.net.URLRequest::set data"); return;
    }
    get method(): string {
      notImplemented("public flash.net.URLRequest::get method"); return;
    }
    setMethod(value: string): void {
      value = "" + value;
      notImplemented("public flash.net.URLRequest::setMethod"); return;
    }
    get contentType(): string {
      notImplemented("public flash.net.URLRequest::get contentType"); return;
    }
    set contentType(value: string) {
      value = "" + value;
      notImplemented("public flash.net.URLRequest::set contentType"); return;
    }
    get requestHeaders(): any [] {
      notImplemented("public flash.net.URLRequest::get requestHeaders"); return;
    }
    setRequestHeaders(value: any []): void {
      value = value;
      notImplemented("public flash.net.URLRequest::setRequestHeaders"); return;
    }
    get digest(): string {
      notImplemented("public flash.net.URLRequest::get digest"); return;
    }
    set digest(value: string) {
      value = "" + value;
      notImplemented("public flash.net.URLRequest::set digest"); return;
    }
  }
}
