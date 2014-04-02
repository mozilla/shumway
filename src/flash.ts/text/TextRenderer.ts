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
// Class: TextRenderer
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TextRenderer extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.text.TextRenderer");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    // static _antiAliasType: string;
    // static _maxLevel: number /*int*/;
    // static _displayMode: string;
    get antiAliasType(): string {
      notImplemented("public flash.text.TextRenderer::get antiAliasType"); return;
      // return this._antiAliasType;
    }
    set antiAliasType(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextRenderer::set antiAliasType"); return;
      // this._antiAliasType = value;
    }
    get maxLevel(): number /*int*/ {
      notImplemented("public flash.text.TextRenderer::get maxLevel"); return;
      // return this._maxLevel;
    }
    set maxLevel(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.text.TextRenderer::set maxLevel"); return;
      // this._maxLevel = value;
    }
    get displayMode(): string {
      notImplemented("public flash.text.TextRenderer::get displayMode"); return;
      // return this._displayMode;
    }
    set displayMode(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextRenderer::set displayMode"); return;
      // this._displayMode = value;
    }
    static setAdvancedAntiAliasingTable(fontName: string, fontStyle: string, colorType: string, advancedAntiAliasingTable: any []): void {
      fontName = "" + fontName; fontStyle = "" + fontStyle; colorType = "" + colorType; advancedAntiAliasingTable = advancedAntiAliasingTable;
      notImplemented("public flash.text.TextRenderer::static setAdvancedAntiAliasingTable"); return;
    }
    
  }
}
