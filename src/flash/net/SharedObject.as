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

package flash.net {
import flash.events.EventDispatcher;

[native(cls="SharedObjectClass")]
public class SharedObject extends EventDispatcher {
  public native function SharedObject();
  public static native function deleteAll(url:String):int;
  public static native function getDiskUsage(url:String):int;
  public static native function getLocal(name:String, localPath:String = null, secure:Boolean = false):SharedObject;
  public static native function getRemote(name:String, remotePath:String = null, persistence:Object = false, secure:Boolean = false):SharedObject;
  public static native function get defaultObjectEncoding():uint;
  public static native function set defaultObjectEncoding(version:uint):void;
  public native function get data():Object;
  public native function connect(myConnection:NetConnection, params:String = null):void;
  public native function close():void;
  public native function flush(minDiskSpace:int = 0):String;
  public native function get size():uint;
  public native function set fps(updatesPerSecond:Number):void;
  public native function send():void;
  public native function clear():void;
  public native function get objectEncoding():uint;
  public native function set objectEncoding(version:uint):void;
  public native function get client():Object;
  public native function set client(object:Object):void;
  public native function setDirty(propertyName:String):void;
  public native function setProperty(propertyName:String, value:Object = null):void;
}
}
