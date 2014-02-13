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
public class TransformGestureEvent extends GestureEvent {
  public static const GESTURE_ZOOM:String = "gestureZoom";
  public static const GESTURE_PAN:String = "gesturePan";
  public static const GESTURE_ROTATE:String = "gestureRotate";
  public static const GESTURE_SWIPE:String = "gestureSwipe";
  private var _scaleX:Number;
  private var _scaleY:Number;
  private var _rotation:Number;
  private var _offsetX:Number;
  private var _offsetY:Number;
  public function TransformGestureEvent(type:String, bubbles:Boolean = true,
                                        cancelable:Boolean = false, phase:String = null,
                                        localX:Number = 0, localY:Number = 0, scaleX:Number = 1,
                                        scaleY:Number = 1, rotation:Number = 0, offsetX:Number = 0,
                                        offsetY:Number = 0, ctrlKey:Boolean = false,
                                        altKey:Boolean = false, shiftKey:Boolean = false)
  {
    super(type, bubbles, cancelable, phase, localX, localY, ctrlKey, altKey, shiftKey);
    _scaleX = scaleX;
    _scaleY = scaleY;
    _rotation = rotation;
    _offsetX = offsetX;
    _offsetY = offsetY;
  }
  public function get scaleX():Number {
    return _scaleX;
  }
  public function set scaleX(value:Number):void {
    _scaleX = value;
  }
  public function get scaleY():Number {
    return _scaleY;
  }
  public function set scaleY(value:Number):void {
    _scaleY = value;
  }
  public function get rotation():Number {
    return _rotation;
  }
  public function set rotation(value:Number):void {
    _rotation = value;
  }
  public function get offsetX():Number {
    return _offsetX;
  }
  public function set offsetX(value:Number):void {
    _offsetX = value;
  }
  public function get offsetY():Number {
    return _offsetY;
  }
  public function set offsetY(value:Number):void {
    _offsetY = value;
  }
  public override function clone():Event {
    return new TransformGestureEvent(type, bubbles, cancelable, phase, localX, localY, scaleX,
                                     scaleY, rotation, offsetX, offsetY, ctrlKey, altKey, shiftKey);
  }
  public override function toString():String {
    return formatToString('TransformGestureEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'phase', 'localX', 'localY', 'scaleX', 'scaleY', 'rotation', 'offsetX',
                          'offsetY', 'ctrlKey', 'altKey', 'shiftKey');
  }
}
}
