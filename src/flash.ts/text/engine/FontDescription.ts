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
// Class: FontDescription
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class FontDescription extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["clone"];
    
    constructor (fontName: string = "_serif", fontWeight: string = "normal", fontPosture: string = "normal", fontLookup: string = "device", renderingMode: string = "cff", cffHinting: string = "horizontalStem") {
      fontName = asCoerceString(fontName); fontWeight = asCoerceString(fontWeight); fontPosture = asCoerceString(fontPosture); fontLookup = asCoerceString(fontLookup); renderingMode = asCoerceString(renderingMode); cffHinting = asCoerceString(cffHinting);
      false && super();
      notImplemented("Dummy Constructor: public flash.text.engine.FontDescription");
    }
    
    // JS -> AS Bindings
    
    clone: () => flash.text.engine.FontDescription;
    
    // AS -> JS Bindings
    static isFontCompatible(fontName: string, fontWeight: string, fontPosture: string): boolean {
      fontName = asCoerceString(fontName); fontWeight = asCoerceString(fontWeight); fontPosture = asCoerceString(fontPosture);
      notImplemented("public flash.text.engine.FontDescription::static isFontCompatible"); return;
    }
    static isDeviceFontCompatible(fontName: string, fontWeight: string, fontPosture: string): boolean {
      fontName = asCoerceString(fontName); fontWeight = asCoerceString(fontWeight); fontPosture = asCoerceString(fontPosture);
      notImplemented("public flash.text.engine.FontDescription::static isDeviceFontCompatible"); return;
    }
    
    // _renderingMode: string;
    // _fontLookup: string;
    // _fontName: string;
    // _fontPosture: string;
    // _fontWeight: string;
    // _cffHinting: string;
    // _locked: boolean;
    get renderingMode(): string {
      notImplemented("public flash.text.engine.FontDescription::get renderingMode"); return;
      // return this._renderingMode;
    }
    set renderingMode(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.text.engine.FontDescription::set renderingMode"); return;
      // this._renderingMode = value;
    }
    get fontLookup(): string {
      notImplemented("public flash.text.engine.FontDescription::get fontLookup"); return;
      // return this._fontLookup;
    }
    set fontLookup(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.text.engine.FontDescription::set fontLookup"); return;
      // this._fontLookup = value;
    }
    get fontName(): string {
      notImplemented("public flash.text.engine.FontDescription::get fontName"); return;
      // return this._fontName;
    }
    set fontName(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.text.engine.FontDescription::set fontName"); return;
      // this._fontName = value;
    }
    get fontPosture(): string {
      notImplemented("public flash.text.engine.FontDescription::get fontPosture"); return;
      // return this._fontPosture;
    }
    set fontPosture(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.text.engine.FontDescription::set fontPosture"); return;
      // this._fontPosture = value;
    }
    get fontWeight(): string {
      notImplemented("public flash.text.engine.FontDescription::get fontWeight"); return;
      // return this._fontWeight;
    }
    set fontWeight(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.text.engine.FontDescription::set fontWeight"); return;
      // this._fontWeight = value;
    }
    get cffHinting(): string {
      notImplemented("public flash.text.engine.FontDescription::get cffHinting"); return;
      // return this._cffHinting;
    }
    set cffHinting(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.text.engine.FontDescription::set cffHinting"); return;
      // this._cffHinting = value;
    }
    get locked(): boolean {
      notImplemented("public flash.text.engine.FontDescription::get locked"); return;
      // return this._locked;
    }
    set locked(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.engine.FontDescription::set locked"); return;
      // this._locked = value;
    }
  }
}
