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
// Class: MouseCursor
module Shumway.AVMX.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVMX.asCoerceString;
  export class MouseCursor extends ASObject {
    
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
      dummyConstructor("public flash.ui.MouseCursor");
    }
    
    // JS -> AS Bindings
    static AUTO: string = "auto";
    static ARROW: string = "arrow";
    static BUTTON: string = "button";
    static HAND: string = "hand";
    static IBEAM: string = "ibeam";

    static fromNumber(n: number): string {
      switch (n) {
        case 0:
          return MouseCursor.AUTO;
        case 1:
          return MouseCursor.ARROW;
        case 2:
          return MouseCursor.BUTTON;
        case 3:
          return MouseCursor.HAND;
        case 4:
          return MouseCursor.IBEAM;
        default:
          return null;
      }
    }

    static toNumber(value: string): number {
      switch (value) {
        case MouseCursor.AUTO:
          return 0;
        case MouseCursor.ARROW:
          return 1;
        case MouseCursor.BUTTON:
          return 2;
        case MouseCursor.HAND:
          return 3;
        case MouseCursor.IBEAM:
          return 4;
        default:
          return -1;
      }
    }
    
  }
}
