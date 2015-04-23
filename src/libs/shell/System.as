package avmplus {
import flash.utils.ByteArray

  [native(cls="SystemClass")]
  public class System {
    // private native static function getArgv():Array;
    // public static const argv:Array = getArgv();


    public native static function get swfVersion():int;
    public native static function get apiVersion():int;
    public native static function getRunmode():String
  }

}
