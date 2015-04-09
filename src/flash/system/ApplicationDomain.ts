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
// Class: ApplicationDomain
module Shumway.AVMX.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import RuntimeApplicationDomain = Shumway.AVMX.ApplicationDomain;

  export class ApplicationDomain extends ASObject {

    private _runtimeDomain: RuntimeApplicationDomain;

    constructor (parentDomainOrRuntimeDomain: any = null) {
      super();
      release || Debug.assert(!(this instanceof ApplicationDomain));
      if (parentDomainOrRuntimeDomain instanceof RuntimeApplicationDomain) {
        this._runtimeDomain = parentDomainOrRuntimeDomain;
        return;
      }
      var parentRuntimeDomain: RuntimeApplicationDomain = null;
      if (this.securityDomain.flash.system.ApplicationDomain.axIsType(parentDomainOrRuntimeDomain)) {
        parentRuntimeDomain = (<ApplicationDomain>parentDomainOrRuntimeDomain)._runtimeDomain;
      } else {
        parentRuntimeDomain = this.securityDomain.system;
      }
      this._runtimeDomain = new RuntimeApplicationDomain(this.securityDomain, parentRuntimeDomain);
    }

    // This must return a new object each time.
    static get currentDomain(): flash.system.ApplicationDomain {
      // REDUX
      return new this.securityDomain.flash.system.ApplicationDomain(this.securityDomain.application);
    }

    static get MIN_DOMAIN_MEMORY_LENGTH(): number /*uint*/ {
      notImplemented("public flash.system.ApplicationDomain::get MIN_DOMAIN_MEMORY_LENGTH"); return;
      // return this._MIN_DOMAIN_MEMORY_LENGTH;
    }

    get parentDomain(): flash.system.ApplicationDomain {
      if (this._runtimeDomain.parent) {
        return new this.securityDomain.flash.system.ApplicationDomain(this._runtimeDomain.parent);
      }
      return null;
    }

    get domainMemory(): flash.utils.ByteArray {
      notImplemented("public flash.system.ApplicationDomain::get domainMemory"); return;
      // return this._domainMemory;
    }

    set domainMemory(mem: flash.utils.ByteArray) {
      mem = mem;
      notImplemented("public flash.system.ApplicationDomain::set domainMemory"); return;
      // this._domainMemory = mem;
    }

    getDefinition(name: string): Object {
      // REDUX
      notImplemented("public flash.system.ApplicationDomain::hasDefinition"); return;
      //name = axCoerceString(name);
      //if (name) {
      //  var simpleName = name.replace("::", ".");
      //  return this._runtimeDomain.getProperty(Multiname.fromSimpleName(simpleName), true, true);
      //}
      //return null;
    }

    hasDefinition(name: string): boolean {
      name = axCoerceString(name);
      if (name) {
        var simpleName = name.replace("::", ".");
        var mn = Multiname.FromFQNString(simpleName, NamespaceType.Public);
        return !!this._runtimeDomain.getProperty(mn, false, false);
      }
      return false;
    }

    getQualifiedDefinitionNames(): GenericVector {
      notImplemented("public flash.system.ApplicationDomain::getQualifiedDefinitionNames"); return;
    }
  }
}
