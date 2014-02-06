package flash.display {
  import flash.display.IGraphicsData;
  import Object;
  import flash.display.IGraphicsFill;
  import flash.geom.Matrix;
  import flash.display.BitmapData;
  public final class GraphicsBitmapFill implements IGraphicsFill, IGraphicsData {
    public function GraphicsBitmapFill(bitmapData:BitmapData = null, matrix:Matrix = null, repeat:Boolean = true, smooth:Boolean = false) {}
    public var bitmapData:BitmapData;
    public var matrix:Matrix;
    public var repeat:Boolean;
    public var smooth:Boolean;
  }
}
