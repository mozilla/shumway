package flash.display {
  import flash.display.IGraphicsStroke;
  import flash.display.IGraphicsData;
  import Object;
  import flash.display.IGraphicsFill;
  import flash.display.CapsStyle;
  import flash.display.LineScaleMode;
  import flash.display.JointStyle;
  import Error;
  import ArgumentError;
  public final class GraphicsStroke implements IGraphicsStroke, IGraphicsData {
    public function GraphicsStroke(thickness:Number = NaN, pixelHinting:Boolean = false, scaleMode:String = "normal", caps:String = "none", joints:String = "round", miterLimit:Number = 3, fill:IGraphicsFill = null) {}
    public var thickness:Number;
    public var pixelHinting:Boolean;
    public function get caps():String { notImplemented("caps"); }
    public function set caps(value:String):void { notImplemented("caps"); }
    public function get joints():String { notImplemented("joints"); }
    public function set joints(value:String) { notImplemented("joints"); }
    public var miterLimit:Number;
    public function get scaleMode():String { notImplemented("scaleMode"); }
    public function set scaleMode(value:String):void { notImplemented("scaleMode"); }
    public var fill:IGraphicsFill;
  }
}
