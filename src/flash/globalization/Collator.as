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

package flash.globalization {

[native(cls='CollatorClass')]
public final class Collator {
  public static native function getAvailableLocaleIDNames(): Vector;
  public function Collator(requestedLocaleIDName: String, initialMode: String = "sorting") {
    ctor(requestedLocaleIDName, initialMode);
  }
  public native function get ignoreCase(): Boolean;
  public native function set ignoreCase(value: Boolean): void;
  public native function get ignoreDiacritics(): Boolean;
  public native function set ignoreDiacritics(value: Boolean): void;
  public native function get ignoreKanaType(): Boolean;
  public native function set ignoreKanaType(value: Boolean): void;
  public native function get ignoreSymbols(): Boolean;
  public native function set ignoreSymbols(value: Boolean): void;
  public native function get ignoreCharacterWidth(): Boolean;
  public native function set ignoreCharacterWidth(value: Boolean): void;
  public native function get numericComparison(): Boolean;
  public native function set numericComparison(value: Boolean): void;
  public native function get lastOperationStatus(): String;
  public native function get actualLocaleIDName(): String;
  public native function get requestedLocaleIDName(): String;
  public native function compare(string1: String, string2: String): int;
  public native function equals(string1: String, string2: String): Boolean;
  private native function ctor(requestedLocaleIDName: String, initialMode: String): void;
}
}
