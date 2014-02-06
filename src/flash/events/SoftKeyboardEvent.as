package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import flash.display.InteractiveObject;
  public class SoftKeyboardEvent extends Event {
    public function SoftKeyboardEvent(type:String, bubbles:Boolean, cancelable:Boolean, relatedObjectVal:InteractiveObject, triggerTypeVal:String) {}
    public static const SOFT_KEYBOARD_ACTIVATE:String = "softKeyboardActivate";
    public static const SOFT_KEYBOARD_DEACTIVATE:String = "softKeyboardDeactivate";
    public static const SOFT_KEYBOARD_ACTIVATING:String = "softKeyboardActivating";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get triggerType():String { notImplemented("triggerType"); }
    public function get relatedObject():InteractiveObject { notImplemented("relatedObject"); }
    public function set relatedObject(value:InteractiveObject):void { notImplemented("relatedObject"); }
  }
}
