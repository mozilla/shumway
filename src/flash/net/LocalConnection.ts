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
// Class: LocalConnection
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import FileLoadingService = Shumway.FileLoadingService;

  export class LocalConnection extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // ["isSupported"];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super(undefined);
      dummyConstructor("public flash.net.LocalConnection");
    }
    
    // JS -> AS Bindings
    static isSupported: boolean;
    
    
    // AS -> JS Bindings
    // static _isSupported: boolean;
    
    // _domain: string;
    // _client: ASObject;
    // _isPerUser: boolean;
    close(): void {
      notImplemented("public flash.net.LocalConnection::close"); return;
    }
    connect(connectionName: string): void {
      connectionName = asCoerceString(connectionName);
      notImplemented("public flash.net.LocalConnection::connect"); return;
    }
    get domain(): string {
      somewhatImplemented("public flash.net.LocalConnection::get domain");
      // HACK some SWFs want to know where they are hosted
      var url = FileLoadingService.instance.resolveUrl('/');
      var m = /:\/\/(.+?)[:?#\/]/.exec(url);
      return m && m[1];
    }
    send(connectionName: string, methodName: string): void {
      connectionName = asCoerceString(connectionName); methodName = asCoerceString(methodName);
      notImplemented("public flash.net.LocalConnection::send"); return;
    }
    get client(): ASObject {
      notImplemented("public flash.net.LocalConnection::get client"); return;
      // return this._client;
    }
    set client(client: ASObject) {
      client = client;
      notImplemented("public flash.net.LocalConnection::set client"); return;
      // this._client = client;
    }
    get isPerUser(): boolean {
      notImplemented("public flash.net.LocalConnection::get isPerUser"); return;
      // return this._isPerUser;
    }
    set isPerUser(newValue: boolean) {
      newValue = !!newValue;
      notImplemented("public flash.net.LocalConnection::set isPerUser"); return;
      // this._isPerUser = newValue;
    }
    allowDomain(): void {
      notImplemented("public flash.net.LocalConnection::allowDomain"); return;
    }
    allowInsecureDomain(): void {
      notImplemented("public flash.net.LocalConnection::allowInsecureDomain"); return;
    }
  }
}
