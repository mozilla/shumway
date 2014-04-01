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
// Class: NetConnection
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class NetConnection extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.NetConnection");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    get defaultObjectEncoding(): number /*uint*/ {
      notImplemented("public flash.net.NetConnection::get defaultObjectEncoding"); return;
    }
    set defaultObjectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("public flash.net.NetConnection::set defaultObjectEncoding"); return;
    }
    // Instance JS -> AS Bindings
    close: () => void;
    addHeader: (operation: string, mustUnderstand: boolean = false, param: ASObject = null) => void;
    call: (command: string, responder: flash.net.Responder) => void;
    // Instance AS -> JS Bindings
    get connected(): boolean {
      notImplemented("public flash.net.NetConnection::get connected"); return;
    }
    get uri(): string {
      notImplemented("public flash.net.NetConnection::get uri"); return;
    }
    connect(command: string): void {
      command = "" + command;
      notImplemented("public flash.net.NetConnection::connect"); return;
    }
    get client(): ASObject {
      notImplemented("public flash.net.NetConnection::get client"); return;
    }
    set client(object: ASObject) {
      object = object;
      notImplemented("public flash.net.NetConnection::set client"); return;
    }
    get objectEncoding(): number /*uint*/ {
      notImplemented("public flash.net.NetConnection::get objectEncoding"); return;
    }
    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      notImplemented("public flash.net.NetConnection::set objectEncoding"); return;
    }
    get proxyType(): string {
      notImplemented("public flash.net.NetConnection::get proxyType"); return;
    }
    set proxyType(ptype: string) {
      ptype = "" + ptype;
      notImplemented("public flash.net.NetConnection::set proxyType"); return;
    }
    get connectedProxyType(): string {
      notImplemented("public flash.net.NetConnection::get connectedProxyType"); return;
    }
    get usingTLS(): boolean {
      notImplemented("public flash.net.NetConnection::get usingTLS"); return;
    }
    get protocol(): string {
      notImplemented("public flash.net.NetConnection::get protocol"); return;
    }
    get maxPeerConnections(): number /*uint*/ {
      notImplemented("public flash.net.NetConnection::get maxPeerConnections"); return;
    }
    set maxPeerConnections(maxPeers: number /*uint*/) {
      maxPeers = maxPeers >>> 0;
      notImplemented("public flash.net.NetConnection::set maxPeerConnections"); return;
    }
    get nearID(): string {
      notImplemented("public flash.net.NetConnection::get nearID"); return;
    }
    get farID(): string {
      notImplemented("public flash.net.NetConnection::get farID"); return;
    }
    get nearNonce(): string {
      notImplemented("public flash.net.NetConnection::get nearNonce"); return;
    }
    get farNonce(): string {
      notImplemented("public flash.net.NetConnection::get farNonce"); return;
    }
    get unconnectedPeerStreams(): any [] {
      notImplemented("public flash.net.NetConnection::get unconnectedPeerStreams"); return;
    }
    invoke(index: number /*uint*/): any {
      index = index >>> 0;
      notImplemented("public flash.net.NetConnection::invoke"); return;
    }
    invokeWithArgsArray(index: number /*uint*/, args: any []): any {
      index = index >>> 0; args = args;
      notImplemented("public flash.net.NetConnection::invokeWithArgsArray"); return;
    }
  }
}
