package flash.display3D.textures {
  import flash.display3D.textures.TextureBase;
  import Boolean;
  import flash.display.BitmapData;
  import uint;
  import flash.utils.ByteArray;
  public final class Texture extends TextureBase {
    public function Texture() {}
    public native function uploadFromBitmapData(source:BitmapData, miplevel:uint = 0):void;
    public native function uploadFromByteArray(data:ByteArray, byteArrayOffset:uint, miplevel:uint = 0):void;
    public native function uploadCompressedTextureFromByteArray(data:ByteArray, byteArrayOffset:uint, async:Boolean = false):void;
  }
}
