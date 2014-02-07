package flash.net {
import flash.events.EventDispatcher;

public class NetGroup extends EventDispatcher {
    public function NetGroup(connection:NetConnection, groupspec:String) {}
    public function close():void { notImplemented("close"); }
    public function get replicationStrategy():String { notImplemented("replicationStrategy"); return ""; }
    public function set replicationStrategy(s:String):void { notImplemented("replicationStrategy"); }
    public function addHaveObjects(startIndex:Number, endIndex:Number):void { notImplemented("addHaveObjects"); }
    public function removeHaveObjects(startIndex:Number, endIndex:Number):void { notImplemented("removeHaveObjects"); }
    public function addWantObjects(startIndex:Number, endIndex:Number):void { notImplemented("addWantObjects"); }
    public function removeWantObjects(startIndex:Number, endIndex:Number):void { notImplemented("removeWantObjects"); }
    public function writeRequestedObject(requestID:int, object:Object):void { notImplemented("writeRequestedObject"); }
    public function denyRequestedObject(requestID:int):void { notImplemented("denyRequestedObject"); }
    public function get estimatedMemberCount():Number { notImplemented("estimatedMemberCount"); return -1; }
    public function get neighborCount():Number { notImplemented("neighborCount"); return -1; }
    public function get receiveMode():String { notImplemented("receiveMode"); return ""; }
    public function set receiveMode(mode:String) { notImplemented("receiveMode"); }
    public native function get info():NetGroupInfo;
    public native function convertPeerIDToGroupAddress(peerID:String):String;
    public native function get localCoverageFrom():String;
    public native function get localCoverageTo():String;
    public function post(message:Object):String { notImplemented("post"); return ""; }
    public function sendToNearest(message:Object, groupAddress:String):String { notImplemented("sendToNearest"); return ""; }
    public function sendToNeighbor(message:Object, sendMode:String):String { notImplemented("sendToNeighbor"); return ""; }
    public function sendToAllNeighbors(message:Object):String { notImplemented("sendToAllNeighbors"); return ""; }
    public function addNeighbor(peerID:String):Boolean { notImplemented("addNeighbor"); return false; }
    public function addMemberHint(peerID:String):Boolean { notImplemented("addMemberHint"); return false; }
  }
}
