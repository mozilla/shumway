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

public class ContextMenuEvent extends Event {
  public static const MENU_ITEM_SELECT:String = "menuItemSelect";
  public static const MENU_SELECT:String = "menuSelect";
  private var _mouseTarget:InteractiveObject;
  private var _contextMenuOwner:InteractiveObject;
  private var _isMouseTargetInaccessible:Boolean;
  public function ContextMenuEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                                   mouseTarget:InteractiveObject = null,
                                   contextMenuOwner:InteractiveObject = null)
  {
    super(type, bubbles, cancelable);
    _mouseTarget = mouseTarget;
    _contextMenuOwner = contextMenuOwner;
  }
  public function get mouseTarget():InteractiveObject {
    return _mouseTarget;
  }
  public function set mouseTarget(value:InteractiveObject):void {
    _mouseTarget = value;
  }
  public function get contextMenuOwner():InteractiveObject {
    return _contextMenuOwner;
  }
  public function set contextMenuOwner(value:InteractiveObject):void {
    _contextMenuOwner = value;
  }
  public function get isMouseTargetInaccessible():Boolean {
    return _isMouseTargetInaccessible;
  }
  public function set isMouseTargetInaccessible(value:Boolean):void {
    _isMouseTargetInaccessible = value;
  }
  public override function clone():Event {
    var event:ContextMenuEvent = new ContextMenuEvent(type, bubbles, cancelable,
                                                      mouseTarget, contextMenuOwner);
    event.isMouseTargetInaccessible = isMouseTargetInaccessible;
    return event;
  }
  public override function toString():String {
    return formatToString('ContextMenuEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'mouseTarget', 'contextMenuOwner', 'isMouseTargetInaccessible');
  }
}
}
