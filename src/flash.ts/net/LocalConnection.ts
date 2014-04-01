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
// Class: LocalConnection
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class LocalConnection extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.LocalConnection");
    }
    // Static   JS -> AS Bindings
    static isSupported: boolean;
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    close(): void {
      notImplemented("public flash.net.LocalConnection::close"); return;
    }
    connect(connectionName: string): void {
      connectionName = "" + connectionName;
      notImplemented("public flash.net.LocalConnection::connect"); return;
    }
    get domain(): string {
      notImplemented("public flash.net.LocalConnection::get domain"); return;
    }
    send(connectionName: string, methodName: string): void {
      connectionName = "" + connectionName; methodName = "" + methodName;
      notImplemented("public flash.net.LocalConnection::send"); return;
    }
    get client(): ASObject {
      notImplemented("public flash.net.LocalConnection::get client"); return;
    }
    set client(client: ASObject) {
      client = client;
      notImplemented("public flash.net.LocalConnection::set client"); return;
    }
    get isPerUser(): boolean {
      notImplemented("public flash.net.LocalConnection::get isPerUser"); return;
    }
    set isPerUser(newValue: boolean) {
      newValue = !!newValue;
      notImplemented("public flash.net.LocalConnection::set isPerUser"); return;
    }
    allowDomain(): void {
      notImplemented("public flash.net.LocalConnection::allowDomain"); return;
    }
    allowInsecureDomain(): void {
      notImplemented("public flash.net.LocalConnection::allowInsecureDomain"); return;
    }
  }
}
