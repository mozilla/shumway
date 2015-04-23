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
// Class: KeyboardEvent
module Shumway.AVM2.AS.flash.events {
  import dummyConstructor = Shumway.Debug.dummyConstructor;

  export class KeyboardEvent extends flash.events.Event {

    static classInitializer: any = null;
    static initializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor(type: string, bubbles: boolean = true, cancelable: boolean = false,
                charCodeValue: number /*uint*/ = 0, keyCodeValue: number /*uint*/ = 0,
                keyLocationValue: number /*uint*/ = 0, ctrlKeyValue: boolean = false,
                altKeyValue: boolean = false, shiftKeyValue: boolean = false) {
      super(undefined, undefined, undefined);
      dummyConstructor("public flash.events.KeyboardEvent");
    }

    static KEY_DOWN: string = "keyDown";
    static KEY_UP: string = "keyUp";

    private _charCode: number;
    private _keyCode: number;
    private _keyLocation: number;
    private _ctrlKey: boolean;
    private _altKey: boolean;
    private _shiftKey: boolean;

    get charCode(): number {
      return this._charCode;
    }
    set charCode(value: number) {
      this._charCode = value;
    }
    get keyCode(): number {
      return this._keyCode;
    }
    set keyCode(value: number) {
      this._keyCode = value;
    }
    get keyLocation(): number {
      return this._keyLocation;
    }
    set keyLocation(value: number) {
      this._keyLocation = value;
    }
    get ctrlKey(): boolean {
      return this._ctrlKey;
    }
    set ctrlKey(value: boolean) {
      this._ctrlKey = value;
    }
    get altKey(): boolean {
      return this._altKey;
    }
    set altKey(value: boolean) {
      this._altKey = value;
    }
    get shiftKey(): boolean {
      return this._shiftKey;
    }
    set shiftKey(value: boolean) {
      this._shiftKey = value;
    }

    clone(): Event {
      return new events.KeyboardEvent(this.type, this.bubbles, this.cancelable, this.charCode,
                                      this.keyCode, this.keyLocation, this.ctrlKey, this.altKey,
                                      this.shiftKey);
    }

    toString(): string {
      return this.formatToString('KeyboardEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                                 'charCode', 'keyCode', 'keyLocation', 'ctrlKey', 'altKey',
                                 'shiftKey');
    }

    updateAfterEvent(): void {
      Shumway.AVM2.Runtime.AVM2.instance.globals['Shumway.Player.Utils'].requestRendering();
    }
  }
}
