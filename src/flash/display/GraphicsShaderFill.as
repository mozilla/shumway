package flash.display {
  import flash.display.IGraphicsData;
  import Object;
  import flash.display.IGraphicsFill;
  import flash.geom.Matrix;
  import flash.display.Shader;
  public final class GraphicsShaderFill implements IGraphicsFill, IGraphicsData {
    public function GraphicsShaderFill(shader:Shader = null, matrix:Matrix = null) {}
    public var shader:Shader;
    public var matrix:Matrix;
  }
}
