package flash.accessibility {
  import Object;
  import flash.display.DisplayObject;
  public final class Accessibility {
    public function Accessibility() {}
    public static native function get active():Boolean;
    public static native function sendEvent(source:DisplayObject, childID:uint, eventType:uint, nonHTML:Boolean = false):void;
    public static native function updateProperties():void;
  }
}
