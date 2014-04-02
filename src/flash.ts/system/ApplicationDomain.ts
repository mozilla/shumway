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
// Class: ApplicationDomain
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ApplicationDomain extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor (parentDomain: flash.system.ApplicationDomain = null) {
      parentDomain = parentDomain;
      false && super();
      notImplemented("Dummy Constructor: public flash.system.ApplicationDomain");
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
      name = "" + name;
      notImplemented("public flash.system.ApplicationDomain::getDefinition"); return;
    }
    hasDefinition(name: string): boolean {
      name = "" + name;
      notImplemented("public flash.system.ApplicationDomain::hasDefinition"); return;
    }
    getQualifiedDefinitionNames(): ASVector<any> {
      notImplemented("public flash.system.ApplicationDomain::getQualifiedDefinitionNames"); return;
    }
    ctor(parentDomain: flash.system.ApplicationDomain): void {
      parentDomain = parentDomain;
      notImplemented("public flash.system.ApplicationDomain::ctor"); return;
    }
  }
}
