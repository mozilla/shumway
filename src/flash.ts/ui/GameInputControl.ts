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
// Class: GameInputControl
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class GameInputControl extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.ui.GameInputControl");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _numValues: number /*int*/;
    // _index: number /*int*/;
    // _relative: boolean;
    // _type: string;
    // _hand: string;
    // _finger: string;
    // _device: flash.ui.GameInputDevice;
    get numValues(): number /*int*/ {
      notImplemented("public flash.ui.GameInputControl::get numValues"); return;
      // return this._numValues;
    }
    get index(): number /*int*/ {
      notImplemented("public flash.ui.GameInputControl::get index"); return;
      // return this._index;
    }
    get relative(): boolean {
      notImplemented("public flash.ui.GameInputControl::get relative"); return;
      // return this._relative;
    }
    get type(): string {
      notImplemented("public flash.ui.GameInputControl::get type"); return;
      // return this._type;
    }
    get hand(): string {
      notImplemented("public flash.ui.GameInputControl::get hand"); return;
      // return this._hand;
    }
    get finger(): string {
      notImplemented("public flash.ui.GameInputControl::get finger"); return;
      // return this._finger;
    }
    get device(): flash.ui.GameInputDevice {
      notImplemented("public flash.ui.GameInputControl::get device"); return;
      // return this._device;
    }
    getValueAt(index: number /*int*/ = 0): number {
      index = index | 0;
      notImplemented("public flash.ui.GameInputControl::getValueAt"); return;
    }
  }
}
