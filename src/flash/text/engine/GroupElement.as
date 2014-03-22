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
import flash.events.EventDispatcher;

[native(cls='GroupElementClass')]
public final class GroupElement extends ContentElement {
  public function GroupElement(elements: Vector = null, elementFormat: ElementFormat = null,
                               eventMirror: EventDispatcher = null,
                               textRotation: String = "rotate0")
  {
    super(elementFormat, eventMirror, textRotation);
    setElements(elements);
  }
  public native function get elementCount(): int;
  public native function getElementAt(index: int): ContentElement;
  public native function setElements(value: Vector): void;
  public native function groupElements(beginIndex: int, endIndex: int): GroupElement;
  public native function ungroupElements(groupIndex: int): void;
  public native function mergeTextElements(beginIndex: int, endIndex: int): TextElement;
  public native function splitTextElement(elementIndex: int, splitIndex: int): TextElement;
  public native function replaceElements(beginIndex: int, endIndex: int,
                                         newElements: Vector): Vector;
  public native function getElementAtCharIndex(charIndex: int): ContentElement;
  public function getElementIndex(element: ContentElement): int {
    var count: int = this.elementCount;
    for (var i: int = 0; i < count; i++) {
      if (element === this.getElementAt(i)) {
        return i;
      }
    }

    return -1;
  }
}
}
