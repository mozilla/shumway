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

package flash.text {

[native(cls='TextFormatClass')]
public class TextFormat {
  public native function TextFormat(font: String = null, size: Object = null, color: Object = null,
                             bold: Object = null, italic: Object = null, underline: Object = null,
                             url: String = null, target: String = null, align: String = null,
                             leftMargin: Object = null, rightMargin: Object = null,
                             indent: Object = null, leading: Object = null);
  public native function get align(): String;
  public native function set align(value: String): void;
  public native function get blockIndent(): Object;
  public native function set blockIndent(value: Object): void;
  public native function get bold(): Object;
  public native function set bold(value: Object): void;
  public native function get bullet(): Object;
  public native function set bullet(value: Object): void;
  public native function get color(): Object;
  public native function set color(value: Object): void;
  public native function get display(): String;
  public native function set display(value: String): void;
  public native function get font(): String;
  public native function set font(value: String): void;
  public native function get indent(): Object;
  public native function set indent(value: Object): void;
  public native function get italic(): Object;
  public native function set italic(value: Object): void;
  public native function get kerning(): Object;
  public native function set kerning(value: Object): void;
  public native function get leading(): Object;
  public native function set leading(value: Object): void;
  public native function get leftMargin(): Object;
  public native function set leftMargin(value: Object): void;
  public native function get letterSpacing(): Object;
  public native function set letterSpacing(value: Object): void;
  public native function get rightMargin(): Object;
  public native function set rightMargin(value: Object): void;
  public native function get size(): Object;
  public native function set size(value: Object): void;
  public native function get tabStops(): Array;
  public native function set tabStops(value: Array): void;
  public native function get target(): String;
  public native function set target(value: String): void;
  public native function get underline(): Object;
  public native function set underline(value: Object): void;
  public native function get url(): String;
  public native function set url(value: String): void;
}
}
