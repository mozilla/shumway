package flash.net {
  import Object;
  import RegExp;
  import Error;
  import flash.utils.ByteArray;
  import RangeError;
  import Error;
  import flash.utils.ByteArray;
  import ArgumentError;
  public class GroupSpecifier {
    public function GroupSpecifier(name:String) {}
    public static function encodePostingAuthorization(password:String):String { notImplemented("encodePostingAuthorization"); }
    public static function encodePublishAuthorization(password:String):String { notImplemented("encodePublishAuthorization"); }
    public static function encodeIPMulticastAddressSpec(address:String, port = null, source:String = null):String { notImplemented("encodeIPMulticastAddressSpec"); }
    public static function encodeBootstrapPeerIDSpec(peerID:String):String { notImplemented("encodeBootstrapPeerIDSpec"); }
    public function makeUnique():void { notImplemented("makeUnique"); }
    public function get routingEnabled():Boolean { notImplemented("routingEnabled"); }
    public function set routingEnabled(enabled:Boolean):void { notImplemented("routingEnabled"); }
    public function get multicastEnabled():Boolean { notImplemented("multicastEnabled"); }
    public function set multicastEnabled(enabled:Boolean):void { notImplemented("multicastEnabled"); }
    public function get objectReplicationEnabled():Boolean { notImplemented("objectReplicationEnabled"); }
    public function set objectReplicationEnabled(enabled:Boolean):void { notImplemented("objectReplicationEnabled"); }
    public function get postingEnabled():Boolean { notImplemented("postingEnabled"); }
    public function set postingEnabled(enabled:Boolean):void { notImplemented("postingEnabled"); }
    public function get peerToPeerDisabled():Boolean { notImplemented("peerToPeerDisabled"); }
    public function set peerToPeerDisabled(disable:Boolean):void { notImplemented("peerToPeerDisabled"); }
    public function get ipMulticastMemberUpdatesEnabled():Boolean { notImplemented("ipMulticastMemberUpdatesEnabled"); }
    public function set ipMulticastMemberUpdatesEnabled(enabled:Boolean):void { notImplemented("ipMulticastMemberUpdatesEnabled"); }
    public function setPublishPassword(password:String = null, salt:String = null):void { notImplemented("setPublishPassword"); }
    public function setPostingPassword(password:String = null, salt:String = null):void { notImplemented("setPostingPassword"); }
    public function get serverChannelEnabled():Boolean { notImplemented("serverChannelEnabled"); }
    public function set serverChannelEnabled(enabled:Boolean):void { notImplemented("serverChannelEnabled"); }
    public function addBootstrapPeer(peerID:String):void { notImplemented("addBootstrapPeer"); }
    public function addIPMulticastAddress(address:String, port = null, source:String = null):void { notImplemented("addIPMulticastAddress"); }
    public function toString():String { notImplemented("toString"); }
    public function groupspecWithoutAuthorizations():String { notImplemented("groupspecWithoutAuthorizations"); }
    public function groupspecWithAuthorizations():String { notImplemented("groupspecWithAuthorizations"); }
    public function authorizations():String { notImplemented("authorizations"); }
  }
}
