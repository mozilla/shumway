package flash.events {
import flash.display.InteractiveObject;

public class ContextMenuEvent extends Event {
    public function ContextMenuEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, mouseTarget:InteractiveObject = null, contextMenuOwner:InteractiveObject = null) {
      super(type, bubbles, cancelable);
      notImplemented("ContextMenuEvent");
    }
    public static const MENU_ITEM_SELECT:String = "menuItemSelect";
    public static const MENU_SELECT:String = "menuSelect";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get mouseTarget():InteractiveObject { notImplemented("mouseTarget"); return null; }
    public function set mouseTarget(value:InteractiveObject):void { notImplemented("mouseTarget"); }
    public function get contextMenuOwner():InteractiveObject { notImplemented("contextMenuOwner"); return null; }
    public function set contextMenuOwner(value:InteractiveObject):void { notImplemented("contextMenuOwner"); }
    public function get isMouseTargetInaccessible():Boolean { notImplemented("isMouseTargetInaccessible"); return false; }
    public function set isMouseTargetInaccessible(value:Boolean):void { notImplemented("isMouseTargetInaccessible"); }
  }
}
