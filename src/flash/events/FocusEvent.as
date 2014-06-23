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

public class FocusEvent extends Event {
  public static const FOCUS_IN:String = "focusIn";
  public static const FOCUS_OUT:String = "focusOut";
  public static const KEY_FOCUS_CHANGE:String = "keyFocusChange";
  public static const MOUSE_FOCUS_CHANGE:String = "mouseFocusChange";
  private var _relatedObject:InteractiveObject;
  private var _shiftKey:Boolean;
  private var _keyCode:uint;
  private var _isRelatedObjectInaccessible:Boolean;
  public function FocusEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false,
                             relatedObject:InteractiveObject = null,
                             shiftKey:Boolean = false, keyCode:uint = 0)
  {
    super(type, bubbles, cancelable);
    _relatedObject = relatedObject;
    _shiftKey = shiftKey;
    _keyCode = keyCode;
  }
  public function get relatedObject():InteractiveObject {
    return _relatedObject;
  }
  public function set relatedObject(value:InteractiveObject):void {
    _relatedObject = value;
  }
  public function get shiftKey():Boolean {
    return _shiftKey;
  }
  public function set shiftKey(value:Boolean):void {
    _shiftKey = value;
  }
  public function get keyCode():uint {
    return _keyCode;
  }
  public function set keyCode(value:uint):void {
    _keyCode = value;
  }
  public function get isRelatedObjectInaccessible():Boolean {
    return _isRelatedObjectInaccessible;
  }
  public function set isRelatedObjectInaccessible(value:Boolean):void {
    _isRelatedObjectInaccessible = value;
  }
  public override function clone():Event {
    var event:FocusEvent = new FocusEvent(type, bubbles, cancelable, _relatedObject, _shiftKey,
                                          _keyCode);
    event.isRelatedObjectInaccessible = isRelatedObjectInaccessible;
    return event;
  }
  public override function toString():String {
    return formatToString('FocusEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'shiftKey', 'keyCode');
  }
}
}
