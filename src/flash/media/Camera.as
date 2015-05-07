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

package flash.media {
import flash.display.BitmapData;
import flash.events.EventDispatcher;
import flash.geom.Rectangle;
import flash.utils.ByteArray;

[native(cls='CameraClass')]
public final class Camera extends EventDispatcher {
    public static native function get names():Array;
    public static native function get isSupported():Boolean;
    public static native function getCamera(name:String = null):Camera;
    internal static native function _scanHardware():void;
    public function Camera() {}
    public native function get activityLevel():Number;
    public native function get bandwidth():int;
    public native function get currentFPS():Number;
    public native function get fps():Number;
    public native function get height():int;
    public native function get index():int;
    public native function get keyFrameInterval():int;
    public native function get loopback():Boolean;
    public native function get motionLevel():int;
    public native function get motionTimeout():int;
    public native function get muted():Boolean;
    public native function get name():String;
    public native function get quality():int;
    public native function get width():int;
    public native function setCursor(value:Boolean):void;
    public native function setKeyFrameInterval(keyFrameInterval:int):void;
    public native function setLoopback(compress:Boolean = false):void;
    public native function setMode(width:int, height:int, fps:Number, favorArea:Boolean = true):void;
    public native function setMotionLevel(motionLevel:int, timeout:int = 2000):void;
    public native function setQuality(bandwidth:int, quality:int):void;
    public native function drawToBitmapData(destination:BitmapData):void;
    public native function copyToByteArray(rect:Rectangle, destination:ByteArray):void;
    public native function copyToVector(rect:Rectangle, destination:Vector):void;
  }
}
