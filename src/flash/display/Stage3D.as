package flash.display {
import flash.display3D.Context3D;
import flash.events.EventDispatcher;

public class Stage3D extends EventDispatcher {
    public function Stage3D() {}
    public native function get context3D():Context3D;
    public native function requestContext3D(context3DRenderMode:String = "auto", profile:String = "baseline"):void;
    public native function get x():Number;
    public native function set x(value:Number):void;
    public native function get y():Number;
    public native function set y(value:Number):void;
    public native function get visible():Boolean;
    public native function set visible(value:Boolean):void;
  }
}
