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
// Class: GradientType
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GradientType extends ASNative {
    
    static classInitializer: any = null;
    static initializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.GradientType");
    }
    
    // JS -> AS Bindings
    static LINEAR: string = "linear";
    static RADIAL: string = "radial";
    
    
    // AS -> JS Bindings

    static fromNumber(n: number): string {
      switch (n) {
        case Shumway.GradientType.Linear:
          return GradientType.LINEAR;
        case Shumway.GradientType.Radial:
          return GradientType.RADIAL;
        default:
          return null;
      }
    }

    static toNumber(value: string): number {
      switch (value) {
        case GradientType.LINEAR:
          return Shumway.GradientType.Linear;
        case GradientType.RADIAL:
          return Shumway.GradientType.Radial;
        default:
          return -1;
      }
    }
  }
}
