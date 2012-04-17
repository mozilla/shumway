package flash.geom {

  [native(cls="Matrix3DClass")]
  // [Version("10")]
  [compat]
  public class Matrix3D {
    public function Matrix3D(v:Vector=null) {}
    public static native function interpolate(thisMat:Matrix3D, toMat:Matrix3D, percent:Number):Matrix3D;
    private native function ctor(v:Vector):void;
    public native function clone():Matrix3D;
    public native function copyToMatrix3D(dest:Matrix3D):void;
    public native function get rawData():Vector;
    public native function set rawData(v:Vector):void;
    public native function append(lhs:Matrix3D):void;
    public native function prepend(rhs:Matrix3D):void;
    public native function invert():Boolean;
    public native function identity():void;
    public native function decompose(orientationStyle:String="eulerAngles"):Vector;
    public native function recompose(components:Vector, orientationStyle:String="eulerAngles"):Boolean;
    public native function get position():Vector3D;
    public native function set position(pos:Vector3D):void;
    public native function appendTranslation(x:Number, y:Number, z:Number):void;
    public native function appendRotation(degrees:Number, axis:Vector3D, pivotPoint:Vector3D=null):void;
    public native function appendScale(xScale:Number, yScale:Number, zScale:Number):void;
    public native function prependTranslation(x:Number, y:Number, z:Number):void;
    public native function prependRotation(degrees:Number, axis:Vector3D, pivotPoint:Vector3D=null):void;
    public native function prependScale(xScale:Number, yScale:Number, zScale:Number):void;
    public native function transformVector(v:Vector3D):Vector3D;
    public native function deltaTransformVector(v:Vector3D):Vector3D;
    public native function transformVectors(vin:Vector, vout:Vector):void;
    public native function get determinant():Number;
    public native function transpose():void;
    public native function pointAt(pos:Vector3D, at:Vector3D=null, up:Vector3D=null):void;
    public native function interpolateTo(toMat:Matrix3D, percent:Number):void;
    // [API("674")]
    public native function copyFrom(sourceMatrix3D:Matrix3D):void;
    // [API("674")]
    public native function copyRawDataTo(vector:Vector, index:uint=0, transpose:Boolean=false):void;
    // [API("674")]
    public native function copyRawDataFrom(vector:Vector, index:uint=0, transpose:Boolean=false):void;
    // [API("674")]
    public native function copyRowTo(row:uint, vector3D:Vector3D):void;
    // [API("674")]
    public native function copyColumnTo(column:uint, vector3D:Vector3D):void;
    // [API("674")]
    public native function copyRowFrom(row:uint, vector3D:Vector3D):void;
    // [API("674")]
    public native function copyColumnFrom(column:uint, vector3D:Vector3D):void;
  }

}
