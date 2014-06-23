/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
///<reference path='../references.ts' />

module Shumway.AVM2.AS {
  import assertNotImplemented = Shumway.Debug.assertNotImplemented;
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  export module flash.system {
    export class IME extends ASNative /* flash.events.EventDispatcher */ {
      constructor () {
        false && super();
      }
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
        mode = asCoerceString(mode);
        notImplemented("public flash.system.IME::set conversionMode"); return;
      }
      static setCompositionString(composition: string): void {
        composition = asCoerceString(composition);
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
    }

    export class System extends ASNative {
      static get ime(): flash.system.IME {
        notImplemented("public flash.system.System::get ime"); return;
      }

      static setClipboard(string: string): void {
        string = asCoerceString(string);
        notImplemented("public flash.system.System::static setClipboard"); return;
      }

      static get totalMemoryNumber(): number {
        // notImplemented("public flash.system.System::get totalMemoryNumber"); return;
        return 1024 * 1024 * 2;
      }

      static get freeMemory(): number {
        // notImplemented("public flash.system.System::get freeMemory"); return;
        return 1024 * 1024;
      }

      static get privateMemory(): number {
        notImplemented("public flash.system.System::get privateMemory"); return;
      }

      static get processCPUUsage(): number {
        notImplemented("public flash.system.System::get processCPUUsage"); return;
      }

      static get useCodePage(): boolean {
        notImplemented("public flash.system.System::get useCodePage"); return;
      }

      static set useCodePage(value: boolean) {
        value = !!value;
        notImplemented("public flash.system.System::set useCodePage"); return;
      }

      static get vmVersion(): string {
        return "1.0 Shumway - Mozilla Research";
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

      static get swfVersion(): number {
        return 19;
      }

      static get apiVersion(): number {
        return 26;
      }

      static getArgv(): any [] {
        return [];
      }

      static getRunmode(): string {
        return "mixed";
      }
    }
    export var OriginalSystem = System;
  }
}
