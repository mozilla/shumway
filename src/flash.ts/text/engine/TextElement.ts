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
// Class: TextElement
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TextElement extends flash.text.engine.ContentElement {
    static initializer: any = null;
    constructor (text: string = null, elementFormat: flash.text.engine.ElementFormat = null, eventMirror: flash.events.EventDispatcher = null, textRotation: string = "rotate0") {
      text = "" + text; elementFormat = elementFormat; eventMirror = eventMirror; textRotation = "" + textRotation;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.text.engine.TextElement");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    set text(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.TextElement::set text"); return;
    }
    replaceText(beginIndex: number /*int*/, endIndex: number /*int*/, newText: string): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0; newText = "" + newText;
      notImplemented("public flash.text.engine.TextElement::replaceText"); return;
    }
  }
}
