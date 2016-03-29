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

module Shumway.AVMX.AS {

  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;

  export module flash.system {
    export class IME extends ASObject /* flash.events.EventDispatcher */ {
      constructor () {
        super();
      }
      static get enabled(): boolean {
        release || release || somewhatImplemented("public flash.system.IME::static get enabled");
        return false;
      }
      static set enabled(enabled: boolean) {
        release || release || somewhatImplemented("public flash.system.IME::static set enabled");
        enabled = !!enabled;
      }
      static get conversionMode(): string {
        release || somewhatImplemented("public flash.system.IME::static get conversionMode");
        return 'UNKNOWN';
      }
      static set conversionMode(mode: string) {
        mode = axCoerceString(mode);
        release || somewhatImplemented("public flash.system.IME::static set conversionMode");
      }
      static setCompositionString(composition: string): void {
        composition = axCoerceString(composition);
        release || somewhatImplemented("public flash.system.IME::static setCompositionString");
      }
      static doConversion(): void {
        release || somewhatImplemented("public flash.system.IME::static doConversion");
      }
      static compositionSelectionChanged(start: number /*int*/, end: number /*int*/): void {
        start = start | 0; end = end | 0;
        release || somewhatImplemented("public flash.system.IME::static compositionSelectionChanged");
      }
      static compositionAbandoned(): void {
        release || somewhatImplemented("public flash.system.IME::static compositionAbandoned");
      }
      static get isSupported(): boolean {
        release || somewhatImplemented("public flash.system.IME::static get isSupported");
        return false;
      }
    }

    export class System extends ASObject {
      private static _useCodePage: boolean = false;

      static classInitializer() {
        defineNonEnumerableProperty(this, '$Bgargv', this.sec.createArray([]));
      }

      static get ime(): flash.system.IME {
        release || somewhatImplemented("public flash.system.System::get ime");
        return null;
      }

      static setClipboard(string: string): void {
        string = axCoerceString(string);
        if (ClipboardService.instance === null) {
          Debug.warning('setClipboard is only available in the Firefox extension');
          return;
        }
        ClipboardService.instance.setClipboard(string);
      }

      static get totalMemoryNumber(): number {
        release || somewhatImplemented("public flash.system.System::get totalMemoryNumber");
        return 1024 * 1024 * 2;
      }

      static get freeMemory(): number {
        release || somewhatImplemented("public flash.system.System::get freeMemory");
        return 1024 * 1024;
      }

      static get privateMemory(): number {
        release || somewhatImplemented("public flash.system.System::get privateMemory");
        return 1024*1024;
      }

      static get useCodePage(): boolean {
        return this._useCodePage;
      }

      static set useCodePage(value: boolean) {
        release || somewhatImplemented("public flash.system.System::set useCodePage");
        this._useCodePage = !!value;
      }

      static get vmVersion(): string {
        return "1.0 Shumway - Mozilla Research";
      }

      static pause(): void {
        // Debugging-only function we can just ignore.
      }

      static resume(): void {
        // Debugging-only function we can just ignore.
      }

      static exit(code: number /*uint*/): void {
        // Debugging-only function we can just ignore.
      }

      static gc(): void {
        // Debugging-only function we can just ignore.
      }

      static pauseForGCIfCollectionImminent(imminence: number = 0.75): void {
        // Not gonna happen, probably ever.
      }

      static disposeXML(node: ASXML): void {
        // We have a cycle collector, so we can ignore this. \o/
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

// Do this here temporarily until we find a nicer place.
Shumway.AVMX.AS.initializeBuiltins();
