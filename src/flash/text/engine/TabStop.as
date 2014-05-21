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

[native(cls='TabStopClass')]
public final class TabStop {
  public function TabStop(alignment: String = "start", position: Number = 0,
                          decimalAlignmentToken: String = "")
  {
    this.alignment = alignment;
    this.position = position;
    this.decimalAlignmentToken = decimalAlignmentToken;
  }
  public native function get alignment(): String;
  public native function set alignment(value: String): void;
  public native function get position(): Number;
  public native function set position(value: Number): void;
  public native function get decimalAlignmentToken(): String;
  public native function set decimalAlignmentToken(value: String): void;
}
}
