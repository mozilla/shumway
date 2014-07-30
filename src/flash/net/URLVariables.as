/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package flash.net {
import flash.utils.escapeMultiByte;
import flash.utils.unescapeMultiByte;

[native(cls='URLVariablesClass')]
public dynamic class URLVariables {
  public function URLVariables(source:String = null) {
    if (source) {
      decode(source);
    }
  }
  public function decode(source:String):void {
    var variables: Array = source.split('&');
    for (var i: int = 0; i < variables.length; i++) {
      var p: String = variables[i];
      var j:int = p.indexOf('=');
      if (j < 0) {
        Error.throwError(Error, 2101); // Errors.DecodeParamError
        return;
      }
      var name: String = unescape(p.substring(0, j));
      var value: String = unescape(p.substring(j + 1));
      if (typeof this[name] == 'undefined') {
        this[name] = value;
      } else if (this[name] is Array) {
        this[name].push(value);
      } else {
        this[name] = [this[name], value];
      }
    }
  }
  public function toString():String {
    var pairs:Array = [];
    for (var name: String in this) {
      if (this[name] is Array) {
        for each (var value:String in this[name]) {
          pairs.push(escape(name) + '=' + escape(value));
        }
      } else {
        pairs.push(escape(name) + '=' + escape(this[name]));
      }
    }
    return pairs.join('&');
  }
  private function unescape(s: String): String {
    return s && unescapeMultiByte(s.split('+').join(' '));
  }
  private function escape(s: String): String {
    return s && escapeMultiByte(s).split(' ').join('+');
  }
}
}
