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

[native(cls='TextSnapshotClass')]
public class TextSnapshot {
  public function TextSnapshot() {}
  public native function get charCount(): int;
  public native function findText(beginIndex: int, textToFind: String, caseSensitive: Boolean): int;
  public native function getSelected(beginIndex: int, endIndex: int): Boolean;
  public native function getSelectedText(includeLineEndings: Boolean = false): String;
  public native function getText(beginIndex: int, endIndex: int,
                                 includeLineEndings: Boolean = false): String;
  public native function getTextRunInfo(beginIndex: int, endIndex: int): Array;
  public native function hitTestTextNearPos(x: Number, y: Number, maxDistance: Number = 0): Number;
  public native function setSelectColor(hexColor: uint = 16776960): void;
  public native function setSelected(beginIndex: int, endIndex: int, select: Boolean): void;
}
}
