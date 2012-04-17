package flash.geom {

  import flash.display.DisplayObject;

  [native(cls="TransformClass")]
  public class Transform {
    public function Transform(displayObject:DisplayObject) {}

    public native function get matrix():Matrix;
    public native function set matrix(value:Matrix):void;
    public native function get colorTransform():ColorTransform;
    public native function set colorTransform(value:ColorTransform):void;
    public native function get concatenatedMatrix():Matrix;
    public native function get concatenatedColorTransform():ColorTransform;
    public native function get pixelBounds():Rectangle;
    private native function ctor(displayObject:DisplayObject):void;

    // [Version("10")]
    [compat]
    public native function get matrix3D():Matrix3D;
    // [Version("10")]
    [compat]
    public native function set matrix3D(m:Matrix3D);
    // [Version("10")]
    [compat]
    public native function getRelativeMatrix3D(relativeTo:DisplayObject):Matrix3D;
    // [Version("10")]
    [compat]
    public native function get perspectiveProjection():PerspectiveProjection;
    // [Version("10")]
    [compat]
    public native function set perspectiveProjection(pm:PerspectiveProjection):void;
  }

}
