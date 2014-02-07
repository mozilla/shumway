package flash.events {
public class GestureEvent extends Event {
    public function GestureEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false, phase:String = null, localX:Number = 0, localY:Number = 0, ctrlKey:Boolean = false, altKey:Boolean = false, shiftKey:Boolean = false) {
      super(type, bubbles, cancelable);
      notImplemented("GestureEvent");
    }
    public static const GESTURE_TWO_FINGER_TAP:String = "gestureTwoFingerTap";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public native function get localX():Number;
    public native function set localX(value:Number):void;
    public native function get localY():Number;
    public native function set localY(value:Number):void;
    public function get phase():String { notImplemented("phase"); return ""; }
    public function set phase(value:String):void { notImplemented("phase"); }
    public function get ctrlKey():Boolean { notImplemented("ctrlKey"); return false; }
    public function set ctrlKey(value:Boolean):void { notImplemented("ctrlKey"); }
    public function get altKey():Boolean { notImplemented("altKey"); return false; }
    public function set altKey(value:Boolean):void { notImplemented("altKey"); }
    public function get shiftKey():Boolean { notImplemented("shiftKey"); return false; }
    public function set shiftKey(value:Boolean):void { notImplemented("shiftKey"); }
    public function get stageX():Number { notImplemented("stageX"); return -1; }
    public function get stageY():Number { notImplemented("stageY"); return -1; }
    public native function updateAfterEvent():void;
  }
}
