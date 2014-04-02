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
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["method", "requestHeaders"];
    
    constructor (url: string = null) {
      url = "" + url;
      false && super();
      notImplemented("Dummy Constructor: public flash.net.URLRequest");
    }
    
    // JS -> AS Bindings
    
    // method: string;
    // requestHeaders: any [];
    
    // AS -> JS Bindings
    
    // _url: string;
    // _data: ASObject;
    // _method: string;
    // _contentType: string;
    // _requestHeaders: any [];
    // _digest: string;
    get url(): string {
      notImplemented("public flash.net.URLRequest::get url"); return;
      // return this._url;
    }
    set url(value: string) {
      value = "" + value;
      notImplemented("public flash.net.URLRequest::set url"); return;
      // this._url = value;
    }
    get data(): ASObject {
      notImplemented("public flash.net.URLRequest::get data"); return;
      // return this._data;
    }
    set data(value: ASObject) {
      value = value;
      notImplemented("public flash.net.URLRequest::set data"); return;
      // this._data = value;
    }
    get method(): string {
      notImplemented("public flash.net.URLRequest::get method"); return;
      // return this._method;
    }
    get contentType(): string {
      notImplemented("public flash.net.URLRequest::get contentType"); return;
      // return this._contentType;
    }
    set contentType(value: string) {
      value = "" + value;
      notImplemented("public flash.net.URLRequest::set contentType"); return;
      // this._contentType = value;
    }
    get requestHeaders(): any [] {
      notImplemented("public flash.net.URLRequest::get requestHeaders"); return;
      // return this._requestHeaders;
    }
    get digest(): string {
      notImplemented("public flash.net.URLRequest::get digest"); return;
      // return this._digest;
    }
    set digest(value: string) {
      value = "" + value;
      notImplemented("public flash.net.URLRequest::set digest"); return;
      // this._digest = value;
    }
    setMethod(value: string): any {
      value = "" + value;
      notImplemented("public flash.net.URLRequest::setMethod"); return;
    }
    setRequestHeaders(value: any []): any {
      value = value;
      notImplemented("public flash.net.URLRequest::setRequestHeaders"); return;
    }
  }
}
