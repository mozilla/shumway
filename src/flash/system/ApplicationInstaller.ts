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
// Class: ApplicationInstaller
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class ApplicationInstaller extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super(undefined);
      dummyConstructor("public flash.system.ApplicationInstaller");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    static stringsDigest(strings: ASXML): string {
      strings = strings;
      notImplemented("public flash.system.ApplicationInstaller::static stringsDigest"); return;
    }
    static iconDigest(icon: flash.utils.ByteArray): string {
      icon = icon;
      notImplemented("public flash.system.ApplicationInstaller::static iconDigest"); return;
    }
    
    // _isInstalled: boolean;
    get isInstalled(): boolean {
      notImplemented("public flash.system.ApplicationInstaller::get isInstalled"); return;
      // return this._isInstalled;
    }
    install(shortcutsOnly: boolean = false): void {
      shortcutsOnly = !!shortcutsOnly;
      notImplemented("public flash.system.ApplicationInstaller::install"); return;
    }
  }
}
