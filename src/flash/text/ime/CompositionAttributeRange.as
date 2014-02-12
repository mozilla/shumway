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

package flash.text.ime {
public final class CompositionAttributeRange {
  public function CompositionAttributeRange(relativeStart: int, relativeEnd: int, selected: Boolean,
                                            converted: Boolean)
  {
    this.relativeStart = relativeStart;
    this.relativeEnd = relativeEnd;
    this.selected = selected;
    this.converted = converted;
  }
  public var relativeStart: int;
  public var relativeEnd: int;
  public var selected: Boolean;
  public var converted: Boolean;
}
}
