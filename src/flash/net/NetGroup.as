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

[native(cls="NetGroupClass")]
public class NetGroup extends EventDispatcher {
  public function NetGroup(connection:NetConnection, groupspec:String) {
  }
  public function close():void {
    notImplemented("close");
  }
  public function get replicationStrategy():String {
    notImplemented("replicationStrategy");
    return "";
  }
  public function set replicationStrategy(s:String):void {
    notImplemented("replicationStrategy");
  }
  public function addHaveObjects(startIndex:Number, endIndex:Number):void {
    notImplemented("addHaveObjects");
  }
  public function removeHaveObjects(startIndex:Number, endIndex:Number):void {
    notImplemented("removeHaveObjects");
  }
  public function addWantObjects(startIndex:Number, endIndex:Number):void {
    notImplemented("addWantObjects");
  }
  public function removeWantObjects(startIndex:Number, endIndex:Number):void {
    notImplemented("removeWantObjects");
  }
  public function writeRequestedObject(requestID:int, object:Object):void {
    notImplemented("writeRequestedObject");
  }
  public function denyRequestedObject(requestID:int):void {
    notImplemented("denyRequestedObject");
  }
  public function get estimatedMemberCount():Number {
    notImplemented("estimatedMemberCount");
    return -1;
  }
  public function get neighborCount():Number {
    notImplemented("neighborCount");
    return -1;
  }
  public function get receiveMode():String {
    notImplemented("receiveMode");
    return "";
  }
  public function set receiveMode(mode:String) {
    notImplemented("receiveMode");
  }
  public native function get info():NetGroupInfo;
  public native function convertPeerIDToGroupAddress(peerID:String):String;
  public native function get localCoverageFrom():String;
  public native function get localCoverageTo():String;
  public function post(message:Object):String {
    notImplemented("post");
    return "";
  }
  public function sendToNearest(message:Object, groupAddress:String):String {
    notImplemented("sendToNearest");
    return "";
  }
  public function sendToNeighbor(message:Object, sendMode:String):String {
    notImplemented("sendToNeighbor");
    return "";
  }
  public function sendToAllNeighbors(message:Object):String {
    notImplemented("sendToAllNeighbors");
    return "";
  }
  public function addNeighbor(peerID:String):Boolean {
    notImplemented("addNeighbor");
    return false;
  }
  public function addMemberHint(peerID:String):Boolean {
    notImplemented("addMemberHint");
    return false;
  }
}
}
