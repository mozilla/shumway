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
// Class: ContextMenu
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ContextMenu extends flash.display.NativeMenu {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.ui.ContextMenu");
    }
    // Static   JS -> AS Bindings
    static isSupported: boolean;
    // Static   AS -> JS Bindings
    static _checkSupported(): boolean {
      notImplemented("public flash.ui.ContextMenu::static _checkSupported"); return;
    }
    // Instance JS -> AS Bindings
    hideBuiltInItems: () => void;
    clone: () => flash.ui.ContextMenu;
    // Instance AS -> JS Bindings
    get builtInItems(): flash.ui.ContextMenuBuiltInItems {
      notImplemented("public flash.ui.ContextMenu::get builtInItems"); return;
    }
    set builtInItems(value: flash.ui.ContextMenuBuiltInItems) {
      value = value;
      notImplemented("public flash.ui.ContextMenu::set builtInItems"); return;
    }
    get customItems(): any [] {
      notImplemented("public flash.ui.ContextMenu::get customItems"); return;
    }
    set customItems(value: any []) {
      value = value;
      notImplemented("public flash.ui.ContextMenu::set customItems"); return;
    }
    get link(): flash.net.URLRequest {
      notImplemented("public flash.ui.ContextMenu::get link"); return;
    }
    set link(value: flash.net.URLRequest) {
      value = value;
      notImplemented("public flash.ui.ContextMenu::set link"); return;
    }
    get clipboardMenu(): boolean {
      notImplemented("public flash.ui.ContextMenu::get clipboardMenu"); return;
    }
    set clipboardMenu(value: boolean) {
      value = !!value;
      notImplemented("public flash.ui.ContextMenu::set clipboardMenu"); return;
    }
    get clipboardItems(): flash.ui.ContextMenuClipboardItems {
      notImplemented("public flash.ui.ContextMenu::get clipboardItems"); return;
    }
    set clipboardItems(value: flash.ui.ContextMenuClipboardItems) {
      value = value;
      notImplemented("public flash.ui.ContextMenu::set clipboardItems"); return;
    }
    cloneLinkAndClipboardProperties(c: flash.ui.ContextMenu): void {
      c = c;
      notImplemented("public flash.ui.ContextMenu::cloneLinkAndClipboardProperties"); return;
    }
  }
}
