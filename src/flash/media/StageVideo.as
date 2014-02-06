package flash.media {
  import flash.events.EventDispatcher;
  import __AS3__.vec.Vector;
  import String;
  import flash.geom.Rectangle;
  import flash.geom.Point;
  import flash.net.NetStream;
  import int;
  import flash.media.Camera;
  import flash.events.StageVideoEvent;
  public class StageVideo extends EventDispatcher {
    public function StageVideo() {}
    public native function attachNetStream(netStream:NetStream):void;
    public native function attachCamera(theCamera:Camera):void;
    public native function get viewPort():Rectangle;
    public native function set viewPort(rect:Rectangle):void;
    public native function set pan(point:Point):void;
    public native function get pan():Point;
    public native function set zoom(point:Point):void;
    public native function get zoom():Point;
    public native function set depth(depth:int):void;
    public native function get depth():int;
    public native function get videoWidth():int;
    public native function get videoHeight():int;
    public native function get colorSpaces():Vector;
  }
}
