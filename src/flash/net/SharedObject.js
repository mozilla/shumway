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

var SharedObjectDefinition = (function () {

  var _defaultObjectEncoding = 3;

  var sharedObjects = createEmptyObject();

  return {
    // ()
    __class__: "flash.net.SharedObject",
    initialize: function () {
      this._data = {};
    },
    __glue__: {
      native: {
        static: {
          deleteAll: function deleteAll(url) { // (url:String) -> int
            notImplemented("SharedObject.deleteAll");
          },
          getDiskUsage: function getDiskUsage(url) { // (url:String) -> int
            notImplemented("SharedObject.getDiskUsage");
          },
          getLocal: function getLocal(name, localPath, secure) { // (name:String, localPath:String = null, secure:Boolean = false) -> SharedObject
            var path = localPath + "/" + name;
            return sharedObjects[path] || (sharedObjects[path] = new flash.net.SharedObject());
          },
          getRemote: function getRemote(name, remotePath, persistence, secure) { // (name:String, remotePath:String = null, persistence:Object = false, secure:Boolean = false) -> SharedObject
            notImplemented("SharedObject.getRemote");
          },
          defaultObjectEncoding: {
            get: function defaultObjectEncoding() { // (void) -> uint
              return _defaultObjectEncoding;
            },
            set: function defaultObjectEncoding(version) { // (version:uint) -> void
              _defaultObjectEncoding = version;
            }
          }
        },
        instance: {
          setDirty: function setDirty(propertyName) { // (propertyName:String) -> void
            notImplemented("SharedObject.setDirty");
          },
          invoke: function invoke(index) { // (index:uint) -> any
            notImplemented("SharedObject.invoke");
          },
          invokeWithArgsArray: function invokeWithArgsArray(index, args) { // (index:uint, args:Array) -> any
            notImplemented("SharedObject.invokeWithArgsArray");
          },
          data: {
            get: function data() { // (void) -> Object
              return this._data;
            }
          },
          objectEncoding: {
            get: function objectEncoding() { // (void) -> uint
              notImplemented("SharedObject.objectEncoding");
              return this._objectEncoding;
            },
            set: function objectEncoding(version) { // (version:uint) -> void
              notImplemented("SharedObject.objectEncoding");
              this._objectEncoding = version;
            }
          },
          client: {
            get: function client() { // (void) -> Object
              notImplemented("SharedObject.client");
              return this._client;
            },
            set: function client(object) { // (object:Object) -> void
              notImplemented("SharedObject.client");
              this._client = object;
            }
          }
        }
      }
    }
  };
}).call(this);
