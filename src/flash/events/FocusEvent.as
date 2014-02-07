package flash.events {
import flash.display.InteractiveObject;

public class FocusEvent extends Event {
    public function FocusEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false, relatedObject:InteractiveObject = null, shiftKey:Boolean = false, keyCode:uint = 0) {
      super(type, bubbles, cancelable);
      notImplemented("FocusEvent");
    }
    public static const FOCUS_IN:String = "focusIn";
    public static const FOCUS_OUT:String = "focusOut";
    public static const KEY_FOCUS_CHANGE:String = "keyFocusChange";
    public static const MOUSE_FOCUS_CHANGE:String = "mouseFocusChange";
    public override function clone():Event { notImplemented("clone"); return null; }
    public function get relatedObject():InteractiveObject { notImplemented("relatedObject"); return null; }
    public function set relatedObject(value:InteractiveObject):void { notImplemented("relatedObject"); }
    public function get shiftKey():Boolean { notImplemented("shiftKey"); return false; }
    public function set shiftKey(value:Boolean):void { notImplemented("shiftKey"); }
    public function get keyCode():uint { notImplemented("keyCode"); return 0; }
    public function set keyCode(value:uint):void { notImplemented("keyCode"); }
    public function get isRelatedObjectInaccessible():Boolean { notImplemented("isRelatedObjectInaccessible"); return false; }
    public function set isRelatedObjectInaccessible(value:Boolean):void { notImplemented("isRelatedObjectInaccessible"); }
    public override function toString():String { notImplemented("toString"); return ""; }
  }
}
