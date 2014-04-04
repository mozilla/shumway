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
// Class: NetConnection
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class NetConnection extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["close", "addHeader", "call"];
    
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.NetConnection");
    }
    
    // JS -> AS Bindings
    
    close: () => void;
    addHeader: (operation: string, mustUnderstand: boolean = false, param: ASObject = null) => void;
    call: (command: string, responder: flash.net.Responder) => void;
    
    // AS -> JS Bindings
    // static _defaultObjectEncoding: number /*uint*/;
    get defaultObjectEncoding(): number /*uint*/ {
      notImplemented("public flash.net.NetConnection::get defaultObjectEncoding"); return;
      // return this._defaultObjectEncoding;
    }
    set defaultObjectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("public flash.net.NetConnection::set defaultObjectEncoding"); return;
      // this._defaultObjectEncoding = version;
    }
    
    // _connected: boolean;
    // _uri: string;
    // _client: ASObject;
    // _objectEncoding: number /*uint*/;
    // _proxyType: string;
    // _connectedProxyType: string;
    // _usingTLS: boolean;
    // _protocol: string;
    // _maxPeerConnections: number /*uint*/;
    // _nearID: string;
    // _farID: string;
    // _nearNonce: string;
    // _farNonce: string;
    // _unconnectedPeerStreams: any [];
    get connected(): boolean {
      notImplemented("public flash.net.NetConnection::get connected"); return;
      // return this._connected;
    }
    get uri(): string {
      notImplemented("public flash.net.NetConnection::get uri"); return;
      // return this._uri;
    }
    connect(command: string): void {
      command = "" + command;
      notImplemented("public flash.net.NetConnection::connect"); return;
    }
    get client(): ASObject {
      notImplemented("public flash.net.NetConnection::get client"); return;
      // return this._client;
    }
    set client(object: ASObject) {
      object = object;
      notImplemented("public flash.net.NetConnection::set client"); return;
      // this._client = object;
    }
    get objectEncoding(): number /*uint*/ {
      notImplemented("public flash.net.NetConnection::get objectEncoding"); return;
      // return this._objectEncoding;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("public flash.net.NetConnection::set objectEncoding"); return;
      // this._objectEncoding = version;
    }
    get proxyType(): string {
      notImplemented("public flash.net.NetConnection::get proxyType"); return;
      // return this._proxyType;
    }
    set proxyType(ptype: string) {
      ptype = "" + ptype;
      notImplemented("public flash.net.NetConnection::set proxyType"); return;
      // this._proxyType = ptype;
    }
    get connectedProxyType(): string {
      notImplemented("public flash.net.NetConnection::get connectedProxyType"); return;
      // return this._connectedProxyType;
    }
    get usingTLS(): boolean {
      notImplemented("public flash.net.NetConnection::get usingTLS"); return;
      // return this._usingTLS;
    }
    get protocol(): string {
      notImplemented("public flash.net.NetConnection::get protocol"); return;
      // return this._protocol;
    }
    get maxPeerConnections(): number /*uint*/ {
      notImplemented("public flash.net.NetConnection::get maxPeerConnections"); return;
      // return this._maxPeerConnections;
    }
    set maxPeerConnections(maxPeers: number /*uint*/) {
      maxPeers = maxPeers >>> 0;
      notImplemented("public flash.net.NetConnection::set maxPeerConnections"); return;
      // this._maxPeerConnections = maxPeers;
    }
    get nearID(): string {
      notImplemented("public flash.net.NetConnection::get nearID"); return;
      // return this._nearID;
    }
    get farID(): string {
      notImplemented("public flash.net.NetConnection::get farID"); return;
      // return this._farID;
    }
    get nearNonce(): string {
      notImplemented("public flash.net.NetConnection::get nearNonce"); return;
      // return this._nearNonce;
    }
    get farNonce(): string {
      notImplemented("public flash.net.NetConnection::get farNonce"); return;
      // return this._farNonce;
    }
    get unconnectedPeerStreams(): any [] {
      notImplemented("public flash.net.NetConnection::get unconnectedPeerStreams"); return;
      // return this._unconnectedPeerStreams;
    }
    ctor(): void {
      notImplemented("public flash.net.NetConnection::ctor"); return;
    }
    invoke(index: number /*uint*/): any {
      index = index >>> 0;
      notImplemented("public flash.net.NetConnection::invoke"); return;
    }
    invokeWithArgsArray(index: number /*uint*/, p_arguments: any []): any {
      index = index >>> 0; p_arguments = p_arguments;
      notImplemented("public flash.net.NetConnection::invokeWithArgsArray"); return;
    }
  }
}
