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
// Class: System
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class System extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // ["totalMemory"];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.system.System");
    }
    
    // JS -> AS Bindings
    static totalMemory: number /*uint*/;
    
    
    // AS -> JS Bindings
    // static _ime: flash.system.IME;
    // static _totalMemoryNumber: number;
    // static _freeMemory: number;
    // static _privateMemory: number;
    // static _processCPUUsage: number;
    // static _useCodePage: boolean;
    // static _vmVersion: string;
    // static _totalMemory: number /*uint*/;
    get ime(): flash.system.IME {
      notImplemented("public flash.system.System::get ime"); return;
      // return this._ime;
    }
    get totalMemoryNumber(): number {
      notImplemented("public flash.system.System::get totalMemoryNumber"); return;
      // return this._totalMemoryNumber;
    }
    get freeMemory(): number {
      notImplemented("public flash.system.System::get freeMemory"); return;
      // return this._freeMemory;
    }
    get privateMemory(): number {
      notImplemented("public flash.system.System::get privateMemory"); return;
      // return this._privateMemory;
    }
    get processCPUUsage(): number {
      notImplemented("public flash.system.System::get processCPUUsage"); return;
      // return this._processCPUUsage;
    }
    get useCodePage(): boolean {
      notImplemented("public flash.system.System::get useCodePage"); return;
      // return this._useCodePage;
    }
    set useCodePage(value: boolean) {
      value = !!value;
      notImplemented("public flash.system.System::set useCodePage"); return;
      // this._useCodePage = value;
    }
    get vmVersion(): string {
      notImplemented("public flash.system.System::get vmVersion"); return;
      // return this._vmVersion;
    }
    static setClipboard(string: string): void {
      string = asCoerceString(string);
      notImplemented("public flash.system.System::static setClipboard"); return;
    }
    static pause(): void {
      notImplemented("public flash.system.System::static pause"); return;
    }
    static resume(): void {
      notImplemented("public flash.system.System::static resume"); return;
    }
    static exit(code: number /*uint*/): void {
      code = code >>> 0;
      notImplemented("public flash.system.System::static exit"); return;
    }
    static gc(): void {
      notImplemented("public flash.system.System::static gc"); return;
    }
    static pauseForGCIfCollectionImminent(imminence: number = 0.75): void {
      imminence = +imminence;
      notImplemented("public flash.system.System::static pauseForGCIfCollectionImminent"); return;
    }
    static disposeXML(node: ASXML): void {
      node = node;
      notImplemented("public flash.system.System::static disposeXML"); return;
    }
    
  }
}
