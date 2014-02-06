package flash.ui {
  import flash.display.NativeMenu;
  import Array;
  import Boolean;
  import flash.ui.ContextMenuBuiltInItems;
  import int;
  import flash.net.URLRequest;
  import flash.ui.ContextMenuClipboardItems;
  import flash.events.ContextMenuEvent;
  import Array;
  import flash.ui.ContextMenuBuiltInItems;
  public final class ContextMenu extends NativeMenu {
    public function ContextMenu() {}
    public static function get isSupported():Boolean { notImplemented("isSupported"); }
    public function hideBuiltInItems():void { notImplemented("hideBuiltInItems"); }
    public native function get builtInItems():ContextMenuBuiltInItems;
    public native function set builtInItems(value:ContextMenuBuiltInItems):void;
    public native function get customItems():Array;
    public native function set customItems(value:Array):void;
    public native function get link():URLRequest;
    public native function set link(value:URLRequest):void;
    public native function get clipboardMenu():Boolean;
    public native function set clipboardMenu(value:Boolean):void;
    public native function get clipboardItems():ContextMenuClipboardItems;
    public native function set clipboardItems(value:ContextMenuClipboardItems):void;
    public function clone():ContextMenu { notImplemented("clone"); }
  }
}
