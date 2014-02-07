package flash.geom {
public class Utils3D {
    public function Utils3D() {}
    public static native function projectVector(m:Matrix3D, v:Vector3D):Vector3D;
    public static native function projectVectors(m:Matrix3D, verts:Vector, projectedVerts:Vector, uvts:Vector):void;
    public static native function pointTowards(percent:Number, mat:Matrix3D, pos:Vector3D, at:Vector3D = null, up:Vector3D = null):Matrix3D;
  }
}
