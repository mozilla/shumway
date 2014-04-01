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
// Class: X509Certificate
module Shumway.AVM2.AS.flash.security {
  import notImplemented = Shumway.Debug.notImplemented;
  export class X509Certificate extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.security.X509Certificate");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get version(): number /*uint*/ {
      notImplemented("public flash.security.X509Certificate::get version"); return;
    }
    get serialNumber(): string {
      notImplemented("public flash.security.X509Certificate::get serialNumber"); return;
    }
    get signatureAlgorithmOID(): string {
      notImplemented("public flash.security.X509Certificate::get signatureAlgorithmOID"); return;
    }
    get signatureAlgorithmParams(): flash.utils.ByteArray {
      notImplemented("public flash.security.X509Certificate::get signatureAlgorithmParams"); return;
    }
    get issuer(): flash.security.X500DistinguishedName {
      notImplemented("public flash.security.X509Certificate::get issuer"); return;
    }
    get validNotBefore(): ASDate {
      notImplemented("public flash.security.X509Certificate::get validNotBefore"); return;
    }
    get validNotAfter(): ASDate {
      notImplemented("public flash.security.X509Certificate::get validNotAfter"); return;
    }
    get subject(): flash.security.X500DistinguishedName {
      notImplemented("public flash.security.X509Certificate::get subject"); return;
    }
    get subjectPublicKeyAlgorithmOID(): string {
      notImplemented("public flash.security.X509Certificate::get subjectPublicKeyAlgorithmOID"); return;
    }
    get subjectPublicKey(): string {
      notImplemented("public flash.security.X509Certificate::get subjectPublicKey"); return;
    }
    get issuerUniqueID(): string {
      notImplemented("public flash.security.X509Certificate::get issuerUniqueID"); return;
    }
    get subjectUniqueID(): string {
      notImplemented("public flash.security.X509Certificate::get subjectUniqueID"); return;
    }
    get encoded(): flash.utils.ByteArray {
      notImplemented("public flash.security.X509Certificate::get encoded"); return;
    }
  }
}
