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
// Class: ContextMenuClipboardItems
module Shumway.AVM2.AS.flash.ui {
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  export class ContextMenuClipboardItems extends ASNative {
    
    static classInitializer: any = null;
    static initializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null;
    
    constructor () {
      false && super();

      this._cut = true;
      this._copy = true;
      this._paste = true;
      this._clear = true;
      this._selectAll = true;
    }

    _cut: boolean;
    _copy: boolean;
    _paste: boolean;
    _clear: boolean;
    _selectAll: boolean;


    get cut(): boolean {
      somewhatImplemented("cut");
      return this._cut;
    }
    set cut(val: boolean) {
      somewhatImplemented("cut");
      this._cut = !!val;
    }
    get copy(): boolean {
      somewhatImplemented("copy");
      return this._copy;
    }
    set copy(val: boolean) {
      somewhatImplemented("copy");
      this._copy = !!val;
    }
    get paste(): boolean {
      somewhatImplemented("paste");
      return this._paste;
    }
    set paste(val: boolean) {
      somewhatImplemented("paste");
      this._paste = !!val;
    }
    get clear(): boolean {
      somewhatImplemented("clear");
      return this._clear;
    }
    set clear(val: boolean) {
      somewhatImplemented("clear");
      this._clear = !!val;
    }
    get selectAll(): boolean {
      somewhatImplemented("selectAll");
      return this._selectAll;
    }
    set selectAll(val: boolean) {
      somewhatImplemented("selectAll");
      this._selectAll = !!val;
    }
    clone(): ContextMenuClipboardItems {
      var items = new ui.ContextMenuClipboardItems();
      items._cut = this._cut;
      items._copy = this._copy;
      items._paste = this._paste;
      items._clear = this._clear;
      items._selectAll = this._selectAll;
      return items;
    }
  }
}
