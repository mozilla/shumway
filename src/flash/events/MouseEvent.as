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

  private var _relatedObject:InteractiveObject;
  private var _ctrlKey:Boolean;
  private var _altKey:Boolean;
  private var _shiftKey:Boolean;
  private var _buttonDown:Boolean;
  private var _delta:int;
  private var _isRelatedObjectInaccessible:Boolean;

  public function MouseEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false,
                             localX:Number = void 0, localY:Number = void 0,
                             relatedObject:InteractiveObject = null, ctrlKey:Boolean = false,
                             altKey:Boolean = false, shiftKey:Boolean = false,
                             buttonDown:Boolean = false, delta:int = 0)
  {
    super(type, bubbles, cancelable);
    this.localX = localX;
    this.localY = localY;
    _relatedObject = relatedObject;
    _ctrlKey = ctrlKey;
    _altKey = altKey;
    _shiftKey = shiftKey;
    _buttonDown = buttonDown;
    _delta = delta;
  }
  public native function get localX():Number;
  public native function set localX(value:Number):void;
  public native function get localY():Number;
  public native function set localY(value:Number):void;

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
  public function get buttonDown():Boolean {
    return _buttonDown;
  }
  public function set buttonDown(value:Boolean):void {
    _buttonDown = value;
  }
  public function get delta():int {
    return _delta;
  }
  public function set delta(value:int):void {
    _delta = value;
  }
  public function get stageX():Number {
    if (isNaN(localX + localY)) {
      return Number.NaN;
    }
    return getStageX();
  }
  public function get stageY():Number {
    if (isNaN(localX + localY)) {
      return Number.NaN;
    }
    return getStageY();
  }
  public function get isRelatedObjectInaccessible():Boolean {
    return _isRelatedObjectInaccessible;
  }
  public function set isRelatedObjectInaccessible(value:Boolean):void {
    _isRelatedObjectInaccessible = value;
  }
  public native function get movementX():Number;
  public native function set movementX(value:Number):void;
  public native function get movementY():Number;
  public native function set movementY(value:Number):void;
  public override function clone():Event {
    return new MouseEvent(type, bubbles, cancelable, localX, localY, relatedObject, ctrlKey,
                          altKey, shiftKey, buttonDown, delta);
  }
  public override function toString():String {
    return formatToString('MouseEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'localX', "localY", 'relatedObject', 'ctrlKey', 'altKey', 'shiftKey',
                          'buttonDown', 'delta');
  }
  public native function updateAfterEvent():void;

  private native function getStageX():Number;
  private native function getStageY():Number;
}
}
