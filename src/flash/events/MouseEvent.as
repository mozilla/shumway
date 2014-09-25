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

[native(cls='MouseEventClass')]
public class MouseEvent extends Event {
  public static const CLICK:String = "click";
  public static const DOUBLE_CLICK:String = "doubleClick";
  public static const MOUSE_DOWN:String = "mouseDown";
  public static const MOUSE_MOVE:String = "mouseMove";
  public static const MOUSE_OUT:String = "mouseOut";
  public static const MOUSE_OVER:String = "mouseOver";
  public static const MOUSE_UP:String = "mouseUp";
  public static const RELEASE_OUTSIDE:String = "releaseOutside";
  public static const MOUSE_WHEEL:String = "mouseWheel";
  public static const ROLL_OUT:String = "rollOut";
  public static const ROLL_OVER:String = "rollOver";
  public static const MIDDLE_CLICK:String = "middleClick";
  public static const MIDDLE_MOUSE_DOWN:String = "middleMouseDown";
  public static const MIDDLE_MOUSE_UP:String = "middleMouseUp";
  public static const RIGHT_CLICK:String = "rightClick";
  public static const RIGHT_MOUSE_DOWN:String = "rightMouseDown";
  public static const RIGHT_MOUSE_UP:String = "rightMouseUp";
  public static const CONTEXT_MENU:String = "contextMenu";

  public function MouseEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false,
                             localX:Number = void 0, localY:Number = void 0,
                             relatedObject:InteractiveObject = null, ctrlKey:Boolean = false,
                             altKey:Boolean = false, shiftKey:Boolean = false,
                             buttonDown:Boolean = false, delta:int = 0)
  {
    super(type, bubbles, cancelable);
    this.localX = localX;
    this.localY = localY;
    this.relatedObject = relatedObject;
    this.ctrlKey = ctrlKey;
    this.altKey = altKey;
    this.shiftKey = shiftKey;
    this.buttonDown = buttonDown;
    this.delta = delta;
  }
  public native function get localX():Number;
  public native function set localX(value:Number):void;

  public native function get localY():Number;
  public native function set localY(value:Number):void;

  public native function get stageX():Number;
  public native function get stageY():Number;

  public native function get movementX():Number;
  public native function set movementX(value:Number):void;

  public native function get movementY():Number;
  public native function set movementY(value:Number):void;

  public native function get delta():int;
  public native function set delta(value:int):void;

  public native function get ctrlKey():Boolean;
  public native function set ctrlKey(value:Boolean):void;

  public native function get altKey():Boolean;
  public native function set altKey(value:Boolean):void;

  public native function get shiftKey():Boolean;
  public native function set shiftKey(value:Boolean):void;

  public native function get buttonDown():Boolean;
  public native function set buttonDown(value:Boolean):void;

  public native function get relatedObject():InteractiveObject;
  public native function set relatedObject(value:InteractiveObject):void;

  public native function get isRelatedObjectInaccessible():Boolean;
  public native function set isRelatedObjectInaccessible(value:Boolean):void;

  public native override function clone():Event;
  public native override function toString():String;
  public native function updateAfterEvent():void;
}
}
