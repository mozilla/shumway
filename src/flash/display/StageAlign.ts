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
// Class: StageAlign
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class StageAlign extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.StageAlign");
    }
    
    // JS -> AS Bindings
    static TOP: string = "T";
    static LEFT: string = "L";
    static BOTTOM: string = "B";
    static RIGHT: string = "R";
    static TOP_LEFT: string = "TL";
    static TOP_RIGHT: string = "TR";
    static BOTTOM_LEFT: string = "BL";
    static BOTTOM_RIGHT: string = "BR";
    
    
    // AS -> JS Bindings

    static fromNumber(n: number): string {
      switch (n) {
        case 0:
          return '';
        case 1:
          return StageAlign.TOP;
        case 2:
          return StageAlign.LEFT;
        case 3:
          return StageAlign.BOTTOM;
        case 4:
          return StageAlign.RIGHT;
        case 5:
          return StageAlign.TOP_LEFT;
        case 6:
          return StageAlign.TOP_RIGHT;
        case 7:
          return StageAlign.BOTTOM_LEFT;
        case 8:
          return StageAlign.BOTTOM_RIGHT;
        default:
          return null;
      }
    }

    static toNumber(value: string): number {
      switch (value) {
        case '':
          return 0;
        case StageAlign.TOP:
          return 1;
        case StageAlign.LEFT:
          return 2;
        case StageAlign.BOTTOM:
          return 3;
        case StageAlign.RIGHT:
          return 4;
        case StageAlign.TOP_LEFT:
          return 5;
        case StageAlign.TOP_RIGHT:
          return 6;
        case StageAlign.BOTTOM_LEFT:
          return 7;
        case StageAlign.BOTTOM_RIGHT:
          return 8;
        default:
          return -1;
      }
    }
  }
}
