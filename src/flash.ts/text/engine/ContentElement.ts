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
// Class: ContentElement
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ContentElement extends ASNative {
    static initializer: any = null;
    constructor (elementFormat: flash.text.engine.ElementFormat = null, eventMirror: flash.events.EventDispatcher = null, textRotation: string = "rotate0") {
      elementFormat = elementFormat; eventMirror = eventMirror; textRotation = "" + textRotation;
      false && super();
      notImplemented("Dummy Constructor: public flash.text.engine.ContentElement");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    userData: any;
    // Instance AS -> JS Bindings
    get textBlock(): flash.text.engine.TextBlock {
      notImplemented("public flash.text.engine.ContentElement::get textBlock"); return;
    }
    get textBlockBeginIndex(): number /*int*/ {
      notImplemented("public flash.text.engine.ContentElement::get textBlockBeginIndex"); return;
    }
    get elementFormat(): flash.text.engine.ElementFormat {
      notImplemented("public flash.text.engine.ContentElement::get elementFormat"); return;
    }
    set elementFormat(value: flash.text.engine.ElementFormat) {
      value = value;
      notImplemented("public flash.text.engine.ContentElement::set elementFormat"); return;
    }
    get eventMirror(): flash.events.EventDispatcher {
      notImplemented("public flash.text.engine.ContentElement::get eventMirror"); return;
    }
    set eventMirror(value: flash.events.EventDispatcher) {
      value = value;
      notImplemented("public flash.text.engine.ContentElement::set eventMirror"); return;
    }
    get groupElement(): flash.text.engine.GroupElement {
      notImplemented("public flash.text.engine.ContentElement::get groupElement"); return;
    }
    get rawText(): string {
      notImplemented("public flash.text.engine.ContentElement::get rawText"); return;
    }
    get text(): string {
      notImplemented("public flash.text.engine.ContentElement::get text"); return;
    }
    get textRotation(): string {
      notImplemented("public flash.text.engine.ContentElement::get textRotation"); return;
    }
    set textRotation(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.ContentElement::set textRotation"); return;
    }
  }
}
