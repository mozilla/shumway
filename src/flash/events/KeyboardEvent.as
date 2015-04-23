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

  public function KeyboardEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false,
                                charCodeValue:uint = 0, keyCodeValue:uint = 0,
                                keyLocationValue:uint = 0, ctrlKeyValue:Boolean = false,
                                altKeyValue:Boolean = false, shiftKeyValue:Boolean = false)
  {
    super(type, bubbles, cancelable);
    charCode = charCodeValue;
    keyCode = keyCodeValue;
    keyLocation = keyLocationValue;
    ctrlKey = ctrlKeyValue;
    altKey = altKeyValue;
    shiftKey = shiftKeyValue;
  }
  public native function get charCode():uint;
  public native function set charCode(value:uint):void;
  public native function get keyCode():uint;
  public native function set keyCode(value:uint):void;
  public native function get keyLocation():uint;
  public native function set keyLocation(value:uint):void;
  public native function get ctrlKey():Boolean;
  public native function set ctrlKey(value:Boolean):void;
  public native function get altKey():Boolean;
  public native function set altKey(value:Boolean):void;
  public native function get shiftKey():Boolean;
  public native function set shiftKey(value:Boolean):void;

  public override native function clone():Event;
  public override native function toString():String;
  public native function updateAfterEvent():void;
}
}
