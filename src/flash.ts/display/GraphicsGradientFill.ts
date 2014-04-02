/**
 * Copyright 2013 Mozilla Foundation
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
 * limitations undxr the License.
 */
// Class: GraphicsGradientFill
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GraphicsGradientFill extends ASNative implements IGraphicsFill, IGraphicsData {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["colors", "alphas", "ratios", "matrix", "focalPointRatio", "_type", "_spreadMethod", "_interpolationMethod", "type", "type", "spreadMethod", "spreadMethod", "interpolationMethod", "interpolationMethod"];
    
    constructor (type: string = "linear", colors: any [] = null, alphas: any [] = null, ratios: any [] = null, matrix: any = null, spreadMethod: any = "pad", interpolationMethod: string = "rgb", focalPointRatio: number = 0) {
      type = "" + type; colors = colors; alphas = alphas; ratios = ratios; interpolationMethod = "" + interpolationMethod; focalPointRatio = +focalPointRatio;
      false && super();
      notImplemented("Dummy Constructor: public flash.display.GraphicsGradientFill");
    }
    
    // JS -> AS Bindings
    
    colors: any [];
    alphas: any [];
    ratios: any [];
    matrix: flash.geom.Matrix;
    focalPointRatio: number;
    _type: string;
    _spreadMethod: any;
    _interpolationMethod: string;
    type: string;
    spreadMethod: any;
    interpolationMethod: string;
    
    // AS -> JS Bindings
    
    // _type: string;
    // _interpolationMethod: string;
  }
}
