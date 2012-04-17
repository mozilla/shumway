package flash.display {

  import flash.utils.ByteArray;

  [native(cls="ShaderDataClass")]
  // [Version("10")]
  [compat]
  public final dynamic class ShaderData {
    public function ShaderData(byteCode:ByteArray) {}
    private native function _setByteCode(code:ByteArray):void;
  }

}
