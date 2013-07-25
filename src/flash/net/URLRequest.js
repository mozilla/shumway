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
/*global Multiname, getProperty */

var URLRequestDefinition = (function () {
  function toFileLoadingServiceRequest() {
    var obj = {};
    obj.url = this._url;
    obj.method = this._method;
    obj.checkPolicyFile = this._checkPolicyFile;
    if (this._data) {
      obj.mimeType = this._contentType;
      var ByteArrayClass = avm2.systemDomain.getClass("flash.utils.ByteArray");
      if (ByteArrayClass.isInstanceOf(this._data)) {
        obj.data = new Uint8Array(this._data.a, 0, this._data.length);
      } else {
        var data = this._data.getMultinameProperty(undefined, "toString", 0)
          .call(this._data);
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

  var def = {
    initialize: function () {
      this._url = null;
      this._method = 'GET';
      this._data = null;
      this._digest = null;
      this._contentType = 'application/x-www-form-urlencoded';
      this._requestHeaders = null;
      this._checkPolicyFile = true;
      this._toFileRequest = toFileLoadingServiceRequest;
    },

    setMethod: function (val) {
      this._method = val;
    },
    setRequestHeaders: function (val) {
      this._requestHeaders = val;
    },

    get contentType() {
      return this._contentType;
    },
    set contentType(val) {
      this._contentType = val;
    },
    get data() {
      return this._data;
    },
    set data(val) {
      this._data = val;
    },
    get digest() {
      return this._digest;
    },
    set digest(val) {
      this._digest = val;
    },
    get method() {
      return this._method;
    },
    set method(method) {
      this._method = method;
    },
    get requestHeaders() {
      return this._requestHeaders;
    },
    set requestHeaders(requestHeaders) {
      this._requestHeaders = requestHeaders;
    },
    get url() {
      return this._url;
    },
    set url(val) {
      this._url= val;
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        setMethod: def.setMethod,
        setRequestHeaders: def.setRequestHeaders,
        contentType: desc(def, 'contentType'),
        data: desc(def, 'data'),
        digest: desc(def, 'digest'),
        method: desc(def, 'method'),
        requestHeaders: desc(def, 'requestHeaders'),
        url: desc(def, 'url')
      }
    }
  };

  return def;
}).call(this);
