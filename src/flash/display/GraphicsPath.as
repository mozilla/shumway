package flash.display {
public final class GraphicsPath implements IGraphicsPath, IGraphicsData {
    public function GraphicsPath(commands:Vector = null, data:Vector = null, winding:String = "evenOdd") {}
    public var commands:Vector;
    public var data:Vector;
    public function get winding():String { notImplemented("winding"); return ""; }
    public function set winding(value:String) { notImplemented("winding"); }
    public function moveTo(x:Number, y:Number):void { notImplemented("moveTo"); }
    public function lineTo(x:Number, y:Number):void { notImplemented("lineTo"); }
    public function curveTo(controlX:Number, controlY:Number, anchorX:Number, anchorY:Number):void { notImplemented("curveTo"); }
    public function cubicCurveTo(controlX1:Number, controlY1:Number, controlX2:Number, controlY2:Number, anchorX:Number, anchorY:Number):void { notImplemented("cubicCurveTo"); }
    public function wideLineTo(x:Number, y:Number):void { notImplemented("wideLineTo"); }
    public function wideMoveTo(x:Number, y:Number):void { notImplemented("wideMoveTo"); }
  }
}
