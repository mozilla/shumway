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

package flash.text.engine {
import flash.utils.getQualifiedClassName;

[native(cls='TextJustifierClass')]
public class TextJustifier {
  public static function getJustifierForLocale(locale: String): TextJustifier {
    if (!locale || locale.length < 2) {
      Error.throwError(ArgumentError, 2004, "previousLine");
    }

    var base: String = locale.substr(0, 2);
    // So, weird things are going on here: in this class, and only in this class, the compiler
    // is of the opinion that the EastAsianJustifier and SpaceJustifier ctors must only be called
    // without any arguments. It's quite adamant about this, so we have to trick it into behaving.
    var justifierClass: Class;
    if (base == 'ja' || base == 'ko' || base === 'zh') {
      justifierClass = EastAsianJustifier;
    } else {
      justifierClass = SpaceJustifier;
    }
    return new justifierClass(locale);
  }
  public function TextJustifier(locale: String, lineJustification: String) {
    if (getQualifiedClassName(this) === 'flash.text.engine::TextJustifier') {
      Error.throwError(ArgumentError, 2012, "TextJustifier");
    }

    setLocale(locale);
    this.lineJustification = lineJustification;
  }
  public native function get locale(): String;
  public native function get lineJustification(): String;
  public native function set lineJustification(value: String): void;
  public function clone(): TextJustifier {
    return null;
  }
  private native function setLocale(value: String): void;
}
}
