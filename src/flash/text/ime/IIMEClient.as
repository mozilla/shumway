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
import flash.geom.Rectangle;

public interface IIMEClient {
  function get compositionStartIndex(): int;
  function get compositionEndIndex(): int;
  function get verticalTextLayout(): Boolean;
  function get selectionAnchorIndex(): int;
  function get selectionActiveIndex(): int;
  function updateComposition(text: String, attributes: Vector, compositionStartIndex: int,
                             compositionEndIndex: int): void;
  function confirmComposition(text: String = null, preserveSelection: Boolean = false): void;
  function getTextBounds(startIndex: int, endIndex: int): Rectangle;
  function selectRange(anchorIndex: int, activeIndex: int): void;
  function getTextInRange(startIndex: int, endIndex: int): String;
}
}
