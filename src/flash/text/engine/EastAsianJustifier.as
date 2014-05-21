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

[native(cls='EastAsianJustifierClass')]
public final class EastAsianJustifier extends TextJustifier {
  public function EastAsianJustifier(locale: String = "ja",
                                     lineJustification: String = "allButLast",
                                     justificationStyle: String = "pushInKinsoku")
  {
    super(locale, lineJustification);
    this.justificationStyle = justificationStyle;
  }
  public native function get justificationStyle(): String;
  public native function set justificationStyle(value: String): void;
  public native function get composeTrailingIdeographicSpaces(): Boolean;
  public native function set composeTrailingIdeographicSpaces(value: Boolean): void;
  public override function clone(): TextJustifier {
    return new EastAsianJustifier(locale, lineJustification, justificationStyle);
  }
}
}
