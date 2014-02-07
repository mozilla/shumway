package flash.display {
import flash.geom.Matrix;

public final class GraphicsShaderFill implements IGraphicsFill, IGraphicsData {
    public function GraphicsShaderFill(shader:Shader = null, matrix:Matrix = null) {}
    public var shader:Shader;
    public var matrix:Matrix;
  }
}
