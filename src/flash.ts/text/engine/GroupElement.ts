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
// Class: GroupElement
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GroupElement extends flash.text.engine.ContentElement {
    static initializer: any = null;
    constructor (elements: ASVector<flash.text.engine.ContentElement> = null, elementFormat: flash.text.engine.ElementFormat = null, eventMirror: flash.events.EventDispatcher = null, textRotation: string = "rotate0") {
      elements = elements; elementFormat = elementFormat; eventMirror = eventMirror; textRotation = "" + textRotation;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.text.engine.GroupElement");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    getElementIndex: (element: flash.text.engine.ContentElement) => number /*int*/;
    // Instance AS -> JS Bindings
    get elementCount(): number /*int*/ {
      notImplemented("public flash.text.engine.GroupElement::get elementCount"); return;
    }
    getElementAt(index: number /*int*/): flash.text.engine.ContentElement {
      index = index | 0;
      notImplemented("public flash.text.engine.GroupElement::getElementAt"); return;
    }
    setElements(value: ASVector<flash.text.engine.ContentElement>): void {
      value = value;
      notImplemented("public flash.text.engine.GroupElement::setElements"); return;
    }
    groupElements(beginIndex: number /*int*/, endIndex: number /*int*/): flash.text.engine.GroupElement {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.engine.GroupElement::groupElements"); return;
    }
    ungroupElements(groupIndex: number /*int*/): void {
      groupIndex = groupIndex | 0;
      notImplemented("public flash.text.engine.GroupElement::ungroupElements"); return;
    }
    mergeTextElements(beginIndex: number /*int*/, endIndex: number /*int*/): flash.text.engine.TextElement {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.engine.GroupElement::mergeTextElements"); return;
    }
    splitTextElement(elementIndex: number /*int*/, splitIndex: number /*int*/): flash.text.engine.TextElement {
      elementIndex = elementIndex | 0; splitIndex = splitIndex | 0;
      notImplemented("public flash.text.engine.GroupElement::splitTextElement"); return;
    }
    replaceElements(beginIndex: number /*int*/, endIndex: number /*int*/, newElements: ASVector<flash.text.engine.ContentElement>): ASVector<flash.text.engine.ContentElement> {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0; newElements = newElements;
      notImplemented("public flash.text.engine.GroupElement::replaceElements"); return;
    }
    getElementAtCharIndex(charIndex: number /*int*/): flash.text.engine.ContentElement {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.engine.GroupElement::getElementAtCharIndex"); return;
    }
  }
}
