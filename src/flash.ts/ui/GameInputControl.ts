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
// Class: GameInputControl
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GameInputControl extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.ui.GameInputControl");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get numValues(): number /*int*/ {
      notImplemented("public flash.ui.GameInputControl::get numValues"); return;
    }
    get index(): number /*int*/ {
      notImplemented("public flash.ui.GameInputControl::get index"); return;
    }
    getValueAt(index: number /*int*/ = 0): number {
      index = index | 0;
      notImplemented("public flash.ui.GameInputControl::getValueAt"); return;
    }
    get relative(): boolean {
      notImplemented("public flash.ui.GameInputControl::get relative"); return;
    }
    get type(): string {
      notImplemented("public flash.ui.GameInputControl::get type"); return;
    }
    get hand(): string {
      notImplemented("public flash.ui.GameInputControl::get hand"); return;
    }
    get finger(): string {
      notImplemented("public flash.ui.GameInputControl::get finger"); return;
    }
    get device(): flash.ui.GameInputDevice {
      notImplemented("public flash.ui.GameInputControl::get device"); return;
    }
  }
}
