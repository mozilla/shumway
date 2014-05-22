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
// Class: TextFieldAutoSize
module Shumway.AVM2.AS.flash.text {
  export class TextFieldAutoSize extends ASNative {

    static classInitializer: any = null;
    static initializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor() {
      super();
    }

    // JS -> AS Bindings
    static NONE: string = "none";
    static LEFT: string = "left";
    static CENTER: string = "center";
    static RIGHT: string = "right";

    static fromNumber(n: number): string {
      switch (n) {
        case 0:
          return TextFieldAutoSize.NONE;
        case 1:
          return TextFieldAutoSize.CENTER;
        case 2:
          return TextFieldAutoSize.LEFT;
        case 3:
          return TextFieldAutoSize.RIGHT;
        default:
          return null;
      }
    }

    static toNumber(value: string): number {
      switch (value) {
        case TextFieldAutoSize.NONE:
          return 0;
        case TextFieldAutoSize.CENTER:
          return 1;
        case TextFieldAutoSize.LEFT:
          return 2;
        case TextFieldAutoSize.RIGHT:
          return 3;
        default:
          return -1;
      }
    }
  }
}
