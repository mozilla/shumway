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
  import AXApplicationDomain = Shumway.AVMX.AXApplicationDomain;

  export class ApplicationDomain extends ASObject {

    axDomain: AXApplicationDomain;

    constructor (parentDomainOrAXDomain: any = null) {
      super();
      release || Debug.assert(!(this instanceof ApplicationDomain));
      if (parentDomainOrAXDomain instanceof AXApplicationDomain) {
        this.axDomain = parentDomainOrAXDomain;
        return;
      }
      var parentRuntimeDomain: AXApplicationDomain = null;
      if (this.sec.flash.system.ApplicationDomain.axIsType(parentDomainOrAXDomain)) {
        parentRuntimeDomain = (<ApplicationDomain>parentDomainOrAXDomain).axDomain;
      } else {
        parentRuntimeDomain = this.sec.system;
      }
      this.axDomain = new AXApplicationDomain(this.sec, parentRuntimeDomain);
    }

    // This must return a new object each time.
    static get currentDomain(): flash.system.ApplicationDomain {
      // REDUX
      return new this.sec.flash.system.ApplicationDomain(this.sec.application);
    }

    static get MIN_DOMAIN_MEMORY_LENGTH(): number /*uint*/ {
      notImplemented("public flash.system.ApplicationDomain::get MIN_DOMAIN_MEMORY_LENGTH"); return;
      // return this._MIN_DOMAIN_MEMORY_LENGTH;
    }

    get parentDomain(): flash.system.ApplicationDomain {
      if (this.axDomain.parent) {
        return new this.sec.flash.system.ApplicationDomain(this.axDomain.parent);
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
      name = axCoerceString(name);
      if (!name) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'definitionName');
        return null;
      }
      var simpleName = name.replace("::", ".");
      var mn = Multiname.FromFQNString(simpleName, NamespaceType.Public);
      var definition = this.axDomain.getProperty(mn, false, false);
      if (!definition) {
        this.sec.throwError('ReferenceError', Errors.UndefinedVarError, name);
      }
      return definition;
    }

    hasDefinition(name: string): boolean {
      return !!this.getDefinition(name);
    }

    getQualifiedDefinitionNames(): GenericVector {
      notImplemented("public flash.system.ApplicationDomain::getQualifiedDefinitionNames"); return;
    }
  }
}
