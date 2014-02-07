package flash.display {
public final class GraphicsStroke implements IGraphicsStroke, IGraphicsData {
    public function GraphicsStroke(thickness:Number = NaN, pixelHinting:Boolean = false, scaleMode:String = "normal", caps:String = "none", joints:String = "round", miterLimit:Number = 3, fill:IGraphicsFill = null) {}
    public var thickness:Number;
    public var pixelHinting:Boolean;
    public function get caps():String { notImplemented("caps"); return ""; }
    public function set caps(value:String):void { notImplemented("caps"); }
    public function get joints():String { notImplemented("joints"); return ""; }
    public function set joints(value:String) { notImplemented("joints"); }
    public var miterLimit:Number;
    public function get scaleMode():String { notImplemented("scaleMode"); return ""; }
    public function set scaleMode(value:String):void { notImplemented("scaleMode"); }
    public var fill:IGraphicsFill;
  }
}
