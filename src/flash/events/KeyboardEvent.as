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

[native(cls='KeyboardEventClass')]
public class KeyboardEvent extends Event {
  public static const KEY_DOWN:String = "keyDown";
  public static const KEY_UP:String = "keyUp";
  private var _charCode:uint;
  private var _keyCode:uint;
  private var _keyLocation:uint;
  private var _ctrlKey:Boolean;
  private var _altKey:Boolean;
  private var _shiftKey:Boolean;
  public function KeyboardEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false,
                                charCodeValue:uint = 0, keyCodeValue:uint = 0,
                                keyLocationValue:uint = 0, ctrlKeyValue:Boolean = false,
                                altKeyValue:Boolean = false, shiftKeyValue:Boolean = false)
  {
    super(type, bubbles, cancelable);
    _charCode = charCodeValue;
    _keyCode = keyCodeValue;
    _keyLocation = keyLocationValue;
    _ctrlKey = ctrlKeyValue;
    _altKey = altKeyValue;
    _shiftKey = shiftKeyValue;
  }
  public function get charCode():uint {
    return _charCode;
  }
  public function set charCode(value:uint):void {
    _charCode = value;
  }
  public function get keyCode():uint {
    return _keyCode;
  }
  public function set keyCode(value:uint):void {
    _keyCode = value;
  }
  public function get keyLocation():uint {
    return _keyLocation;
  }
  public function set keyLocation(value:uint):void {
    _keyLocation = value;
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
  public override function clone():Event {
    return new KeyboardEvent(type, bubbles, cancelable, charCode, keyCode, keyLocation, ctrlKey,
                               altKey, shiftKey);
  }
  public override function toString():String {
    return formatToString('KeyboardEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'charCode', 'keyCode', 'keyLocation', 'ctrlKey', 'altKey', 'shiftKey');
  }
  public native function updateAfterEvent():void;
}
}
