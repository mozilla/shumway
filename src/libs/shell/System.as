package avmplus {
import flash.utils.ByteArray

  [native(cls="SystemClass")]
  public class System {
    // private native static function getArgv():Array;
    // public static const argv:Array = getArgv();


    ////////////////////////////////////////////////////////////////////////////////
    // NOTE: this file is exposed to content, so don't add privileged stuff here. //
    ////////////////////////////////////////////////////////////////////////////////

    public native static function get swfVersion():int;
    public native static function get apiVersion():int;
    public native static function getRunmode():String
  }

}
