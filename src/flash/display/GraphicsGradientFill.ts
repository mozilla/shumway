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
// Class: GraphicsGradientFill
module Shumway.AVMX.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVMX.asCoerceString;
  export class GraphicsGradientFill extends ASObject implements IGraphicsFill, IGraphicsData {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["colors", "alphas", "ratios", "matrix", "focalPointRatio", "_type", "_spreadMethod", "_interpolationMethod", "type", "type", "spreadMethod", "spreadMethod", "interpolationMethod", "interpolationMethod"];
    
    constructor (type: string = "linear", colors: any [] = null, alphas: any [] = null, ratios: any [] = null, matrix: any = null, spreadMethod: any = "pad", interpolationMethod: string = "rgb", focalPointRatio: number = 0) {
      super();
      this.type = asCoerceString(type);
      this.colors = colors;
      this.alphas = alphas;
      this.ratios = ratios;
      this.matrix = matrix;
      this.spreadMethod = spreadMethod;
      this.interpolationMethod = asCoerceString(interpolationMethod);
      this.focalPointRatio = +focalPointRatio;
    }
    
    // JS -> AS Bindings
    
    colors: any [];
    alphas: any [];
    ratios: any [];
    matrix: flash.geom.Matrix;
    focalPointRatio: number;
    type: string;
    spreadMethod: any;
    interpolationMethod: string;
    
    // AS -> JS Bindings
    
    // _type: string;
    // _interpolationMethod: string;
  }
}
