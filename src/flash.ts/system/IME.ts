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
// Class: IME
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class IME extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.system.IME");
    }
    // Static   JS -> AS Bindings
    static isSupported: boolean;
    // Static   AS -> JS Bindings
    get enabled(): boolean {
      notImplemented("public flash.system.IME::get enabled"); return;
    }
    set enabled(enabled: boolean) {
      enabled = !!enabled;
      notImplemented("public flash.system.IME::set enabled"); return;
    }
    get conversionMode(): string {
      notImplemented("public flash.system.IME::get conversionMode"); return;
    }
    set conversionMode(mode: string) {
      mode = "" + mode;
      notImplemented("public flash.system.IME::set conversionMode"); return;
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
    static _checkSupported(): boolean {
      notImplemented("public flash.system.IME::static _checkSupported"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }
}
