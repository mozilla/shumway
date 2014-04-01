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
// Class: System
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class System extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.system.System");
    }
    // Static   JS -> AS Bindings
    static theIME: flash.system.IME;
    static totalMemory: number /*uint*/;
    // Static   AS -> JS Bindings
    get ime(): flash.system.IME {
      notImplemented("public flash.system.System::get ime"); return;
    }
    static setClipboard(string: string): void {
      string = "" + string;
      notImplemented("public flash.system.System::static setClipboard"); return;
    }
    get totalMemoryNumber(): number {
      notImplemented("public flash.system.System::get totalMemoryNumber"); return;
    }
    get freeMemory(): number {
      notImplemented("public flash.system.System::get freeMemory"); return;
    }
    get privateMemory(): number {
      notImplemented("public flash.system.System::get privateMemory"); return;
    }
    get processCPUUsage(): number {
      notImplemented("public flash.system.System::get processCPUUsage"); return;
    }
    get useCodePage(): boolean {
      notImplemented("public flash.system.System::get useCodePage"); return;
    }
    set useCodePage(value: boolean) {
      value = !!value;
      notImplemented("public flash.system.System::set useCodePage"); return;
    }
    get vmVersion(): string {
      notImplemented("public flash.system.System::get vmVersion"); return;
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
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }
}
