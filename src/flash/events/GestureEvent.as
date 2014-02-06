package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import Number;
  import isNaN;
  import Number;
  public class GestureEvent extends Event {
    public function GestureEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false, phase:String = null, localX:Number = 0, localY:Number = 0, ctrlKey:Boolean = false, altKey:Boolean = false, shiftKey:Boolean = false) {}
    public static const GESTURE_TWO_FINGER_TAP:String = "gestureTwoFingerTap";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public native function get localX():Number;
    public native function set localX(value:Number):void;
    public native function get localY():Number;
    public native function set localY(value:Number):void;
    public function get phase():String { notImplemented("phase"); }
    public function set phase(value:String):void { notImplemented("phase"); }
    public function get ctrlKey():Boolean { notImplemented("ctrlKey"); }
    public function set ctrlKey(value:Boolean):void { notImplemented("ctrlKey"); }
    public function get altKey():Boolean { notImplemented("altKey"); }
    public function set altKey(value:Boolean):void { notImplemented("altKey"); }
    public function get shiftKey():Boolean { notImplemented("shiftKey"); }
    public function set shiftKey(value:Boolean):void { notImplemented("shiftKey"); }
    public function get stageX():Number { notImplemented("stageX"); }
    public function get stageY():Number { notImplemented("stageY"); }
    public native function updateAfterEvent():void;
  }
}
