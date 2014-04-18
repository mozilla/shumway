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
// Class: ApplicationDomain
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class ApplicationDomain extends ASNative {
    static classInitializer: any = null;
    static initializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    
    constructor (parentDomain: flash.system.ApplicationDomain = null) {
      false && super();
      this._parentDomain = parentDomain;
    }
    
    // JS -> AS Bindings

    // AS -> JS Bindings
    // static _currentDomain: flash.system.ApplicationDomain;
    // static _MIN_DOMAIN_MEMORY_LENGTH: number /*uint*/;
    get currentDomain(): flash.system.ApplicationDomain {
      notImplemented("public flash.system.ApplicationDomain::get currentDomain"); return;
      // return this._currentDomain;
    }
    get MIN_DOMAIN_MEMORY_LENGTH(): number /*uint*/ {
      notImplemented("public flash.system.ApplicationDomain::get MIN_DOMAIN_MEMORY_LENGTH"); return;
      // return this._MIN_DOMAIN_MEMORY_LENGTH;
    }
    
    // _parentDomain: flash.system.ApplicationDomain;
    // _domainMemory: flash.utils.ByteArray;
    get parentDomain(): flash.system.ApplicationDomain {
      notImplemented("public flash.system.ApplicationDomain::get parentDomain"); return;
      // return this._parentDomain;
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
    getDefinition(name: string): ASObject {
      name = asCoerceString(name);
      notImplemented("public flash.system.ApplicationDomain::getDefinition"); return;
    }
    hasDefinition(name: string): boolean {
      name = asCoerceString(name);
      notImplemented("public flash.system.ApplicationDomain::hasDefinition"); return;
    }
    getQualifiedDefinitionNames(): ASVector<any> {
      notImplemented("public flash.system.ApplicationDomain::getQualifiedDefinitionNames"); return;
    }
  }
}
