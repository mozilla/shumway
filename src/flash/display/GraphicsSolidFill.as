package flash.display {
  import flash.display.IGraphicsData;
  import Object;
  import flash.display.IGraphicsFill;
  public final class GraphicsSolidFill implements IGraphicsFill, IGraphicsData {
    public function GraphicsSolidFill(color:uint = 0, alpha:Number = 1) {}
    public var color:uint;
    public var alpha:Number = 1;
  }
}
