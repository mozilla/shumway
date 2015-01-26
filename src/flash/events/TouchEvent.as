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

package flash.events {
import flash.display.InteractiveObject;

[native(cls='TouchEventClass')]
public class TouchEvent extends Event {
  public static const TOUCH_BEGIN:String = "touchBegin";
  public static const TOUCH_END:String = "touchEnd";
  public static const TOUCH_MOVE:String = "touchMove";
  public static const TOUCH_OVER:String = "touchOver";
  public static const TOUCH_OUT:String = "touchOut";
  public static const TOUCH_ROLL_OVER:String = "touchRollOver";
  public static const TOUCH_ROLL_OUT:String = "touchRollOut";
  public static const TOUCH_TAP:String = "touchTap";
  public static const PROXIMITY_BEGIN:String = "proximityBegin";
  public static const PROXIMITY_END:String = "proximityEnd";
  public static const PROXIMITY_MOVE:String = "proximityMove";
  public static const PROXIMITY_OUT:String = "proximityOut";
  public static const PROXIMITY_OVER:String = "proximityOver";
  public static const PROXIMITY_ROLL_OUT:String = "proximityRollOut";
  public static const PROXIMITY_ROLL_OVER:String = "proximityRollOver";

  public function TouchEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false,
                             touchPointID:int = 0, isPrimaryTouchPoint:Boolean = false,
                             localX:Number = NaN, localY:Number = NaN, sizeX:Number = NaN,
                             sizeY:Number = NaN, pressure:Number = NaN,
                             relatedObject:InteractiveObject = null, ctrlKey:Boolean = false,
                             altKey:Boolean = false, shiftKey:Boolean = false)
  {
    super(type, bubbles, cancelable);
    this.touchPointID = touchPointID;
    this.isPrimaryTouchPoint = isPrimaryTouchPoint;
    this.localX = localX;
    this.localY = localY;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.pressure = pressure;
    this.relatedObject = relatedObject;
    this.ctrlKey = ctrlKey;
    this.altKey = altKey;
    this.shiftKey = shiftKey;
  }

  public native function get touchPointID():int;
  public native function set touchPointID(value:int):void;
  public native function get isPrimaryTouchPoint():Boolean;
  public native function set isPrimaryTouchPoint(value:Boolean):void;
  public native function get localX():Number;
  public native function set localX(value:Number):void;
  public native function get localY():Number;
  public native function set localY(value:Number):void;
  public native function get sizeX():Number;
  public native function set sizeX(value:Number):void;
  public native function get sizeY():Number;
  public native function set sizeY(value:Number):void;
  public native function get pressure():Number;
  public native function set pressure(value:Number):void;
  public native function get relatedObject():InteractiveObject;
  public native function set relatedObject(value:InteractiveObject):void;
  public native function get ctrlKey():Boolean;
  public native function set ctrlKey(value:Boolean):void;
  public native function get altKey():Boolean;
  public native function set altKey(value:Boolean):void;
  public native function get shiftKey():Boolean;
  public native function set shiftKey(value:Boolean):void;
  public native function get stageX():Number;
  public native function get stageY():Number;
  public native function get isRelatedObjectInaccessible():Boolean;
  public native function set isRelatedObjectInaccessible(value:Boolean):void;

  public override native function clone():Event;
  public override native function toString():String;
  public native function updateAfterEvent():void;
}
}
