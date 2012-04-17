package flash.geom {

  [native(cls="PerspectiveProjectionClass")]
  // [Version("10")]
  [compat]
  public class PerspectiveProjection {
    public function PerspectiveProjection() {}
    private native function ctor():void;
    public native function get fieldOfView():Number;
    public native function set fieldOfView(fieldOfViewAngleInDegrees:Number):void;
    public native function get projectionCenter():Point;
    public native function set projectionCenter(p:Point);
    public native function get focalLength():Number;
    public native function set focalLength(value:Number):void;
    public native function toMatrix3D():Matrix3D;
  }

}
