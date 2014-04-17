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
 * limitations under the License.
 */
// Class: URLRequest
module Shumway.AVM2.AS.flash.net {
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import ByteArray = Shumway.AVM2.AS.flash.utils.ByteArray;

  export class URLRequest extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null;
    
    constructor (url: string = null) {
      url = asCoerceString(url);
      false && super();
      this._url = null;
      this._method = 'GET';
      this._data = null;
      this._digest = null;
      this._contentType = 'application/x-www-form-urlencoded';
      this._requestHeaders = null;
      this._checkPolicyFile = true;
    }

    _checkPolicyFile: boolean;

    // JS -> AS Bindings
    
    // AS -> JS Bindings
    
    private _url: string;
    private _data: ASObject;
    private _method: string;
    private _contentType: string;
    private _requestHeaders: any [];
    private _digest: string;
    get url(): string {
      return this._url;
    }
    set url(value: string) {
      value = asCoerceString(value);
      this._url = value;
    }
    get data(): ASObject {
      return this._data;
    }
    set data(value: ASObject) {
      this._data = value;
    }
    get method(): string {
      return this._method;
    }
    get contentType(): string {
      return this._contentType;
    }
    set contentType(value: string) {
      value = asCoerceString(value);
      this._contentType = value;
    }
    get requestHeaders(): any [] {
      return this._requestHeaders;
    }
    get digest(): string {
      return this._digest;
    }
    set digest(value: string) {
      value = asCoerceString(value);
      this._digest = value;
    }
    setMethod(value: string): any {
      value = asCoerceString(value);
      this._method = value;
    }
    setRequestHeaders(value: any []): any {
      value = value;
      this._requestHeaders = value;
    }

    _toFileRequest(): any {
      var obj: any = {};
      obj.url = this._url;
      obj.method = this._method;
      obj.checkPolicyFile = this._checkPolicyFile;
      if (this._data) {
        obj.mimeType = this._contentType;
        if (ByteArray.isType(this._data)) {
          obj.data = <ASObject><any>
            new Uint8Array((<any> this._data)._buffer, 0, (<any> this._data).length);
        } else {
          var data = this._data.asGetPublicProperty("toString").call(this._data);
          if (this._method === 'GET') {
            var i = obj.url.lastIndexOf('?');
            obj.url = (i < 0 ? obj.url : obj.url.substring(0, i)) + '?' + data;
          } else {
            obj.data = data;
          }
        }
      }
      return obj;
    }

  }
}
