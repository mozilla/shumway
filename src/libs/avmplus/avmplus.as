package avmplus {
  import flash.utils.ByteArray

  public class System {
    [native("getArgv")]
    private native static function getArgv():Array;
    public static const argv:Array = getArgv();
  }

  [native(cls="FileClass")]
  public class File {
    public native static function exists(filename:String):Boolean;
    public native static function read(filename:String):String;
    public native static function write(filename:String, data:String):void;

    public native static function readByteArray(filename:String):ByteArray;
    public native static function writeByteArray(filename:String, bytes:ByteArray):Boolean;
  }


}
