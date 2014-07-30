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
import flash.geom.Point;
import flash.text.TextSnapshot;

[native(cls='ContainerClass')]
public class DisplayObjectContainer extends InteractiveObject {
  public native function DisplayObjectContainer()
  public native function get numChildren():int;
  public native function get textSnapshot():TextSnapshot;
  public native function get tabChildren():Boolean;
  public native function set tabChildren(enable:Boolean):void;
  public native function get mouseChildren():Boolean;
  public native function set mouseChildren(enable:Boolean):void;
  public native function addChild(child:DisplayObject):DisplayObject;
  public native function addChildAt(child:DisplayObject, index:int):DisplayObject;
  public native function removeChild(child:DisplayObject):DisplayObject;
  public native function removeChildAt(index:int):DisplayObject;
  public native function getChildIndex(child:DisplayObject):int;
  public native function setChildIndex(child:DisplayObject, index:int):void;
  public native function getChildAt(index:int):DisplayObject;
  public native function getChildByName(name:String):DisplayObject;
  public native function getObjectsUnderPoint(point:Point):Array;
  public native function areInaccessibleObjectsUnderPoint(point:Point):Boolean;
  public native function contains(child:DisplayObject):Boolean;
  public native function swapChildrenAt(index1:int, index2:int):void;
  public native function swapChildren(child1:DisplayObject, child2:DisplayObject):void;
  public native function removeChildren(beginIndex:int = 0, endIndex:int = 2147483647):void;
}
}
