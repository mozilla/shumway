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
// Class: InterpolationMethod
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import GradientInterpolationMethod = Shumway.GradientInterpolationMethod;
  export class InterpolationMethod extends ASNative {
    
    static classInitializer: any = null;
    static initializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.InterpolationMethod");
    }
    
    // JS -> AS Bindings
    static RGB: string = "rgb";
    static LINEAR_RGB: string = "linearRGB";
    
    
    // AS -> JS Bindings

    static fromNumber(n: number): string {
      switch (n) {
        case GradientInterpolationMethod.RGB:
          return InterpolationMethod.RGB;
        case GradientInterpolationMethod.LinearRGB:
          return InterpolationMethod.LINEAR_RGB;
        default:
          return null;
      }
    }

    static toNumber(value: string): number {
      switch (value) {
        case InterpolationMethod.RGB:
          return GradientInterpolationMethod.RGB;
        case InterpolationMethod.LINEAR_RGB:
          return GradientInterpolationMethod.LinearRGB;
        default:
          return -1;
      }
    }
  }
}
