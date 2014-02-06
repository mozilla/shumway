package flash.geom {
  import Object;
  import flash.geom.Rectangle;
  import flash.geom.Matrix;
  import flash.display.DisplayObject;
  import flash.geom.Matrix3D;
  import flash.geom.PerspectiveProjection;
  import flash.geom.ColorTransform;
  public class Transform {
    public function Transform(displayObject:DisplayObject) {}
    public native function get matrix():Matrix;
    public native function set matrix(value:Matrix):void;
    public native function get colorTransform():ColorTransform;
    public native function set colorTransform(value:ColorTransform):void;
    public native function get concatenatedMatrix():Matrix;
    public native function get concatenatedColorTransform():ColorTransform;
    public native function get pixelBounds():Rectangle;
    public native function get matrix3D():Matrix3D;
    public native function set matrix3D(m:Matrix3D);
    public native function getRelativeMatrix3D(relativeTo:DisplayObject):Matrix3D;
    public native function get perspectiveProjection():PerspectiveProjection;
    public native function set perspectiveProjection(pm:PerspectiveProjection):void;
  }
}
