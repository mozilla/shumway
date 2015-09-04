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
// Class: SecureSocket
module Shumway.AVMX.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class SecureSocket extends flash.net.Socket {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["serverCertificateStatus", "connect"];
    
    constructor () {
      super(undefined, undefined);
    }
    
    // JS -> AS Bindings
    
    serverCertificateStatus: string;
    connect: (host: string, port: number /*int*/) => void;
    
    // AS -> JS Bindings
    // static _isSupported: boolean;
    get isSupported(): boolean {
      release || notImplemented("public flash.net.SecureSocket::get isSupported"); return;
      // return this._isSupported;
    }
    
    // _serverCertificateStatus: string;
    // _serverCertificate: flash.security.X509Certificate;
    get serverCertificate(): flash.security.X509Certificate {
      release || notImplemented("public flash.net.SecureSocket::get serverCertificate"); return;
      // return this._serverCertificate;
    }
    addBinaryChainBuildingCertificate(certificate: flash.utils.ByteArray, trusted: boolean): void {
      certificate = certificate; trusted = !!trusted;
      release || notImplemented("public flash.net.SecureSocket::addBinaryChainBuildingCertificate"); return;
    }
  }
}
