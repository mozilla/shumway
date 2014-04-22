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
// Class: BlendMode
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class BlendMode extends ASNative {
    
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
      notImplemented("Dummy Constructor: public flash.display.BlendMode");
    }
    
    // JS -> AS Bindings
    static NORMAL: string = "normal";
    static LAYER: string = "layer";
    static MULTIPLY: string = "multiply";
    static SCREEN: string = "screen";
    static LIGHTEN: string = "lighten";
    static DARKEN: string = "darken";
    static ADD: string = "add";
    static SUBTRACT: string = "subtract";
    static DIFFERENCE: string = "difference";
    static INVERT: string = "invert";
    static OVERLAY: string = "overlay";
    static HARDLIGHT: string = "hardlight";
    static ALPHA: string = "alpha";
    static ERASE: string = "erase";
    static SHADER: string = "shader";
    
    
    // AS -> JS Bindings
    
    static fromNumber(n: number): string {
      switch (n) {
        case 0:
        case 1:
          return BlendMode.NORMAL;
        case 2:
          return BlendMode.LAYER;
        case 3:
          return BlendMode.MULTIPLY;
        case 4:
          return BlendMode.SCREEN;
        case 5:
          return BlendMode.LIGHTEN;
        case 6:
          return BlendMode.DARKEN;
        case 7:
          return BlendMode.DIFFERENCE;
        case 8:
          return BlendMode.ADD;
        case 9:
          return BlendMode.SUBTRACT;
        case 10:
          return BlendMode.INVERT;
        case 11:
          return BlendMode.ALPHA;
        case 12:
          return BlendMode.ERASE;
        case 13:
          return BlendMode.OVERLAY;
        case 14:
          return BlendMode.HARDLIGHT;
        default:
          return BlendMode.NORMAL;
      }
    }

    static isMember(value: string): boolean {
      switch (value) {
        case BlendMode.NORMAL:
        case BlendMode.LAYER:
        case BlendMode.MULTIPLY:
        case BlendMode.SCREEN:
        case BlendMode.LIGHTEN:
        case BlendMode.DARKEN:
        case BlendMode.ADD:
        case BlendMode.SUBTRACT:
        case BlendMode.DIFFERENCE:
        case BlendMode.INVERT:
        case BlendMode.OVERLAY:
        case BlendMode.HARDLIGHT:
        case BlendMode.ALPHA:
        case BlendMode.ERASE:
        case BlendMode.SHADER:
          return true;
      }
      return false;
    }
  }
}
