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
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class GraphicsGradientFill extends ASObject implements IGraphicsFill, IGraphicsData {

    static classInitializer: any = null;

    constructor(type: string = "linear", colors: ASArray = null, alphas: ASArray = null,
                ratios: ASArray = null, matrix: any = null, spreadMethod: any = "pad",
                interpolationMethod: string = "rgb", focalPointRatio: number = 0)
    {
      super();
      this.type = axCoerceString(type);
      this.colors = colors;
      this.alphas = alphas;
      this.ratios = ratios;
      this.matrix = matrix;
      this.spreadMethod = spreadMethod;
      this.interpolationMethod = axCoerceString(interpolationMethod);
      this.focalPointRatio = +focalPointRatio;
    }

    colors: ASArray;
    alphas: ASArray;
    ratios: ASArray;
    matrix: flash.geom.Matrix;
    focalPointRatio: number;
    type: string;
    spreadMethod: any;
    interpolationMethod: string;
  }
}
