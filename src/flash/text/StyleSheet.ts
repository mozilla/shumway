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
module Shumway.AVMX.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import assert = Debug.assert;

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
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;
    
    constructor () {
      super();
      this.clear();
    }

    private _rules: { [key: string]: Style; };

    get styleNames(): ASArray {
      var styles = this._rules;
      var names = [];
      for (var name in styles) {
        if (styles[name]) {
          names.push(name);
        }
      }
      return this.sec.createArrayUnsafe(names);
    }

    getStyle(styleName: string): Style {
      styleName = axCoerceString(styleName);
      var style = this._rules[styleName.toLowerCase()];
      if (!style) {
        return this.sec.createObject(); // note that documentation is lying about `null`;
      }
      return transformJSValueToAS(this.sec, style, false);
    }

    applyStyle(textFormat: TextFormat, styleName: string): TextFormat {
      styleName = axCoerceString(styleName);
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
      styleName = axCoerceString(styleName);
      this._rules[styleName.toLowerCase()] = transformASValueToJS(this.sec, styleObject, false);
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
      formatObject = transformASValueToJS(this.sec, formatObject, false);
      var textFormat = new this.sec.flash.text.TextFormat();
      textFormat.transform(formatObject);
      return textFormat;
    }

    parseCSS(css: string) {
      css = axCoerceString(css) + '';
      var length = css.length;
      var index = skipWhitespace(css, 0, length);
      // Styles are only added once parsing completed successfully. Invalid syntax anywhere discards all new styles.
      var newStyles = {};
      var currentNames = [];
      var sawWhitespace = false;
      var name = '';
      while (index < length) {
        var char = css[index++];
        // Everything except whitespace, command, and '{' is valid in names.
        // Note: if no name is given, the empty string is used.
        switch (char) {
          case '{':
            sawWhitespace = false;
            currentNames.push(name);
            // parse style.
            index = parseStyle(css, index, length, currentNames, newStyles);
            if (index === -1) {
              // Syntax error encountered in style parsing.
              return;
            } else if (!release) {
              assert(css[index - 1] === '}');
            }
            currentNames = [];
            name = '';
            index = skipWhitespace(css, index, length);
            break;
          case ',':
            sawWhitespace = false;
            currentNames.push(name);
            name = '';
            index = skipWhitespace(css, index, length);
            break;
          case ' ':
          case '\n':
          case '\r':
          case '\t':
            sawWhitespace = true;
            index = skipWhitespace(css, index, length);
            break;
          default:
            if (sawWhitespace) {
              return;
            }
            name += char;
        }
      }
      var styles = this._rules;
      for (name in newStyles) {
        styles[name.toLowerCase()] = newStyles[name];
      }
    }
  }


  function parseStyle(css: string, index: number, length: number, names: string[], newStyles: any) {
    release || assert(index > 0);
    release || assert(css[index - 1] === '{');
    var style = {};
    var name = '';
    var sawWhitespace = false;
    var upperCase = false;
    index = skipWhitespace(css, index, length);
    // Outer loop parsing property names.
    nameLoop: while (index < length) {
      var char = css[index++];
      switch (char) {
        case '}':
          if (name.length > 0) {
            return -1;
          }
          break nameLoop;
        case ':':
          var value = '';
          var propertyName = name;
          // Reset outer-loop state.
          name = '';
          sawWhitespace = false;
          upperCase = false;
          // Inner loop parsing property values.
          valueLoop: while (index < length) {
            char = css[index];
            switch (char) {
              case ';':
              case '\r':
              case '\n':
                index++;
                index = skipWhitespace(css, index, length);
              // Fallthrough.
              case '}':
                style[propertyName] = value;
                continue nameLoop;
              default:
                index++;
                value += char;
            }
          }
          // If we got here, the inner loop ended by exhausting the string, so the definition
          // wasn't properly closed.
          return -1;
        case '-':
          if (css[index] === ':') {
            name += char;
          } else {
            upperCase = true;
          }
          break;
        case ' ':
        case '\n':
        case '\r':
        case '\t':
          sawWhitespace = true;
          name += char;
          upperCase = false;
          break;
        default:
          // Names that're interrupted by whitespace are invalid.
          if (sawWhitespace) {
            return -1;
          }
          if (upperCase) {
            char = char.toUpperCase();
            upperCase = false;
          }
          name += char;
      }
    }
    if (css[index - 1] !== '}') {
      return -1;
    }
    for (var i = 0; i < names.length; i++) {
      newStyles[names[i]] = style;
    }
    return index;
  }

  function skipWhitespace(css: string, index: number, length: number) {
    while (index < length) {
      var char = css[index];
      switch (char) {
        case ' ':
        case '\n':
        case '\r':
        case '\t':
          index++;
          break;
        default:
          return index;
      }
    }
    release || assert(index === length);
    return length;
  }
}
