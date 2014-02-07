package flash.net {
public final class ObjectEncoding {
    public function ObjectEncoding() {}
    public static const AMF0:uint;
    public static const AMF3:uint = 3;
    public static const DEFAULT:uint = 3;
    public static native function get dynamicPropertyWriter():IDynamicPropertyWriter;
    public static native function set dynamicPropertyWriter(object:IDynamicPropertyWriter):void;
  }
}
