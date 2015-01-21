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
// Class: StyleSheet
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  export interface Style {
    color?: string;
    display?: string;
    fontFamily?: string;
    fontSize?: any; // number | string
    fontStyle?: string;
    fontWeight?: string;
    kerning?: any; // number | string
    leading?: any; // number | string
    letterSpacing?: any; // number | string
    marginLeft?: any; // number | string
    marginRight?: any; // number | string
    textAlign?: string;
    textDecoration?: string;
    textIndent?: any; // number | string
  }

  export class StyleSheet extends flash.events.EventDispatcher {
    static classInitializer: any = null;
    static initializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;
    
    constructor () {
      false && super();
      flash.events.EventDispatcher.instanceConstructorNoInitialize.call(this);
      this.clear();
    }

    private _rules: { [key: string]: Style; };

    get styleNames(): string[] {
      var styles = this._rules;
      var names = [];
      for (var name in styles) {
        if (styles[name]) {
          names.push(name);
        }
      }
      return names;
    }

    getStyle(styleName: string): Style {
      styleName = asCoerceString(styleName);
      var style = this._rules[styleName.toLowerCase()];
      if (!style) {
        return null;
      }
      return ASJSON.transformJSValueToAS(style, false);
    }

    applyStyle(textFormat: TextFormat, styleName: string): TextFormat {
      styleName = asCoerceString(styleName);
      var style = this._rules[styleName.toLowerCase()];
      if (style) {
        return textFormat.transform(style);
      }
      return textFormat;
    }

    setStyle(styleName: string, styleObject: Style) {
      if (typeof styleObject !== 'object') {
        return;
      }
      styleName = asCoerceString(styleName);
      this._rules[styleName.toLowerCase()] = ASJSON.transformASValueToJS(styleObject, false);
    }

    hasStyle(styleName: string): boolean {
      return !!this._rules[styleName.toLowerCase()];
    }

    clear() {
      this._rules = Object.create(null);
    }

    transform(formatObject: ASObject): TextFormat {
      if (typeof formatObject !== 'object') {
        return null;
      }
      formatObject = ASJSON.transformASValueToJS(formatObject, false);
      var textFormat = new TextFormat();
      textFormat.transform(formatObject);
      return textFormat;
    }

    parseCSS(CSSText: string) {
      notImplemented("public flash.text.StyleSheet::parseCSS");
    }
  }
}
