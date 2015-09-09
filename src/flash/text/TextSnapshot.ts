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
// Class: TextSnapshot
module Shumway.AVMX.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class TextSnapshot extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    constructor () {
      super();
    }

    // _charCount: number /*int*/;
    get charCount(): number /*int*/ {
      release || notImplemented("public flash.text.TextSnapshot::get charCount"); return;
      // return this._charCount;
    }
    findText(beginIndex: number /*int*/, textToFind: string, caseSensitive: boolean): number /*int*/ {
      beginIndex = beginIndex | 0; textToFind = axCoerceString(textToFind); caseSensitive = !!caseSensitive;
      release || notImplemented("public flash.text.TextSnapshot::findText"); return;
    }
    getSelected(beginIndex: number /*int*/, endIndex: number /*int*/): boolean {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      release || notImplemented("public flash.text.TextSnapshot::getSelected"); return;
    }
    getSelectedText(includeLineEndings: boolean = false): string {
      includeLineEndings = !!includeLineEndings;
      release || notImplemented("public flash.text.TextSnapshot::getSelectedText"); return;
    }
    getText(beginIndex: number /*int*/, endIndex: number /*int*/, includeLineEndings: boolean = false): string {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0; includeLineEndings = !!includeLineEndings;
      release || notImplemented("public flash.text.TextSnapshot::getText"); return;
    }
    getTextRunInfo(beginIndex: number /*int*/, endIndex: number /*int*/): ASArray {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      release || notImplemented("public flash.text.TextSnapshot::getTextRunInfo"); return;
    }
    hitTestTextNearPos(x: number, y: number, maxDistance: number = 0): number {
      x = +x; y = +y; maxDistance = +maxDistance;
      release || notImplemented("public flash.text.TextSnapshot::hitTestTextNearPos"); return;
    }
    setSelectColor(hexColor: number /*uint*/ = 16776960): void {
      hexColor = hexColor >>> 0;
      release || notImplemented("public flash.text.TextSnapshot::setSelectColor"); return;
    }
    setSelected(beginIndex: number /*int*/, endIndex: number /*int*/, select: boolean): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0; select = !!select;
      release || notImplemented("public flash.text.TextSnapshot::setSelected"); return;
    }
  }
}
