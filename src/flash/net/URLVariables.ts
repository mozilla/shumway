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
// Class: URLVariables
module Shumway.AVMX.AS.flash.net {
  import axCoerceString = Shumway.AVMX.axCoerceString;

  declare var escape;
  declare var unescape;

  export class URLVariables extends ASObject {
    
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null;
    
    constructor (source: string = null) {
      super();
      this._ignoreDecodingErrors = false;
      source && this.decode(source);
    }

    _ignoreDecodingErrors: boolean;

    decode(source: string): void {
      source = axCoerceString(source);
      var variables = source.split('&');
      for (var i = 0; i < variables.length; i++) {
        var p = variables[i];
        var j = p.indexOf('=');
        if (j < 0) {
          if (this._ignoreDecodingErrors) {
            j = p.length;
          } else {
            this.sec.throwError('Error', Errors.DecodeParamError);
          }
        }
        var name = unescape(p.substring(0, j).split('+').join(' '));
        var value = unescape(p.substring(j + 1).split('+').join(' '));
        var currentValue = this.axGetPublicProperty(name);
        if (typeof currentValue === 'undefined') {
          this.axSetPublicProperty(name, value);
        } else if (Array.isArray(currentValue)) {
          currentValue.push(value);
        } else {
          this.axSetPublicProperty(name, [currentValue, value]);
        }
      }
    }

    toString(): string {
      var pairs = [];
      var keys = this.axGetEnumerableKeys();
      for (var i = 0; i < keys.length; i++) {
        var name = keys[i].split(' ').join('+');
        var value = this.axGetPublicProperty(name);
        name = escape(name).split(' ').join('+');
        if (Array.isArray(value)) {
          for (var j = 0; j < value.length; j++) {
            pairs.push(name + '=' + escape(value[j]));
          }
        } else {
          pairs.push(name + '=' + escape(value));
        }
      }
      return pairs.join('&');
    }
  }
}
