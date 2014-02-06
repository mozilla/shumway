package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import flash.display.InteractiveObject;
  public class ContextMenuEvent extends Event {
    public function ContextMenuEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, mouseTarget:InteractiveObject = null, contextMenuOwner:InteractiveObject = null) {}
    public static const MENU_ITEM_SELECT:String = "menuItemSelect";
    public static const MENU_SELECT:String = "menuSelect";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get mouseTarget():InteractiveObject { notImplemented("mouseTarget"); }
    public function set mouseTarget(value:InteractiveObject):void { notImplemented("mouseTarget"); }
    public function get contextMenuOwner():InteractiveObject { notImplemented("contextMenuOwner"); }
    public function set contextMenuOwner(value:InteractiveObject):void { notImplemented("contextMenuOwner"); }
    public function get isMouseTargetInaccessible():Boolean { notImplemented("isMouseTargetInaccessible"); }
    public function set isMouseTargetInaccessible(value:Boolean):void { notImplemented("isMouseTargetInaccessible"); }
  }
}
