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
// Class: IME
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class IME extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // ["isSupported"];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.system.IME");
    }
    
    // JS -> AS Bindings
    static isSupported: boolean;
    
    
    // AS -> JS Bindings
    // static _enabled: boolean;
    // static _conversionMode: string;
    // static _isSupported: boolean;
    get enabled(): boolean {
      notImplemented("public flash.system.IME::get enabled"); return;
      // return this._enabled;
    }
    set enabled(enabled: boolean) {
      enabled = !!enabled;
      notImplemented("public flash.system.IME::set enabled"); return;
      // this._enabled = enabled;
    }
    get conversionMode(): string {
      notImplemented("public flash.system.IME::get conversionMode"); return;
      // return this._conversionMode;
    }
    set conversionMode(mode: string) {
      mode = "" + mode;
      notImplemented("public flash.system.IME::set conversionMode"); return;
      // this._conversionMode = mode;
    }
    static setCompositionString(composition: string): void {
      composition = "" + composition;
      notImplemented("public flash.system.IME::static setCompositionString"); return;
    }
    static doConversion(): void {
      notImplemented("public flash.system.IME::static doConversion"); return;
    }
    static compositionSelectionChanged(start: number /*int*/, end: number /*int*/): void {
      start = start | 0; end = end | 0;
      notImplemented("public flash.system.IME::static compositionSelectionChanged"); return;
    }
    static compositionAbandoned(): void {
      notImplemented("public flash.system.IME::static compositionAbandoned"); return;
    }
    
  }
}
