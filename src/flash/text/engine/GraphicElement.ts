/**
 * Copyright 2014 Mozilla Foundation
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
 * limitations under the License.
 */
// Class: GraphicElement
module Shumway.AVMX.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class GraphicElement extends flash.text.engine.ContentElement {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor (graphic: flash.display.DisplayObject = null, elementWidth: number = 15, elementHeight: number = 15, elementFormat: flash.text.engine.ElementFormat = null, eventMirror: flash.events.EventDispatcher = null, textRotation: string = "rotate0") {
      graphic = graphic; elementWidth = +elementWidth; elementHeight = +elementHeight; elementFormat = elementFormat; eventMirror = eventMirror; textRotation = axCoerceString(textRotation);
      super(undefined, undefined, undefined);
      dummyConstructor("public flash.text.engine.GraphicElement");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _graphic: flash.display.DisplayObject;
    // _elementHeight: number;
    // _elementWidth: number;
    get graphic(): flash.display.DisplayObject {
      release || notImplemented("public flash.text.engine.GraphicElement::get graphic"); return;
      // return this._graphic;
    }
    set graphic(value: flash.display.DisplayObject) {
      value = value;
      release || notImplemented("public flash.text.engine.GraphicElement::set graphic"); return;
      // this._graphic = value;
    }
    get elementHeight(): number {
      release || notImplemented("public flash.text.engine.GraphicElement::get elementHeight"); return;
      // return this._elementHeight;
    }
    set elementHeight(value: number) {
      value = +value;
      release || notImplemented("public flash.text.engine.GraphicElement::set elementHeight"); return;
      // this._elementHeight = value;
    }
    get elementWidth(): number {
      release || notImplemented("public flash.text.engine.GraphicElement::get elementWidth"); return;
      // return this._elementWidth;
    }
    set elementWidth(value: number) {
      value = +value;
      release || notImplemented("public flash.text.engine.GraphicElement::set elementWidth"); return;
      // this._elementWidth = value;
    }
  }
}
