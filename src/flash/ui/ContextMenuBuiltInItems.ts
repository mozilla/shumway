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
// Class: ContextMenuBuiltInItems
module Shumway.AVMX.AS.flash.ui {
  export class ContextMenuBuiltInItems extends ASObject {
    
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null;
    
    constructor () {
      super();

      this._save = true;
      this._zoom = true;
      this._quality = true;
      this._play = true;
      this._loop = true;
      this._rewind = true;
      this._forwardAndBack = true;
      this._print = true;
    }

    private _save: boolean;
    private _zoom: boolean;
    private _quality: boolean;
    private _play: boolean;
    private _loop: boolean;
    private _rewind: boolean;
    private _forwardAndBack: boolean;
    private _print: boolean;

    get save(): boolean {
      return this._save;
    }
    set save(val: boolean) {
      this._save = !!val;
    }
    get zoom(): boolean {
      return this._zoom;
    }
    set zoom(val: boolean) {
      this._zoom = !!val;
    }
    get quality(): boolean {
      return this._quality;
    }
    set quality(val: boolean) {
      this._quality = !!val;
    }
    get play(): boolean {
      return this._play;
    }
    set play(val: boolean) {
      this._play = !!val;
    }
    get loop(): boolean {
      return this._loop;
    }
    set loop(val: boolean) {
      this._loop = !!val;
    }
    get rewind(): boolean {
      return this._rewind;
    }
    set rewind(val: boolean) {
      this._rewind = !!val;
    }
    get forwardAndBack(): boolean {
      return this._forwardAndBack;
    }
    set forwardAndBack(val: boolean) {
      this._forwardAndBack = !!val;
    }
    get print(): boolean {
      return this._print;
    }
    set print(val: boolean) {
      this._print = !!val;
    }

    clone(): ContextMenuBuiltInItems {
      var items = new ui.ContextMenuBuiltInItems();
      items._save = this._save;
      items._zoom = this._zoom;
      items._quality = this._quality;
      items._play = this._play;
      items._loop = this._loop;
      items._rewind = this._rewind;
      items._forwardAndBack = this._forwardAndBack;
      items._print = this._print;
      return items;
    }
  }
}
