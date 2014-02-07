package flash.events {
public class PressAndTapGestureEvent extends GestureEvent {
    public function PressAndTapGestureEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false, phase:String = null, localX:Number = 0, localY:Number = 0, tapLocalX:Number = 0, tapLocalY:Number = 0, ctrlKey:Boolean = false, altKey:Boolean = false, shiftKey:Boolean = false) {
      super(type, bubbles, cancelable);
      notImplemented("PressAndTapGestureEvent");
    }
    public static const GESTURE_PRESS_AND_TAP:String = "gesturePressAndTap";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public native function get tapLocalX():Number;
    public native function set tapLocalX(value:Number):void;
    public native function get tapLocalY():Number;
    public native function set tapLocalY(value:Number):void;
    public function get tapStageX():Number { notImplemented("tapStageX"); return -1; }
    public function get tapStageY():Number { notImplemented("tapStageY"); return -1; }
  }
}
