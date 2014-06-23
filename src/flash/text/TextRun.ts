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
// Class: TextRun
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TextRun extends ASNative {

    static classInitializer: any = null;
    static initializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null; // ["beginIndex", "endIndex", "textFormat"];

    constructor(beginIndex: number /*int*/, endIndex: number /*int*/,
                textFormat: flash.text.TextFormat)
    {
      false && super();
      this._beginIndex = beginIndex | 0;
      this._endIndex = endIndex | 0;
      this._textFormat = textFormat;
    }

    // JS -> AS Bindings
    _beginIndex: number /*int*/;
    _endIndex: number /*int*/;
    _textFormat: flash.text.TextFormat;

    // AS -> JS Bindings
    get beginIndex(): number {
      return this._beginIndex;
    }

    set beginIndex(value: number) {
      this._beginIndex = value | 0;
    }

    get endIndex(): number {
      return this._endIndex;
    }

    set endIndex(value: number) {
      this._endIndex = value | 0;
    }

    get textFormat(): TextFormat {
      return this._textFormat;
    }

    set textFormat(value: TextFormat) {
      this._textFormat = value;
    }

    clone(): TextRun {
      return new flash.text.TextRun(this.beginIndex, this.endIndex, this.textFormat);
    }
  }
}
