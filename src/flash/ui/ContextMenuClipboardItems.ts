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
module Shumway.AVMX.AS.flash.ui {
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  export class ContextMenuClipboardItems extends ASObject {
    
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null;
    
    constructor () {
      super();

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
      release || somewhatImplemented("cut");
      return this._cut;
    }
    set cut(val: boolean) {
      release || somewhatImplemented("cut");
      this._cut = !!val;
    }
    get copy(): boolean {
      release || somewhatImplemented("copy");
      return this._copy;
    }
    set copy(val: boolean) {
      release || somewhatImplemented("copy");
      this._copy = !!val;
    }
    get paste(): boolean {
      release || somewhatImplemented("paste");
      return this._paste;
    }
    set paste(val: boolean) {
      release || somewhatImplemented("paste");
      this._paste = !!val;
    }
    get clear(): boolean {
      release || somewhatImplemented("clear");
      return this._clear;
    }
    set clear(val: boolean) {
      release || somewhatImplemented("clear");
      this._clear = !!val;
    }
    get selectAll(): boolean {
      release || somewhatImplemented("selectAll");
      return this._selectAll;
    }
    set selectAll(val: boolean) {
      release || somewhatImplemented("selectAll");
      this._selectAll = !!val;
    }
    clone(): ContextMenuClipboardItems {
      var items = new this.sec.flash.ui.ContextMenuClipboardItems();
      items._cut = this._cut;
      items._copy = this._copy;
      items._paste = this._paste;
      items._clear = this._clear;
      items._selectAll = this._selectAll;
      return items;
    }
  }
}
