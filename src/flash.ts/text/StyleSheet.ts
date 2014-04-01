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
// Class: StyleSheet
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  export class StyleSheet extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.text.StyleSheet");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    getStyle: (styleName: string) => ASObject;
    setStyle: (styleName: string, styleObject: ASObject) => void;
    clear: () => void;
    styleNames: any [];
    transform: (formatObject: ASObject) => flash.text.TextFormat;
    parseCSS: (CSSText: string) => void;
    _css: ASObject;
    doTransform: (n: string) => void;
    _copy: (o: ASObject) => ASObject;
    // Instance AS -> JS Bindings
    get _styles(): ASObject {
      notImplemented("public flash.text.StyleSheet::get _styles"); return;
    }
    set _styles(styles: ASObject) {
      styles = styles;
      notImplemented("public flash.text.StyleSheet::set _styles"); return;
    }
    _update(): void {
      notImplemented("public flash.text.StyleSheet::_update"); return;
    }
    _parseCSSInternal(cssText: string): ASObject {
      cssText = "" + cssText;
      notImplemented("public flash.text.StyleSheet::_parseCSSInternal"); return;
    }
    _parseCSSFontFamily(fontFamily: string): string {
      fontFamily = "" + fontFamily;
      notImplemented("public flash.text.StyleSheet::_parseCSSFontFamily"); return;
    }
    _parseColor(color: string): number /*uint*/ {
      color = "" + color;
      notImplemented("public flash.text.StyleSheet::_parseColor"); return;
    }
  }
}
