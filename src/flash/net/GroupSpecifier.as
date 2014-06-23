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
public class GroupSpecifier {
  public function GroupSpecifier(name:String) {
  }
  public static function encodePostingAuthorization(password:String):String {
    notImplemented("encodePostingAuthorization");
    return "";
  }
  public static function encodePublishAuthorization(password:String):String {
    notImplemented("encodePublishAuthorization");
    return "";
  }
  public static function encodeIPMulticastAddressSpec(address:String, port = null, source:String = null):String {
    notImplemented("encodeIPMulticastAddressSpec");
    return "";
  }
  public static function encodeBootstrapPeerIDSpec(peerID:String):String {
    notImplemented("encodeBootstrapPeerIDSpec");
    return "";
  }
  public function makeUnique():void {
    notImplemented("makeUnique");
  }
  public function get routingEnabled():Boolean {
    notImplemented("routingEnabled");
    return false;
  }
  public function set routingEnabled(enabled:Boolean):void {
    notImplemented("routingEnabled");
  }
  public function get multicastEnabled():Boolean {
    notImplemented("multicastEnabled");
    return false;
  }
  public function set multicastEnabled(enabled:Boolean):void {
    notImplemented("multicastEnabled");
  }
  public function get objectReplicationEnabled():Boolean {
    notImplemented("objectReplicationEnabled");
    return false;
  }
  public function set objectReplicationEnabled(enabled:Boolean):void {
    notImplemented("objectReplicationEnabled");
  }
  public function get postingEnabled():Boolean {
    notImplemented("postingEnabled");
    return false;
  }
  public function set postingEnabled(enabled:Boolean):void {
    notImplemented("postingEnabled");
  }
  public function get peerToPeerDisabled():Boolean {
    notImplemented("peerToPeerDisabled");
    return false;
  }
  public function set peerToPeerDisabled(disable:Boolean):void {
    notImplemented("peerToPeerDisabled");
  }
  public function get ipMulticastMemberUpdatesEnabled():Boolean {
    notImplemented("ipMulticastMemberUpdatesEnabled");
    return false;
  }
  public function set ipMulticastMemberUpdatesEnabled(enabled:Boolean):void {
    notImplemented("ipMulticastMemberUpdatesEnabled");
  }
  public function setPublishPassword(password:String = null, salt:String = null):void {
    notImplemented("setPublishPassword");
  }
  public function setPostingPassword(password:String = null, salt:String = null):void {
    notImplemented("setPostingPassword");
  }
  public function get serverChannelEnabled():Boolean {
    notImplemented("serverChannelEnabled");
    return false;
  }
  public function set serverChannelEnabled(enabled:Boolean):void {
    notImplemented("serverChannelEnabled");
  }
  public function addBootstrapPeer(peerID:String):void {
    notImplemented("addBootstrapPeer");
  }
  public function addIPMulticastAddress(address:String, port = null, source:String = null):void {
    notImplemented("addIPMulticastAddress");
  }
  public function toString():String {
    notImplemented("toString");
    return "";
  }
  public function groupspecWithoutAuthorizations():String {
    notImplemented("groupspecWithoutAuthorizations");
    return "";
  }
  public function groupspecWithAuthorizations():String {
    notImplemented("groupspecWithAuthorizations");
    return "";
  }
  public function authorizations():String {
    notImplemented("authorizations");
    return "";
  }
}
}
