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
// Class: ContextMenu
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class ContextMenu extends flash.display.NativeMenu {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // ["isSupported"];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["hideBuiltInItems", "clone"];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.ui.ContextMenu");
    }
    
    // JS -> AS Bindings
    static isSupported: boolean;
    
    hideBuiltInItems: () => void;
    clone: () => flash.ui.ContextMenu;
    
    // AS -> JS Bindings
    // static _isSupported: boolean;
    
    // _builtInItems: flash.ui.ContextMenuBuiltInItems;
    // _customItems: any [];
    // _link: flash.net.URLRequest;
    // _clipboardMenu: boolean;
    // _clipboardItems: flash.ui.ContextMenuClipboardItems;
    get builtInItems(): flash.ui.ContextMenuBuiltInItems {
      notImplemented("public flash.ui.ContextMenu::get builtInItems"); return;
      // return this._builtInItems;
    }
    set builtInItems(value: flash.ui.ContextMenuBuiltInItems) {
      value = value;
      notImplemented("public flash.ui.ContextMenu::set builtInItems"); return;
      // this._builtInItems = value;
    }
    get customItems(): any [] {
      notImplemented("public flash.ui.ContextMenu::get customItems"); return;
      // return this._customItems;
    }
    set customItems(value: any []) {
      value = value;
      notImplemented("public flash.ui.ContextMenu::set customItems"); return;
      // this._customItems = value;
    }
    get link(): flash.net.URLRequest {
      notImplemented("public flash.ui.ContextMenu::get link"); return;
      // return this._link;
    }
    set link(value: flash.net.URLRequest) {
      value = value;
      notImplemented("public flash.ui.ContextMenu::set link"); return;
      // this._link = value;
    }
    get clipboardMenu(): boolean {
      notImplemented("public flash.ui.ContextMenu::get clipboardMenu"); return;
      // return this._clipboardMenu;
    }
    set clipboardMenu(value: boolean) {
      value = !!value;
      notImplemented("public flash.ui.ContextMenu::set clipboardMenu"); return;
      // this._clipboardMenu = value;
    }
    get clipboardItems(): flash.ui.ContextMenuClipboardItems {
      notImplemented("public flash.ui.ContextMenu::get clipboardItems"); return;
      // return this._clipboardItems;
    }
    set clipboardItems(value: flash.ui.ContextMenuClipboardItems) {
      value = value;
      notImplemented("public flash.ui.ContextMenu::set clipboardItems"); return;
      // this._clipboardItems = value;
    }
    cloneLinkAndClipboardProperties(c: flash.ui.ContextMenu): void {
      c = c;
      notImplemented("public flash.ui.ContextMenu::cloneLinkAndClipboardProperties"); return;
    }
  }
}
