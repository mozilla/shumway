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

  enum StageAlignFlags {
    None     = 0,
    Top      = 1,
    Bottom   = 2,
    Left     = 4,
    Right    = 8
  }

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
      if (n === 0) {
        return "";
      }
      var s = "";
      if (n & StageAlignFlags.Top) {
        s += "T";
      }
      if (n & StageAlignFlags.Bottom) {
        s += "B";
      }
      if (n & StageAlignFlags.Left) {
        s += "L";
      }
      if (n & StageAlignFlags.Right) {
        s += "R";
      }
      return s;
    }

    static toNumber(value: string): number {
      var n = 0;
      value = value.toUpperCase();
      if (value.indexOf("T") >= 0) {
        n |= StageAlignFlags.Top;
      }
      if (value.indexOf("B") >= 0) {
        n |= StageAlignFlags.Bottom;
      }
      if (value.indexOf("L") >= 0) {
        n |= StageAlignFlags.Left;
      }
      if (value.indexOf("R") >= 0) {
        n |= StageAlignFlags.Right;
      }
      return n;
    }
  }
}
