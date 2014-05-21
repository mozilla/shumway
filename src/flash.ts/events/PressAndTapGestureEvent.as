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
[native(cls='PressAndTapGestureEventClass')]
public class PressAndTapGestureEvent extends GestureEvent {
  public static const GESTURE_PRESS_AND_TAP:String = "gesturePressAndTap";
  private var _tapLocalX:Number;
  private var _tapLocalY:Number;
  public function PressAndTapGestureEvent(type:String, bubbles:Boolean = true,
                                          cancelable:Boolean = false, phase:String = null,
                                          localX:Number = 0, localY:Number = 0,
                                          tapLocalX:Number = 0, tapLocalY:Number = 0,
                                          ctrlKey:Boolean = false, altKey:Boolean = false,
                                          shiftKey:Boolean = false)
  {
    super(type, bubbles, cancelable, phase, localX, localY, ctrlKey, altKey, shiftKey);
    _tapLocalX = tapLocalX;
    _tapLocalY = tapLocalY;
  }
  public function get tapLocalX():Number {
    return _tapLocalX;
  }
  public function set tapLocalX(value:Number):void {
    _tapLocalX = value;
  }
  public function get tapLocalY():Number {
    return _tapLocalY;
  }
  public function set tapLocalY(value:Number):void {
    _tapLocalY = value;
  }
  public function get tapStageX():Number { notImplemented("tapStageX"); return 0; }
  public function get tapStageY():Number { notImplemented("tapStageY"); return 0; }
  public override function clone():Event {
    return new PressAndTapGestureEvent(type, bubbles, cancelable, phase, localX, localY,
                                       tapLocalX, tapLocalY, ctrlKey, altKey, shiftKey);
  }
  public override function toString():String {
    return formatToString('PressAndTapGestureEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'localX', 'localY', 'tapLocalX', 'tapLocalY',
                          'ctrlKey', 'altKey', 'shiftKey');
  }
}
}
