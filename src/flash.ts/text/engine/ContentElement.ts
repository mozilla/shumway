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
 * limitations under the License.
 */
// Class: ContentElement
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class ContentElement extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["userData"];
    
    constructor (elementFormat: flash.text.engine.ElementFormat = null, eventMirror: flash.events.EventDispatcher = null, textRotation: string = "rotate0") {
      elementFormat = elementFormat; eventMirror = eventMirror; textRotation = asCoerceString(textRotation);
      false && super();
      notImplemented("Dummy Constructor: public flash.text.engine.ContentElement");
    }
    
    // JS -> AS Bindings
    static GRAPHIC_ELEMENT: number /*uint*/ = 65007;
    
    userData: any;
    
    // AS -> JS Bindings
    
    // _textBlock: flash.text.engine.TextBlock;
    // _textBlockBeginIndex: number /*int*/;
    // _elementFormat: flash.text.engine.ElementFormat;
    // _eventMirror: flash.events.EventDispatcher;
    // _groupElement: flash.text.engine.GroupElement;
    // _rawText: string;
    // _text: string;
    // _textRotation: string;
    get textBlock(): flash.text.engine.TextBlock {
      notImplemented("public flash.text.engine.ContentElement::get textBlock"); return;
      // return this._textBlock;
    }
    get textBlockBeginIndex(): number /*int*/ {
      notImplemented("public flash.text.engine.ContentElement::get textBlockBeginIndex"); return;
      // return this._textBlockBeginIndex;
    }
    get elementFormat(): flash.text.engine.ElementFormat {
      notImplemented("public flash.text.engine.ContentElement::get elementFormat"); return;
      // return this._elementFormat;
    }
    set elementFormat(value: flash.text.engine.ElementFormat) {
      value = value;
      notImplemented("public flash.text.engine.ContentElement::set elementFormat"); return;
      // this._elementFormat = value;
    }
    get eventMirror(): flash.events.EventDispatcher {
      notImplemented("public flash.text.engine.ContentElement::get eventMirror"); return;
      // return this._eventMirror;
    }
    set eventMirror(value: flash.events.EventDispatcher) {
      value = value;
      notImplemented("public flash.text.engine.ContentElement::set eventMirror"); return;
      // this._eventMirror = value;
    }
    get groupElement(): flash.text.engine.GroupElement {
      notImplemented("public flash.text.engine.ContentElement::get groupElement"); return;
      // return this._groupElement;
    }
    get rawText(): string {
      notImplemented("public flash.text.engine.ContentElement::get rawText"); return;
      // return this._rawText;
    }
    get text(): string {
      notImplemented("public flash.text.engine.ContentElement::get text"); return;
      // return this._text;
    }
    get textRotation(): string {
      notImplemented("public flash.text.engine.ContentElement::get textRotation"); return;
      // return this._textRotation;
    }
    set textRotation(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.text.engine.ContentElement::set textRotation"); return;
      // this._textRotation = value;
    }
  }
}
