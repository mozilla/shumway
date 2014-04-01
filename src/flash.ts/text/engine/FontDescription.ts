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
// Class: FontDescription
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class FontDescription extends ASNative {
    static initializer: any = null;
    constructor (fontName: string = "_serif", fontWeight: string = "normal", fontPosture: string = "normal", fontLookup: string = "device", renderingMode: string = "cff", cffHinting: string = "horizontalStem") {
      fontName = "" + fontName; fontWeight = "" + fontWeight; fontPosture = "" + fontPosture; fontLookup = "" + fontLookup; renderingMode = "" + renderingMode; cffHinting = "" + cffHinting;
      false && super();
      notImplemented("Dummy Constructor: public flash.text.engine.FontDescription");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static isFontCompatible(fontName: string, fontWeight: string, fontPosture: string): boolean {
      fontName = "" + fontName; fontWeight = "" + fontWeight; fontPosture = "" + fontPosture;
      notImplemented("public flash.text.engine.FontDescription::static isFontCompatible"); return;
    }
    static isDeviceFontCompatible(fontName: string, fontWeight: string, fontPosture: string): boolean {
      fontName = "" + fontName; fontWeight = "" + fontWeight; fontPosture = "" + fontPosture;
      notImplemented("public flash.text.engine.FontDescription::static isDeviceFontCompatible"); return;
    }
    // Instance JS -> AS Bindings
    clone: () => flash.text.engine.FontDescription;
    // Instance AS -> JS Bindings
    get renderingMode(): string {
      notImplemented("public flash.text.engine.FontDescription::get renderingMode"); return;
    }
    set renderingMode(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.FontDescription::set renderingMode"); return;
    }
    get fontLookup(): string {
      notImplemented("public flash.text.engine.FontDescription::get fontLookup"); return;
    }
    set fontLookup(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.FontDescription::set fontLookup"); return;
    }
    get fontName(): string {
      notImplemented("public flash.text.engine.FontDescription::get fontName"); return;
    }
    set fontName(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.FontDescription::set fontName"); return;
    }
    get fontPosture(): string {
      notImplemented("public flash.text.engine.FontDescription::get fontPosture"); return;
    }
    set fontPosture(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.FontDescription::set fontPosture"); return;
    }
    get fontWeight(): string {
      notImplemented("public flash.text.engine.FontDescription::get fontWeight"); return;
    }
    set fontWeight(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.FontDescription::set fontWeight"); return;
    }
    get cffHinting(): string {
      notImplemented("public flash.text.engine.FontDescription::get cffHinting"); return;
    }
    set cffHinting(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.FontDescription::set cffHinting"); return;
    }
    get locked(): boolean {
      notImplemented("public flash.text.engine.FontDescription::get locked"); return;
    }
    set locked(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.engine.FontDescription::set locked"); return;
    }
  }
}
