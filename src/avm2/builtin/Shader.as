package flash.display {

  import flash.utils.ByteArray;

  [native(cls="ShaderClass")]
  // [Version("10")]
  [compat]
  public class Shader {
    public function Shader(code:ByteArray=null) {}
    public function set byteCode(code:ByteArray):void { notImplemented("byteCode"); }
    public native function get data():ShaderData;
    public native function set data(p:ShaderData):void;
    public native function get precisionHint():String;
    public native function set precisionHint(p:String):void;
  }

}
