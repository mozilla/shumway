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
// Class: SecurityDomain
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class SecurityDomain extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.system.SecurityDomain");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    get currentDomain(): flash.system.SecurityDomain {
      notImplemented("public flash.system.SecurityDomain::get currentDomain"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    ctor_impl(): void {
      notImplemented("public flash.system.SecurityDomain::ctor_impl"); return;
    }
    get domainID(): string {
      notImplemented("public flash.system.SecurityDomain::get domainID"); return;
    }
  }
}
