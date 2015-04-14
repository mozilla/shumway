/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *totalMemory
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

[native(cls='GraphicsClass')]
public final class Graphics {
  public native function Graphics();
  public native function clear():void;
  public native function beginFill(color:uint, alpha:Number = 1):void;
  public native function beginGradientFill(type:String, colors:Array, alphas:Array, ratios:Array,
                                           matrix:Matrix = null, spreadMethod:String = "pad",
                                           interpolationMethod:String = "rgb",
                                           focalPointRatio:Number = 0):void;
  public native function beginBitmapFill(bitmap:BitmapData, matrix:Matrix = null,
                                         repeat:Boolean = true, smooth:Boolean = false):void;
//  public native function beginShaderFill(shader:Shader, matrix:Matrix = null):void;
  public native function lineGradientStyle(type:String, colors:Array, alphas:Array, ratios:Array,
                                           matrix:Matrix = null, spreadMethod:String = "pad",
                                           interpolationMethod:String = "rgb",
                                           focalPointRatio:Number = 0):void;
  public native function lineStyle(thickness:Number = void 0, color:uint = 0, alpha:Number = 1,
                                   pixelHinting:Boolean = false, scaleMode:String = "normal",
                                   caps:String = null, joints:String = null,
                                   miterLimit:Number = 3):void;
  public native function drawRect(x:Number, y:Number, width:Number, height:Number):void;
  public native function drawRoundRect(x:Number, y:Number, width:Number, height:Number,
                                       ellipseWidth:Number, ellipseHeight:Number):void;
  public native function drawRoundRectComplex(x:Number, y:Number, width:Number, height:Number,
                                              topLeftRadius:Number, topRightRadius:Number,
                                              bottomLeftRadius:Number,
                                              bottomRightRadius:Number):void;
  public native function drawCircle(x:Number, y:Number, radius:Number):void;
  public native function drawEllipse(x:Number, y:Number, width:Number, height:Number):void;
  public native function moveTo(x:Number, y:Number):void;
  public native function lineTo(x:Number, y:Number):void;
  public native function curveTo(controlX:Number, controlY:Number, anchorX:Number,
                                 anchorY:Number):void;
  public native function cubicCurveTo(controlX1:Number, controlY1:Number, controlX2:Number,
                                      controlY2:Number, anchorX:Number, anchorY:Number):void;
  public native function endFill():void;
  public native function copyFrom(sourceGraphics:Graphics):void;
  public native function lineBitmapStyle(bitmap:BitmapData, matrix:Matrix = null,
                                         repeat:Boolean = true, smooth:Boolean = false):void;
//  public native function lineShaderStyle(shader:Shader, matrix:Matrix = null):void;
  public native function drawPath(commands:Vector, data:Vector, winding:String = "evenOdd"):void;
  public native function drawTriangles(vertices:Vector, indices:Vector = null,
                                       uvtData:Vector = null, culling:String = "none"):void;
  public native function drawGraphicsData(graphicsData:Vector):void;
}
}
