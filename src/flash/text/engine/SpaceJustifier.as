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

[native(cls='SpaceJustifierClass')]
public final class SpaceJustifier extends TextJustifier {
  public function SpaceJustifier(locale: String = "en", lineJustification: String = "unjustified",
                                 letterSpacing: Boolean = false)
  {
    super(locale, lineJustification);
    this.letterSpacing = letterSpacing;
  }
  public native function get letterSpacing(): Boolean;
  public native function set letterSpacing(value: Boolean): void;
  public native function get minimumSpacing(): Number;
  public native function set minimumSpacing(value: Number): void;
  public native function get optimumSpacing(): Number;
  public native function set optimumSpacing(value: Number): void;
  public native function get maximumSpacing(): Number;
  public native function set maximumSpacing(value: Number): void;
  public override function clone(): TextJustifier {
    return new SpaceJustifier(locale, lineJustification, letterSpacing);
  }
}
}
