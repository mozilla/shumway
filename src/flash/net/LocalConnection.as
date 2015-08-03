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

[native(cls="LocalConnectionClass")]
public class LocalConnection extends EventDispatcher {
  public native function LocalConnection();
  public static native function get isSupported():Boolean;
  public native function close():void;
  public native function connect(connectionName:String):void;
  public native function get domain():String;
  public native function send(connectionName:String, methodName:String):void;
  public native function get client():Object;
  public native function set client(client:Object):void;
  public native function get isPerUser():Boolean;
  public native function set isPerUser(newValue:Boolean):void;
  public native function allowDomain(...domains):void;
  public native function allowInsecureDomain(...domains):void;
}
}
