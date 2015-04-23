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
import flash.filters.BitmapFilter;
import flash.geom.ColorTransform;
import flash.geom.Matrix;
import flash.geom.Point;
import flash.geom.Rectangle;
import flash.utils.ByteArray;

[native(cls='BitmapDataClass')]
public class BitmapData implements IBitmapDrawable {
  public native function BitmapData(width:int, height:int, transparent:Boolean = true, fillColor:uint = 4294967295);
  public native function get width():int;
  public native function get height():int;
  public native function get transparent():Boolean;
  public native function get rect():Rectangle;
  public native function clone():BitmapData;
  public native function getPixel(x:int, y:int):uint;
  public native function getPixel32(x:int, y:int):uint;
  public native function setPixel(x:int, y:int, color:uint):void;
  public native function setPixel32(x:int, y:int, color:uint):void;
  public native function applyFilter(sourceBitmapData:BitmapData, sourceRect:Rectangle,
                                     destPoint:Point, filter:BitmapFilter):void;
  public native function colorTransform(rect:Rectangle, colorTransform:ColorTransform):void;
  public native function compare(otherBitmapData:BitmapData):Object;
  public native function copyChannel(sourceBitmapData:BitmapData, sourceRect:Rectangle,
                                     destPoint:Point, sourceChannel:uint, destChannel:uint):void;
  public native function copyPixels(sourceBitmapData:BitmapData, sourceRect:Rectangle,
                                    destPoint:Point, alphaBitmapData:BitmapData = null,
                                    alphaPoint:Point = null, mergeAlpha:Boolean = false):void;
  public native function dispose():void;
  public native function draw(source:IBitmapDrawable, matrix:Matrix = null,
                              colorTransform:ColorTransform = null, blendMode:String = null,
                              clipRect:Rectangle = null, smoothing:Boolean = false):void;
  public native function drawWithQuality(source:IBitmapDrawable, matrix:Matrix = null,
                                         colorTransform:ColorTransform = null,
                                         blendMode:String = null, clipRect:Rectangle = null,
                                         smoothing:Boolean = false, quality:String = null):void;
  public native function fillRect(rect:Rectangle, color:uint):void;
  public native function floodFill(x:int, y:int, color:uint):void;
  public native function generateFilterRect(sourceRect:Rectangle, filter:BitmapFilter):Rectangle;
  public native function getColorBoundsRect(mask:uint, color:uint,
                                            findColor:Boolean = true):Rectangle;
  public native function getPixels(rect:Rectangle):ByteArray;
  public native function copyPixelsToByteArray(rect:Rectangle, data:ByteArray):void;
  public native function getVector(rect:Rectangle):Vector;
  public native function hitTest(firstPoint:Point, firstAlphaThreshold:uint, secondObject:Object,
                                 secondBitmapDataPoint:Point = null,
                                 secondAlphaThreshold:uint = 1):Boolean;
  public native function merge(sourceBitmapData:BitmapData, sourceRect:Rectangle, destPoint:Point,
                               redMultiplier:uint, greenMultiplier:uint, blueMultiplier:uint,
                               alphaMultiplier:uint):void;
  public native function noise(randomSeed:int, low:uint = 0, high:uint = 255,
                               channelOptions:uint = 7, grayScale:Boolean = false):void;
  public native function paletteMap(sourceBitmapData:BitmapData, sourceRect:Rectangle,
                                    destPoint:Point, redArray:Array = null, greenArray:Array = null,
                                    blueArray:Array = null, alphaArray:Array = null):void;
  public native function perlinNoise(baseX:Number, baseY:Number, numOctaves:uint, randomSeed:int,
                                     stitch:Boolean, fractalNoise:Boolean, channelOptions:uint = 7,
                                     grayScale:Boolean = false, offsets:Array = null):void;
  public native function pixelDissolve(sourceBitmapData:BitmapData, sourceRect:Rectangle,
                                       destPoint:Point, randomSeed:int = 0, numPixels:int = 0,
                                       fillColor:uint = 0):int;
  public native function scroll(x:int, y:int):void;
  public native function setPixels(rect:Rectangle, inputByteArray:ByteArray):void;
  public native function setVector(rect:Rectangle, inputVector:Vector):void;
  public native function threshold(sourceBitmapData:BitmapData, sourceRect:Rectangle,
                                   destPoint:Point, operation:String, threshold:uint,
                                   color:uint = 0, mask:uint = 4294967295,
                                   copySource:Boolean = false):uint;
  public native function lock():void;
  public native function unlock(changeRect:Rectangle = null):void;
  public native function histogram(hRect:Rectangle = null):Vector;
  public native function encode(rect:Rectangle, compressor:Object,
                                byteArray:ByteArray = null):ByteArray;
}
}
