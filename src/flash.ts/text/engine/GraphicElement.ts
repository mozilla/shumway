/**
 * Copyright 2013 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations undxr the License.
 */
// Class: GraphicElement
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GraphicElement extends flash.text.engine.ContentElement {
    static initializer: any = null;
    constructor (graphic: flash.display.DisplayObject = null, elementWidth: number = 15, elementHeight: number = 15, elementFormat: flash.text.engine.ElementFormat = null, eventMirror: flash.events.EventDispatcher = null, textRotation: string = "rotate0") {
      graphic = graphic; elementWidth = +elementWidth; elementHeight = +elementHeight; elementFormat = elementFormat; eventMirror = eventMirror; textRotation = "" + textRotation;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.text.engine.GraphicElement");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get graphic(): flash.display.DisplayObject {
      notImplemented("public flash.text.engine.GraphicElement::get graphic"); return;
    }
    set graphic(value: flash.display.DisplayObject) {
      value = value;
      notImplemented("public flash.text.engine.GraphicElement::set graphic"); return;
    }
    get elementHeight(): number {
      notImplemented("public flash.text.engine.GraphicElement::get elementHeight"); return;
    }
    set elementHeight(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.GraphicElement::set elementHeight"); return;
    }
    get elementWidth(): number {
      notImplemented("public flash.text.engine.GraphicElement::get elementWidth"); return;
    }
    set elementWidth(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.GraphicElement::set elementWidth"); return;
    }
  }
}
