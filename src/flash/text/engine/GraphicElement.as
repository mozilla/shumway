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
import flash.display.DisplayObject;
import flash.events.EventDispatcher;

[native(cls='GraphicElementClass')]
public final class GraphicElement extends ContentElement {
  public function GraphicElement(graphic: DisplayObject = null, elementWidth: Number = 15,
                                 elementHeight: Number = 15, elementFormat: ElementFormat = null,
                                 eventMirror: EventDispatcher = null,
                                 textRotation: String = "rotate0")
  {
    super(elementFormat, eventMirror, textRotation);
    this.elementWidth = elementWidth;
    this.elementHeight = elementHeight;
    this.graphic = graphic;
  }
  public native function get graphic(): DisplayObject;
  public native function set graphic(value: DisplayObject): void;
  public native function get elementHeight(): Number;
  public native function set elementHeight(value: Number): void;
  public native function get elementWidth(): Number;
  public native function set elementWidth(value: Number): void;
}
}
