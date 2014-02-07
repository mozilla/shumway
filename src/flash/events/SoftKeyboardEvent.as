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

public class SoftKeyboardEvent extends Event {
  public static const SOFT_KEYBOARD_ACTIVATE:String = "softKeyboardActivate";
  public static const SOFT_KEYBOARD_DEACTIVATE:String = "softKeyboardDeactivate";
  public static const SOFT_KEYBOARD_ACTIVATING:String = "softKeyboardActivating";
  private var _relatedObjectVal:InteractiveObject;
  private var _triggerTypeVal:String;
  public function SoftKeyboardEvent(type:String, bubbles:Boolean, cancelable:Boolean,
                                    relatedObjectVal:InteractiveObject, triggerTypeVal:String)
  {
    super(type, bubbles, cancelable);
    _relatedObjectVal = relatedObjectVal;
    _triggerTypeVal = triggerTypeVal;
  }
  public function get triggerType():String {
    return _triggerTypeVal;
  }
  public function get relatedObjectVal():InteractiveObject {
    return _relatedObjectVal;
  }
  public function set relatedObjectVal(value:InteractiveObject):void {
    _relatedObjectVal = value;
  }

  public override function clone():Event {
    return new SoftKeyboardEvent(type, bubbles, cancelable, relatedObjectVal, triggerType);
  }

  public override function toString():String {
    return formatToString('SoftKeyboardEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'relatedObject', 'triggerType');
  }
}
}
