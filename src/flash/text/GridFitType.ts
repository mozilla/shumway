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
// Class: GridFitType
module Shumway.AVMX.AS.flash.text {
  export class GridFitType extends ASObject {

    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor() {
      super();
    }

    // JS -> AS Bindings
    static NONE: string = "none";
    static PIXEL: string = "pixel";
    static SUBPIXEL: string = "subpixel";

    static fromNumber(n: number): string {
      switch (n) {
        case 0:
          return GridFitType.NONE;
        case 1:
          return GridFitType.PIXEL;
        case 2:
          return GridFitType.SUBPIXEL;
        default:
          return null;
      }
    }

    static toNumber(value: string): number {
      switch (value) {
        case GridFitType.NONE:
          return 0;
        case GridFitType.PIXEL:
          return 1;
        case GridFitType.SUBPIXEL:
          return 2;
        default:
          return -1;
      }
    }
  }
}
