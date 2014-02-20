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

package flash.system {
import flash.events.EventDispatcher;

[native(cls='MessageChannelClass')]
public final class MessageChannel extends EventDispatcher {
  public function MessageChannel() {}
  public native function get messageAvailable():Boolean;
  public native function get state():String;
  public override function addEventListener(type:String, listener:Function,
                                            useCapture:Boolean = false, priority:int = 0,
                                            useWeakReference:Boolean = false):void { notImplemented("addEventListener"); }
  public override function removeEventListener(type:String, listener:Function,
                                               useCapture:Boolean = false):void { notImplemented("removeEventListener"); }
  public override function toString():String {
    notImplemented("toString");
    return "";
  }
  public native function send(arg, queueLimit:int = -1):void;
  public native function receive(blockUntilReceived:Boolean = false);
  public native function close():void;
}
}
