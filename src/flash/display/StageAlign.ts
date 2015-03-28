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
module Shumway.AVMX.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVMX.asCoerceString;
  import StageAlignFlags = Shumway.Remoting.StageAlignFlags;

  export class StageAlign extends ASObject {
    
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
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

    /**
     * Looks like the Flash player just searches for the "T", "B", "L", "R" characters and
     * maintains an internal bit field for alignment, for instance it's possible to set the
     * alignment value "TBLR" even though there is no enum for it.
     */
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
