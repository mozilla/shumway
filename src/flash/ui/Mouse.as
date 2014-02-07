package flash.ui {
public final class Mouse {
    public function Mouse() {}
    public static native function hide():void;
    public static native function show():void;
    public static native function get supportsCursor():Boolean;
    public static native function get cursor():String;
    public static native function set cursor(value:String):void;
    public static native function registerCursor(name:String, cursor:MouseCursorData):void;
    public static native function unregisterCursor(name:String):void;
    public static native function get supportsNativeCursor():Boolean;
  }
}
