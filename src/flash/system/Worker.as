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

[native(cls='WorkerClass')]
public final class Worker extends EventDispatcher {
  public static native function get isSupported():Boolean;
  public static function get current():Worker {
    notImplemented("current");
    return null;
  }
  public function Worker() {}
  public native function get isPrimordial():Boolean;
  public function get state():String {
    notImplemented("state");
    return "";
  }
  public override function addEventListener(type:String, listener:Function,
                                            useCapture:Boolean = false, priority:int = 0,
                                            useWeakReference:Boolean = false):void { notImplemented("addEventListener"); }
  public override function removeEventListener(type:String, listener:Function,
                                               useCapture:Boolean = false):void { notImplemented("removeEventListener"); }
  public native function createMessageChannel(receiver:Worker):MessageChannel;
  public function start():void { notImplemented("start"); }
  public function setSharedProperty(key:String, value):void { notImplemented("setSharedProperty"); }
  public function getSharedProperty(key:String) { notImplemented("getSharedProperty"); }
  public native function terminate():Boolean;
}
}
