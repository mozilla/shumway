/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package flash.display {
import flash.geom.Matrix;

public final class GraphicsGradientFill implements IGraphicsFill, IGraphicsData {
  public function GraphicsGradientFill(type:String = "linear", colors:Array = null,
                                       alphas:Array = null, ratios:Array = null, matrix = null,
                                       spreadMethod:* = "pad", interpolationMethod:String = "rgb",
                                       focalPointRatio:Number = 0)
  {
    _type = type;
    this.colors = colors;
    this.alphas = alphas;
    this.ratios = ratios;
    this.matrix = matrix;
    _spreadMethod = spreadMethod;
    _interpolationMethod = interpolationMethod;
    this.focalPointRatio = focalPointRatio;
  }
  public var colors:Array;
  public var alphas:Array;
  public var ratios:Array;
  public var matrix:Matrix;
  public var focalPointRatio:Number;
  private var _type:String;
  private var _spreadMethod;
  private var _interpolationMethod:String;
  public function get type():String {
    return _type;
  }
  public function set type(value:String):void {
    _type = value;
  }
  public function get spreadMethod():* {
    return _spreadMethod;
  }
  public function set spreadMethod(value):void {
    _spreadMethod = value;
  }
  public function get interpolationMethod():String {
    return _interpolationMethod;
  }
  public function set interpolationMethod(value:String):void {
    _interpolationMethod = value;
  }
}
}
