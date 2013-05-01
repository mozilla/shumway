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

var NetConnectionDefinition = (function () {
  return {
    // ()
    __class__: "flash.net.NetConnection",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          defaultObjectEncoding: {
            get: function defaultObjectEncoding() { // (void) -> uint
              notImplemented("NetConnection.defaultObjectEncoding");
            },
            set: function defaultObjectEncoding(version) { // (version:uint) -> void
              notImplemented("NetConnection.defaultObjectEncoding");
            }
          }
        },
        instance: {
          connect: function connect(command) { // (command:String, ...arguments) -> void
            somewhatImplemented("NetConnection.connect");
            this._uri = command;
            if (command == null) {
              this._connected = true;
              var info = {
                level : 'status',
                code : 'NetConnection.Connect.Success'
              };
              this.dispatchEvent(new flash.events.NetStatusEvent('netStatus',
                                                                 false,
                                                                 false,
                                                                 info));
            }
          },
          call: function call(command, responder) { // (command:String, responder:Responder, ...arguments) -> any
            notImplemented("NetConnection.call");
          },
          connected: {
            get: function connected() { // (void) -> Boolean
              return this._connected;
            }
          },
          uri: {
            get: function uri() { // (void) -> String
              return this._uri;
            }
          },
          client: {
            get: function client() { // (void) -> Object
              return this._client;
            },
            set: function client(object) { // (object:Object) -> void
              this._client = object;
            }
          },
          objectEncoding: {
            get: function objectEncoding() { // (void) -> uint
              notImplemented("NetConnection.objectEncoding");
              return this._objectEncoding;
            },
            set: function objectEncoding(version) { // (version:uint) -> void
              notImplemented("NetConnection.objectEncoding");
              this._objectEncoding = version;
            }
          },
          proxyType: {
            get: function proxyType() { // (void) -> String
              notImplemented("NetConnection.proxyType");
              return this._proxyType;
            },
            set: function proxyType(ptype) { // (ptype:String) -> void
              notImplemented("NetConnection.proxyType");
              this._proxyType = ptype;
            }
          },
          connectedProxyType: {
            get: function connectedProxyType() { // (void) -> String
              notImplemented("NetConnection.connectedProxyType");
              return this._connectedProxyType;
            }
          },
          usingTLS: {
            get: function usingTLS() { // (void) -> Boolean
              somewhatImplemented("NetConnection.usingTLS");
              return false;
            }
          },
          protocol: {
            get: function protocol() { // (void) -> String
              notImplemented("NetConnection.protocol");
              return this._protocol;
            }
          },
          maxPeerConnections: {
            get: function maxPeerConnections() { // (void) -> uint
              notImplemented("NetConnection.maxPeerConnections");
              return this._maxPeerConnections;
            },
            set: function maxPeerConnections(maxPeers) { // (maxPeers:uint) -> void
              notImplemented("NetConnection.maxPeerConnections");
              this._maxPeerConnections = maxPeers;
            }
          },
          nearID: {
            get: function nearID() { // (void) -> String
              notImplemented("NetConnection.nearID");
              return this._nearID;
            }
          },
          farID: {
            get: function farID() { // (void) -> String
              notImplemented("NetConnection.farID");
              return this._farID;
            }
          },
          nearNonce: {
            get: function nearNonce() { // (void) -> String
              notImplemented("NetConnection.nearNonce");
              return this._nearNonce;
            }
          },
          farNonce: {
            get: function farNonce() { // (void) -> String
              notImplemented("NetConnection.farNonce");
              return this._farNonce;
            }
          },
          unconnectedPeerStreams: {
            get: function unconnectedPeerStreams() { // (void) -> Array
              notImplemented("NetConnection.unconnectedPeerStreams");
              return this._unconnectedPeerStreams;
            }
          }
        }
      }
    }
  };
}).call(this);
