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

package flash.display {
import flash.accessibility.AccessibilityImplementation;
import flash.geom.Rectangle;
import flash.ui.ContextMenu;

[native(cls='InteractiveObjectClass')]
public class InteractiveObject extends DisplayObject {
  public native function InteractiveObject()
  public native function get tabEnabled():Boolean;
  public native function set tabEnabled(enabled:Boolean):void;
  public native function get tabIndex():int;
  public native function set tabIndex(index:int):void;
  public native function get focusRect():Object;
  public native function set focusRect(focusRect:Object):void;
  public native function get mouseEnabled():Boolean;
  public native function set mouseEnabled(enabled:Boolean):void;
  public native function get doubleClickEnabled():Boolean;
  public native function set doubleClickEnabled(enabled:Boolean):void;
  public native function get accessibilityImplementation():AccessibilityImplementation;
  public native function set accessibilityImplementation(value:AccessibilityImplementation):void;
  public native function get softKeyboardInputAreaOfInterest():Rectangle;
  public native function set softKeyboardInputAreaOfInterest(value:Rectangle):void;
  public native function get needsSoftKeyboard():Boolean;
  public native function set needsSoftKeyboard(value:Boolean):void;
  public native function get contextMenu():ContextMenu;
  public native function set contextMenu(cm:ContextMenu):void;
  public native function requestSoftKeyboard():Boolean;
}
}
