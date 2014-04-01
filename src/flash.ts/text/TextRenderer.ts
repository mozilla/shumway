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
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.text.TextRenderer");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    get antiAliasType(): string {
      notImplemented("public flash.text.TextRenderer::get antiAliasType"); return;
    }
    set antiAliasType(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextRenderer::set antiAliasType"); return;
    }
    static setAdvancedAntiAliasingTable(fontName: string, fontStyle: string, colorType: string, advancedAntiAliasingTable: any []): void {
      fontName = "" + fontName; fontStyle = "" + fontStyle; colorType = "" + colorType; advancedAntiAliasingTable = advancedAntiAliasingTable;
      notImplemented("public flash.text.TextRenderer::static setAdvancedAntiAliasingTable"); return;
    }
    get maxLevel(): number /*int*/ {
      notImplemented("public flash.text.TextRenderer::get maxLevel"); return;
    }
    set maxLevel(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.text.TextRenderer::set maxLevel"); return;
    }
    get displayMode(): string {
      notImplemented("public flash.text.TextRenderer::get displayMode"); return;
    }
    set displayMode(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextRenderer::set displayMode"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }
}
