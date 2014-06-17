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

[native(cls='TextRunClass')]
public class TextRun {
  public native function TextRun(beginIndex: int, endIndex: int, textFormat: TextFormat);
  public native function get beginIndex(): int;
  public native function set beginIndex(value: int): void;
  public native function get endIndex(): int;
  public native function set endIndex(value: int): void;
  public native function get textFormat(): TextFormat;
  public native function set textFormat(value: TextFormat): void;
}
}
