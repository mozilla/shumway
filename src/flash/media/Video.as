package flash.media {
import flash.display.DisplayObject;
import flash.net.NetStream;

public class Video extends DisplayObject {
    public function Video(width:int = 320, height:int = 240) {}
    public native function get deblocking():int;
    public native function set deblocking(value:int):void;
    public native function get smoothing():Boolean;
    public native function set smoothing(value:Boolean):void;
    public native function get videoWidth():int;
    public native function get videoHeight():int;
    public native function clear():void;
    public native function attachNetStream(netStream:NetStream):void;
    public native function attachCamera(camera:Camera):void;
  }
}
