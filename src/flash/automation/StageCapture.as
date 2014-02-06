package flash.automation {
  import flash.events.EventDispatcher;
  import String;
  import flash.geom.Rectangle;
  import flash.display.BitmapData;
  public class StageCapture extends EventDispatcher {
    public function StageCapture() {}
    public static const CURRENT:String = "current";
    public static const NEXT:String = "next";
    public static const MULTIPLE:String = "multiple";
    public static const RASTER:String = "raster";
    public static const STAGE:String = "stage";
    public static const SCREEN:String = "screen";
    public native function capture(type:String):void;
    public native function cancel():void;
    public native function set fileNameBase(value:String):void;
    public native function get fileNameBase():String;
    public native function set clipRect(value:Rectangle):void;
    public native function get clipRect():Rectangle;
    public native function captureBitmapData():BitmapData;
    public native function set captureSource(value:String):void;
    public native function get captureSource():String;
  }
}
