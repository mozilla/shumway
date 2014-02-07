package flash.events {
import flash.display.InteractiveObject;

public class SoftKeyboardEvent extends Event {
    public function SoftKeyboardEvent(type:String, bubbles:Boolean, cancelable:Boolean, relatedObjectVal:InteractiveObject, triggerTypeVal:String) {
      super(type, bubbles, cancelable);
      notImplemented("SoftKeyboardEvent");
    }
    public static const SOFT_KEYBOARD_ACTIVATE:String = "softKeyboardActivate";
    public static const SOFT_KEYBOARD_DEACTIVATE:String = "softKeyboardDeactivate";
    public static const SOFT_KEYBOARD_ACTIVATING:String = "softKeyboardActivating";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get triggerType():String { notImplemented("triggerType"); return ""; }
    public function get relatedObject():InteractiveObject { notImplemented("relatedObject"); return null; }
    public function set relatedObject(value:InteractiveObject):void { notImplemented("relatedObject"); }
  }
}
