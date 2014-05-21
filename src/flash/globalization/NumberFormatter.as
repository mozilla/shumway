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

[native(cls='NumberFormatterClass')]
public final class NumberFormatter {
  public static native function getAvailableLocaleIDNames(): Vector;
  public function NumberFormatter(requestedLocaleIDName: String) {
    ctor(requestedLocaleIDName);
  }
  public native function get lastOperationStatus(): String;
  public native function get requestedLocaleIDName(): String;
  public native function get actualLocaleIDName(): String;
  public native function get fractionalDigits(): int;
  public native function set fractionalDigits(value: int): void;
  public native function get useGrouping(): Boolean;
  public native function set useGrouping(value: Boolean): void;
  public native function get groupingPattern(): String;
  public native function set groupingPattern(value: String): void;
  public native function get digitsType(): uint;
  public native function set digitsType(value: uint): void;
  public native function get decimalSeparator(): String;
  public native function set decimalSeparator(value: String): void;
  public native function get groupingSeparator(): String;
  public native function set groupingSeparator(value: String): void;
  public native function get negativeSymbol(): String;
  public native function set negativeSymbol(value: String): void;
  public native function get negativeNumberFormat(): uint;
  public native function set negativeNumberFormat(value: uint): void;
  public native function get leadingZero(): Boolean;
  public native function set leadingZero(value: Boolean): void;
  public native function get trailingZeros(): Boolean;
  public native function set trailingZeros(value: Boolean): void;
  public native function parse(parseString: String): NumberParseResult;
  public native function parseNumber(parseString: String): Number;
  public native function formatInt(value: int): String;
  public native function formatUint(value: uint): String;
  public native function formatNumber(value: Number): String;
  private native function ctor(requestedLocaleIDName: String): void;
}
}
