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
[native(cls='GestureEventClass')]
public class GestureEvent extends Event {
  public static const GESTURE_TWO_FINGER_TAP:String = "gestureTwoFingerTap";
  private var _phase:String;
  private var _localX:Number;
  private var _localY:Number;
  private var _ctrlKey:Boolean;
  private var _altKey:Boolean;
  private var _shiftKey:Boolean;
  public function GestureEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false,
                               phase:String = null, localX:Number = 0, localY:Number = 0,
                               ctrlKey:Boolean = false, altKey:Boolean = false,
                               shiftKey:Boolean = false)
  {
    super(type, bubbles, cancelable);
    _phase = phase;
    _localX = localX;
    _localY = localY;
    _ctrlKey = ctrlKey;
    _altKey = altKey;
    _shiftKey = shiftKey;
  }
  public native function get localX():Number;
  public native function set localX(value:Number):void;
  public native function get localY():Number;
  public native function set localY(value:Number):void;

  public function get phase():String {
    return _phase;
  }
  public function set phase(value:String):void {
    _phase = value;
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
  public override function clone():Event {
    return new GestureEvent(type, bubbles, cancelable, phase, localX, localY, ctrlKey, altKey,
                            shiftKey);
  }
  public override function toString():String {
    return formatToString('GestureEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'localX', 'localY', 'ctrlKey', 'altKey', 'shiftKey');
  }
  public native function updateAfterEvent():void;
}
}
