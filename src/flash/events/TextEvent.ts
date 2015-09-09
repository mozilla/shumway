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
// Class: TextEvent
module Shumway.AVMX.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TextEvent extends flash.events.Event {

    static classInitializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor(type: string, bubbles: boolean, cancelable: boolean, text: string) {
      super(type, bubbles, cancelable);
      this._text = text;
    }

    static LINK: string = "link";
    static TEXT_INPUT: string = "textInput";

    _text: string;

    get text(): string {
      return this._text;
    }
     set text(value: string) {
      this._text = value;
    }

    clone(): Event {
      var textEvent = new this.sec.flash.events.TextEvent(this.type, this.bubbles,
                                                                     this.cancelable, this.text);
      //this.copyNativeData(textEvent);
      return textEvent;
    }

    toString(): string {
      return this.formatToString('TextEvent', 'type', 'bubbles', 'cancelable', 'text');
    }

    copyNativeData(event: flash.events.TextEvent): void {
      release || notImplemented("public flash.events.TextEvent::copyNativeData");
    }
  }
}
