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
// Class: IME
module Shumway.AVMX.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class IME extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // ["isSupported"];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
    }
    
    // JS -> AS Bindings
    static isSupported: boolean;
    
    
    // AS -> JS Bindings
    // static _enabled: boolean;
    // static _conversionMode: string;
    // static _isSupported: boolean;
    get enabled(): boolean {
      release || notImplemented("public flash.system.IME::get enabled"); return;
      // return this._enabled;
    }
    set enabled(enabled: boolean) {
      enabled = !!enabled;
      release || notImplemented("public flash.system.IME::set enabled"); return;
      // this._enabled = enabled;
    }
    get conversionMode(): string {
      release || notImplemented("public flash.system.IME::get conversionMode"); return;
      // return this._conversionMode;
    }
    set conversionMode(mode: string) {
      mode = axCoerceString(mode);
      release || notImplemented("public flash.system.IME::set conversionMode"); return;
      // this._conversionMode = mode;
    }
    static setCompositionString(composition: string): void {
      composition = axCoerceString(composition);
      release || notImplemented("public flash.system.IME::static setCompositionString"); return;
    }
    static doConversion(): void {
      release || notImplemented("public flash.system.IME::static doConversion"); return;
    }
    static compositionSelectionChanged(start: number /*int*/, end: number /*int*/): void {
      start = start | 0; end = end | 0;
      release || notImplemented("public flash.system.IME::static compositionSelectionChanged"); return;
    }
    static compositionAbandoned(): void {
      release || notImplemented("public flash.system.IME::static compositionAbandoned"); return;
    }
    
  }
}
