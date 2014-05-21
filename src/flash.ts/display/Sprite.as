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
import flash.geom.Rectangle;
import flash.media.SoundTransform;

[native(cls='SpriteClass')]
public class Sprite extends DisplayObjectContainer {
  public native function Sprite();
  public native function get graphics():Graphics;
  public native function get buttonMode():Boolean;
  public native function set buttonMode(value:Boolean):void;
  public native function get dropTarget():DisplayObject;
  public native function get hitArea():Sprite;
  public native function set hitArea(value:Sprite):void;
  public native function get useHandCursor():Boolean;
  public native function set useHandCursor(value:Boolean):void;
  public native function get soundTransform():SoundTransform;
  public native function set soundTransform(sndTransform:SoundTransform):void;
  public native function startDrag(lockCenter:Boolean = false, bounds:Rectangle = null):void;
  public native function stopDrag():void;
  public native function startTouchDrag(touchPointID:int, lockCenter:Boolean = false,
                                        bounds:Rectangle = null):void;
  public native function stopTouchDrag(touchPointID:int):void;
}
}
