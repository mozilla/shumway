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
// Class: GroupElement
module Shumway.AVMX.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class GroupElement extends flash.text.engine.ContentElement {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["getElementIndex"];
    
    constructor (elements: ASVector<any> = null, elementFormat: flash.text.engine.ElementFormat = null, eventMirror: flash.events.EventDispatcher = null, textRotation: string = "rotate0") {
      elements = elements; elementFormat = elementFormat; eventMirror = eventMirror; textRotation = axCoerceString(textRotation);
      super(undefined, undefined, undefined);
      dummyConstructor("public flash.text.engine.GroupElement");
    }
    
    // JS -> AS Bindings
    
    getElementIndex: (element: flash.text.engine.ContentElement) => number /*int*/;
    
    // AS -> JS Bindings
    
    // _elementCount: number /*int*/;
    get elementCount(): number /*int*/ {
      release || notImplemented("public flash.text.engine.GroupElement::get elementCount"); return;
      // return this._elementCount;
    }
    getElementAt(index: number /*int*/): flash.text.engine.ContentElement {
      index = index | 0;
      release || notImplemented("public flash.text.engine.GroupElement::getElementAt"); return;
    }
    setElements(value: ASVector<any>): void {
      value = value;
      release || notImplemented("public flash.text.engine.GroupElement::setElements"); return;
    }
    groupElements(beginIndex: number /*int*/, endIndex: number /*int*/): flash.text.engine.GroupElement {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      release || notImplemented("public flash.text.engine.GroupElement::groupElements"); return;
    }
    ungroupElements(groupIndex: number /*int*/): void {
      groupIndex = groupIndex | 0;
      release || notImplemented("public flash.text.engine.GroupElement::ungroupElements"); return;
    }
    mergeTextElements(beginIndex: number /*int*/, endIndex: number /*int*/): flash.text.engine.TextElement {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      release || notImplemented("public flash.text.engine.GroupElement::mergeTextElements"); return;
    }
    splitTextElement(elementIndex: number /*int*/, splitIndex: number /*int*/): flash.text.engine.TextElement {
      elementIndex = elementIndex | 0; splitIndex = splitIndex | 0;
      release || notImplemented("public flash.text.engine.GroupElement::splitTextElement"); return;
    }
    replaceElements(beginIndex: number /*int*/, endIndex: number /*int*/, newElements: ASVector<any>): ASVector<any> {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0; newElements = newElements;
      release || notImplemented("public flash.text.engine.GroupElement::replaceElements"); return;
    }
    getElementAtCharIndex(charIndex: number /*int*/): flash.text.engine.ContentElement {
      charIndex = charIndex | 0;
      release || notImplemented("public flash.text.engine.GroupElement::getElementAtCharIndex"); return;
    }
  }
}
