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
// Class: ContextMenuEvent
module Shumway.AVMX.AS.flash.events {
  export class ContextMenuEvent extends flash.events.Event {

    static classInitializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    mouseTarget: flash.display.InteractiveObject;
    contextMenuOwner: flash.display.InteractiveObject;

    constructor(type: string, bubbles: boolean = false, cancelable: boolean = false,
                mouseTarget: flash.display.InteractiveObject = null,
                contextMenuOwner: flash.display.InteractiveObject = null) {
      super(type, bubbles, cancelable);
      // TODO: coerce
      this.mouseTarget = mouseTarget;
      this.contextMenuOwner = contextMenuOwner;
    }

    // JS -> AS Bindings
    static MENU_ITEM_SELECT: string = "menuItemSelect";
    static MENU_SELECT: string = "menuSelect";
  }
}
