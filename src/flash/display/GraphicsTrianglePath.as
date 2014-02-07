package flash.display {
public final class GraphicsTrianglePath implements IGraphicsPath, IGraphicsData {
    public function GraphicsTrianglePath(vertices:Vector = null, indices:Vector = null, uvtData:Vector = null, culling:String = "none") {}
    public var indices:Vector;
    public var vertices:Vector;
    public var uvtData:Vector;
    public function get culling():String { notImplemented("culling"); return ""; }
    public function set culling(value:String):void { notImplemented("culling"); }
  }
}
