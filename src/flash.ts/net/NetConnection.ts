/**
 * Copyright 2014 Mozilla Foundation
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
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import wrapJSObject = Shumway.AVM2.Runtime.wrapJSObject;
  import Telemetry = Shumway.Telemetry;
  import NetStatusEvent = Shumway.AVM2.AS.flash.events.NetStatusEvent;

  export class NetConnection extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = ["close", "addHeader", "call"];
    
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.NetConnection");
    }
    
    // JS -> AS Bindings
    
    close: () => void;
    addHeader: (operation: string, mustUnderstand: boolean = false, param: ASObject = null) => void;
    call: (command: string, responder: flash.net.Responder) => void;
    
    // AS -> JS Bindings
    static _defaultObjectEncoding: number /*uint*/ = 3 /* AMF3 */;
    static get defaultObjectEncoding(): number /*uint*/ {
      return NetConnection._defaultObjectEncoding;
    }
    static set defaultObjectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      NetConnection._defaultObjectEncoding = version;
    }
    
    private _connected: boolean;
    private _uri: string;
    private _client: ASObject;
    private _objectEncoding: number /*uint*/;
    private _proxyType: string;
    // _connectedProxyType: string;
    private _usingTLS: boolean;
    // _protocol: string;
    // _maxPeerConnections: number /*uint*/;
    // _nearID: string;
    // _farID: string;
    // _nearNonce: string;
    // _farNonce: string;
    // _unconnectedPeerStreams: any [];
    get connected(): boolean {
      return this._connected;
    }
    get uri(): string {
      return this._uri;
    }
    connect(command: string): void {
      command = asCoerceString(command);

      somewhatImplemented("public flash.net.NetConnection::connect");
      this._uri = command;
      if (!command) {
        this._connected = true;
        this.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS,
          false, false,
          wrapJSObject({ level : 'status', code : 'NetConnection.Connect.Success'})));
      } else {
        this.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS,
          false, false,
          wrapJSObject({ level : 'status', code : 'NetConnection.Connect.Failed'})));
      }
    }
    get client(): ASObject {
      return this._client;
    }
    set client(object: ASObject) {
      this._client = object;
    }
    get objectEncoding(): number /*uint*/ {
      return this._objectEncoding;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      somewhatImplemented("public flash.net.NetConnection::set objectEncoding");
      this._objectEncoding = version;
    }
    get proxyType(): string {
      return this._proxyType;
    }
    set proxyType(ptype: string) {
      ptype = asCoerceString(ptype);
      somewhatImplemented("public flash.net.NetConnection::set proxyType");
      this._proxyType = ptype;
    }
    get connectedProxyType(): string {
      notImplemented("public flash.net.NetConnection::get connectedProxyType"); return;
      // return this._connectedProxyType;
    }
    get usingTLS(): boolean {
      somewhatImplemented("public flash.net.NetConnection::get usingTLS");
      return this._usingTLS;
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
      this._uri = null;
      this._connected = false;
      this._client = null;
      this._proxyType = 'none';
      this._objectEncoding = NetConnection.defaultObjectEncoding;
      this._usingTLS = false;

      Telemetry.instance.reportTelemetry({topic: 'feature', feature: Telemetry.Feature.NETCONNECTION_FEATURE});
    }
    invoke(index: number /*uint*/): any {
      index = index >>> 0;
      return this._invoke(index, Array.prototype.slice.call(arguments, 1));
    }
    invokeWithArgsArray(index: number /*uint*/, p_arguments: any []): any {
      index = index >>> 0; p_arguments = p_arguments;
      return this._invoke.call(this, index, p_arguments);
    }
    private _invoke(index: number, args: any[]): any {
      var simulated = false;
      var result;
      switch (index) {
        case 2: // call, e.g. with ('createStream', <Responder>)
          simulated = true;
          break;
      }
      (simulated ? somewhatImplemented : notImplemented)(
        "private flash.net.NetConnection::_invoke (" + index + ")");
      return result;
    }

  }
}
