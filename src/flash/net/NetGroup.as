package flash.net {
  import flash.events.EventDispatcher;
  import flash.net.NetConnection;
  import String;
  import Boolean;
  import uint;
  import Number;
  import int;
  import Object;
  import flash.net.NetGroupInfo;
  import RangeError;
  import Error;
  import flash.events.NetStatusEvent;
  public class NetGroup extends EventDispatcher {
    public function NetGroup(connection:NetConnection, groupspec:String) {}
    public function close():void { notImplemented("close"); }
    public function get replicationStrategy():String { notImplemented("replicationStrategy"); }
    public function set replicationStrategy(s:String):void { notImplemented("replicationStrategy"); }
    public function addHaveObjects(startIndex:Number, endIndex:Number):void { notImplemented("addHaveObjects"); }
    public function removeHaveObjects(startIndex:Number, endIndex:Number):void { notImplemented("removeHaveObjects"); }
    public function addWantObjects(startIndex:Number, endIndex:Number):void { notImplemented("addWantObjects"); }
    public function removeWantObjects(startIndex:Number, endIndex:Number):void { notImplemented("removeWantObjects"); }
    public function writeRequestedObject(requestID:int, object:Object):void { notImplemented("writeRequestedObject"); }
    public function denyRequestedObject(requestID:int):void { notImplemented("denyRequestedObject"); }
    public function get estimatedMemberCount():Number { notImplemented("estimatedMemberCount"); }
    public function get neighborCount():Number { notImplemented("neighborCount"); }
    public function get receiveMode():String { notImplemented("receiveMode"); }
    public function set receiveMode(mode:String) { notImplemented("receiveMode"); }
    public native function get info():NetGroupInfo;
    public native function convertPeerIDToGroupAddress(peerID:String):String;
    public native function get localCoverageFrom():String;
    public native function get localCoverageTo():String;
    public function post(message:Object):String { notImplemented("post"); }
    public function sendToNearest(message:Object, groupAddress:String):String { notImplemented("sendToNearest"); }
    public function sendToNeighbor(message:Object, sendMode:String):String { notImplemented("sendToNeighbor"); }
    public function sendToAllNeighbors(message:Object):String { notImplemented("sendToAllNeighbors"); }
    public function addNeighbor(peerID:String):Boolean { notImplemented("addNeighbor"); }
    public function addMemberHint(peerID:String):Boolean { notImplemented("addMemberHint"); }
  }
}
