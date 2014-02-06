package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import uint;
  import flash.display.InteractiveObject;
  public class FocusEvent extends Event {
    public function FocusEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false, relatedObject:InteractiveObject = null, shiftKey:Boolean = false, keyCode:uint = 0) {}
    public static const FOCUS_IN:String = "focusIn";
    public static const FOCUS_OUT:String = "focusOut";
    public static const KEY_FOCUS_CHANGE:String = "keyFocusChange";
    public static const MOUSE_FOCUS_CHANGE:String = "mouseFocusChange";
    public override function clone():Event { notImplemented("clone"); }
    public function get relatedObject():InteractiveObject { notImplemented("relatedObject"); }
    public function set relatedObject(value:InteractiveObject):void { notImplemented("relatedObject"); }
    public function get shiftKey():Boolean { notImplemented("shiftKey"); }
    public function set shiftKey(value:Boolean):void { notImplemented("shiftKey"); }
    public function get keyCode():uint { notImplemented("keyCode"); }
    public function set keyCode(value:uint):void { notImplemented("keyCode"); }
    public function get isRelatedObjectInaccessible():Boolean { notImplemented("isRelatedObjectInaccessible"); }
    public function set isRelatedObjectInaccessible(value:Boolean):void { notImplemented("isRelatedObjectInaccessible"); }
    public override function toString():String { notImplemented("toString"); }
  }
}
