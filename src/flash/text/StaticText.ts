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
// Class: StaticText
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;

  export class StaticText extends flash.display.DisplayObject {

    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    static initializer: any = function (symbol: Shumway.Timeline.TextSymbol) {
      var self: StaticText = this;
      self._textContent = null;
      if (symbol) {
        this._setStaticContentFromSymbol(symbol);
      }
    };

    constructor () {
      false && super();
      flash.display.DisplayObject.instanceConstructorNoInitialize.call(this);
    }

    _getTextContent(): Shumway.TextContent {
      return this._textContent;
    }

    _textContent: Shumway.TextContent;

    get text(): string {
      return this._textContent.plainText;
    }
  }
}
