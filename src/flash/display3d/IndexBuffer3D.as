package flash.display3D {
  import Object;
  import flash.utils.ByteArray;
  public final class IndexBuffer3D {
    public function IndexBuffer3D() {}
    public native function uploadFromVector(data:Vector, startOffset:int, count:int):void;
    public native function uploadFromByteArray(data:ByteArray, byteArrayOffset:int, startOffset:int, count:int):void;
    public native function dispose():void;
  }
}
