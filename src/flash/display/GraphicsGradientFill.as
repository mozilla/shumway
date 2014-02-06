package flash.display {
  import flash.display.IGraphicsData;
  import Object;
  import flash.display.IGraphicsFill;
  import flash.geom.Matrix;
  import flash.display.SpreadMethod;
  import Error;
  import ArgumentError;
  import flash.display.InterpolationMethod;
  import flash.display.GradientType;
  public final class GraphicsGradientFill implements IGraphicsFill, IGraphicsData {
    public function GraphicsGradientFill(type:String = "linear", colors:Array = null, alphas:Array = null, ratios:Array = null, matrix = null, spreadMethod = "pad", interpolationMethod:String = "rgb", focalPointRatio:Number = 0) {}
    public function get type():String { notImplemented("type"); }
    public function set type(value:String) { notImplemented("type"); }
    public var colors:Array;
    public var alphas:Array;
    public var ratios:Array;
    public var matrix:Matrix;
    public function get spreadMethod():String { notImplemented("spreadMethod"); }
    public function set spreadMethod(value:String) { notImplemented("spreadMethod"); }
    public function get interpolationMethod():String { notImplemented("interpolationMethod"); }
    public function set interpolationMethod(value:String) { notImplemented("interpolationMethod"); }
    public var focalPointRatio:Number;
  }
}
