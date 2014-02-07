package flash.ui {
public final class Multitouch {
    public function Multitouch() {}
    public static native function get inputMode():String;
    public static native function set inputMode(value:String):void;
    public static native function get supportsTouchEvents():Boolean;
    public static native function get supportsGestureEvents():Boolean;
    public static native function get supportedGestures():Vector;
    public static native function get maxTouchPoints():int;
    public static native function get mapTouchToMouse():Boolean;
    public static native function set mapTouchToMouse(value:Boolean):void;
  }
}
