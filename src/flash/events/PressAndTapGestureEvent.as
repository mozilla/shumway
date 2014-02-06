package flash.events {
  import flash.events.GestureEvent;
  import String;
  import Boolean;
  import Number;
  import flash.events.Event;
  import isNaN;
  import Number;
  public class PressAndTapGestureEvent extends GestureEvent {
    public function PressAndTapGestureEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false, phase:String = null, localX:Number = 0, localY:Number = 0, tapLocalX:Number = 0, tapLocalY:Number = 0, ctrlKey:Boolean = false, altKey:Boolean = false, shiftKey:Boolean = false) {}
    public static const GESTURE_PRESS_AND_TAP:String = "gesturePressAndTap";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public native function get tapLocalX():Number;
    public native function set tapLocalX(value:Number):void;
    public native function get tapLocalY():Number;
    public native function set tapLocalY(value:Number):void;
    public function get tapStageX():Number { notImplemented("tapStageX"); }
    public function get tapStageY():Number { notImplemented("tapStageY"); }
  }
}
