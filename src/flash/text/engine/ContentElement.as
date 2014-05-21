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

[native(cls='ContentElementClass')]
public class ContentElement {
  public static const GRAPHIC_ELEMENT: uint = 65007;
  public function ContentElement(elementFormat: ElementFormat = null,
                                 eventMirror: EventDispatcher = null,
                                 textRotation: String = "rotate0")
  {
    this.elementFormat = elementFormat;
    this.eventMirror = eventMirror;
    this.textRotation = textRotation;
  }
  public var userData: *;
  public native function get textBlock(): TextBlock;
  public native function get textBlockBeginIndex(): int;
  public native function get elementFormat(): ElementFormat;
  public native function set elementFormat(value: ElementFormat): void;
  public native function get eventMirror(): EventDispatcher;
  public native function set eventMirror(value: EventDispatcher): void;
  public native function get groupElement(): GroupElement;
  public native function get rawText(): String;
  public native function get text(): String;
  public native function get textRotation(): String;
  public native function set textRotation(value: String): void;
}
}
