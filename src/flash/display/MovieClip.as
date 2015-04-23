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
[native(cls='MovieClipClass')]
public dynamic class MovieClip extends Sprite {
  public native function MovieClip();
  public native function get currentFrame():int;
  public native function get framesLoaded():int;
  public native function get totalFrames():int;
  public native function get trackAsMenu():Boolean;
  public native function set trackAsMenu(value:Boolean):void;
  public native function get scenes():Array;
  public native function get currentScene():Scene;
  public native function get currentLabel():String;
  public native function get currentFrameLabel():String;
  public native function get currentLabels():Array;
  public native function get enabled():Boolean;
  public native function set enabled(value:Boolean):void;
  public native function get isPlaying():Boolean;
  public native function play():void;
  public native function stop():void;
  public native function nextFrame():void;
  public native function prevFrame():void;
  public native function gotoAndPlay(frame:Object, scene:String = null):void;
  public native function gotoAndStop(frame:Object, scene:String = null):void;
  public native function addFrameScript(... arguments):void;
  public native function prevScene():void;
  public native function nextScene():void;
}
}
