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
/*global FileLoadingService */
var LocalConnectionDefinition = (function () {
  return {
    // ()
    __class__: "flash.net.LocalConnection",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          close: function close() { // (void) -> void
            notImplemented("LocalConnection.close");
          },
          connect: function connect(connectionName) { // (connectionName:String) -> void
            notImplemented("LocalConnection.connect");
          },
          send: function send(connectionName, methodName) { // (connectionName:String, methodName:String) -> void
            notImplemented("LocalConnection.send");
          },
          allowDomain: function allowDomain() { // (void) -> void
            notImplemented("LocalConnection.allowDomain");
          },
          allowInsecureDomain: function allowInsecureDomain() { // (void) -> void
            notImplemented("LocalConnection.allowInsecureDomain");
          },
          domain: {
            get: function domain() { // (void) -> String
              somewhatImplemented("LocalConnection.domain");
              // HACK some SWFs want to know where they are hosted
              var url = FileLoadingService.resolveUrl('/');
              var m = /:\/\/(.+?)[:?#\/]/.exec(url);
              return m && m[1];
            }
          },
          client: {
            get: function client() { // (void) -> Object
              notImplemented("LocalConnection.client");
              return this._client;
            },
            set: function client(client) { // (client:Object) -> void
              notImplemented("LocalConnection.client");
              this._client = client;
            }
          },
          isPerUser: {
            get: function isPerUser() { // (void) -> Boolean
              notImplemented("LocalConnection.isPerUser");
              return this._isPerUser;
            },
            set: function isPerUser(newValue) { // (newValue:Boolean) -> void
              notImplemented("LocalConnection.isPerUser");
              this._isPerUser = newValue;
            }
          }
        }
      }
    }
  };
}).call(this);
