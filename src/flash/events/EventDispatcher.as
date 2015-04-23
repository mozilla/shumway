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
[native(cls='EventDispatcherClass')]
public class EventDispatcher implements IEventDispatcher {
  public native function EventDispatcher(target:IEventDispatcher = null);
  public native function toString():String;
  public native function addEventListener(type:String, listener:Function,
                                          useCapture:Boolean = false, priority:int = 0,
                                          useWeakReference:Boolean = false):void;
  public native function removeEventListener(type:String, listener:Function,
                                             useCapture:Boolean = false):void;
  public native function hasEventListener(type:String):Boolean;
  public native function willTrigger(type:String):Boolean;
  public native function dispatchEvent(event:Event):Boolean;
}
}
