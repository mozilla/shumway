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
  private var _touchPointID:int;
  private var _isPrimaryTouchPoint:Boolean;
  private var _localX:Number;
  private var _localY:Number;
  private var _sizeX:Number;
  private var _sizeY:Number;
  private var _pressure:Number;
  private var _relatedObject:InteractiveObject;
  private var _ctrlKey:Boolean;
  private var _altKey:Boolean;
  private var _shiftKey:Boolean;
  private var _isRelatedObjectInaccessible:Boolean;
  public function TouchEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false,
                             touchPointID:int = 0, isPrimaryTouchPoint:Boolean = false,
                             localX:Number = NaN, localY:Number = NaN, sizeX:Number = NaN,
                             sizeY:Number = NaN, pressure:Number = NaN,
                             relatedObject:InteractiveObject = null, ctrlKey:Boolean = false,
                             altKey:Boolean = false, shiftKey:Boolean = false)
  {
    super(type, bubbles, cancelable);
    _touchPointID = touchPointID;
    _isPrimaryTouchPoint = isPrimaryTouchPoint;
    _localX = localX;
    _localY = localY;
    _sizeX = sizeX;
    _sizeY = sizeY;
    _pressure = pressure;
    _relatedObject = relatedObject;
    _ctrlKey = ctrlKey;
    _altKey = altKey;
    _shiftKey = shiftKey;
  }
  public function get touchPointID():int {
    return _touchPointID;
  }
  public function set touchPointID(value:int):void {
    _touchPointID = value;
  }
  public function get isPrimaryTouchPoint():Boolean {
    return _isPrimaryTouchPoint;
  }
  public function set isPrimaryTouchPoint(value:Boolean):void {
    _isPrimaryTouchPoint = value;
  }
  public function get localX():Number {
    return _localX;
  }
  public function set localX(value:Number):void {
    _localX = value;
  }
  public function get localY():Number {
    return _localY;
  }
  public function set localY(value:Number):void {
    _localY = value;
  }
  public function get sizeX():Number {
    return _sizeX;
  }
  public function set sizeX(value:Number):void {
    _sizeX = value;
  }
  public function get sizeY():Number {
    return _sizeY;
  }
  public function set sizeY(value:Number):void {
    _sizeY = value;
  }
  public function get pressure():Number {
    return _pressure;
  }
  public function set pressure(value:Number):void {
    _pressure = value;
  }
  public function get relatedObject():InteractiveObject {
    return _relatedObject;
  }
  public function set relatedObject(value:InteractiveObject):void {
    _relatedObject = value;
  }
  public function get ctrlKey():Boolean {
    return _ctrlKey;
  }
  public function set ctrlKey(value:Boolean):void {
    _ctrlKey = value;
  }
  public function get altKey():Boolean {
    return _altKey;
  }
  public function set altKey(value:Boolean):void {
    _altKey = value;
  }
  public function get shiftKey():Boolean {
    return _shiftKey;
  }
  public function set shiftKey(value:Boolean):void {
    _shiftKey = value;
  }
  public function get stageX():Number { notImplemented("stageX"); return 0; }
  public function get stageY():Number { notImplemented("stageY"); return 0; }
  public function get isRelatedObjectInaccessible():Boolean {
    return _isRelatedObjectInaccessible;
  }
  public function set isRelatedObjectInaccessible(value:Boolean):void {
    _isRelatedObjectInaccessible = value;
  }
  public override function clone():Event {
    return new TouchEvent(type, bubbles, cancelable, touchPointID, isPrimaryTouchPoint, localX,
                          localY, sizeX, sizeY, pressure, relatedObject, ctrlKey, altKey, shiftKey);
  }
  public override function toString():String {
    return formatToString('TouchEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'touchPointID', 'isPrimaryTouchPoint', 'localX', 'localY', 'sizeX',
                          'sizeY', 'pressure', 'relatedObject', 'ctrlKey', 'altKey', 'shiftKey');
  }
  public native function updateAfterEvent():void;
}
}
