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
// Class: X500DistinguishedName
module Shumway.AVM2.AS.flash.security {
  import notImplemented = Shumway.Debug.notImplemented;
  export class X500DistinguishedName extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.security.X500DistinguishedName");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get commonName(): string {
      notImplemented("public flash.security.X500DistinguishedName::get commonName"); return;
    }
    get organizationName(): string {
      notImplemented("public flash.security.X500DistinguishedName::get organizationName"); return;
    }
    get organizationalUnitName(): string {
      notImplemented("public flash.security.X500DistinguishedName::get organizationalUnitName"); return;
    }
    get localityName(): string {
      notImplemented("public flash.security.X500DistinguishedName::get localityName"); return;
    }
    get stateOrProvinceName(): string {
      notImplemented("public flash.security.X500DistinguishedName::get stateOrProvinceName"); return;
    }
    get countryName(): string {
      notImplemented("public flash.security.X500DistinguishedName::get countryName"); return;
    }
    toString(): string {
      notImplemented("public flash.security.X500DistinguishedName::toString"); return;
    }
  }
}
