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

[native(cls="NetConnectionClass")]
public class NetConnection extends EventDispatcher {
  public native function NetConnection();
  public static native function get defaultObjectEncoding():uint;
  public static native function set defaultObjectEncoding(version:uint):void;
  public native function get connected():Boolean;
  public native function get uri():String;
  public native function close():void;
  public native function addHeader(operation:String, mustUnderstand:Boolean = false, param:Object = null):void;
  public native function call(command:String, responder:Responder /* more args can be provided */):void;
  public native function connect(command:String):void;
  public native function get client():Object;
  public native function set client(object:Object):void;
  public native function get objectEncoding():uint;
  public native function set objectEncoding(version:uint):void;
  public native function get proxyType():String;
  public native function set proxyType(ptype:String):void;
  public native function get connectedProxyType():String;
  public native function get usingTLS():Boolean;
  public native function get protocol():String;
  public native function get maxPeerConnections():uint;
  public native function set maxPeerConnections(maxPeers:uint):void;
  public native function get nearID():String;
  public native function get farID():String;
  public native function get nearNonce():String;
  public native function get farNonce():String;
  public native function get unconnectedPeerStreams():Array;
}
}
