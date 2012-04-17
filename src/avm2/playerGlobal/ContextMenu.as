package flash.ui {

  import flash.display.NativeMenu;
  import flash.net.URLRequest;

  [native(cls="ContextMenuClass")]
  [Event(name="menuSelect", type="flash.events.ContextMenuEvent")]
  public final class ContextMenu extends NativeMenu {
    public function ContextMenu() {}

    // [API("667")]
    public static function get isSupported():Boolean { notImplemented("isSupported"); }

    public function hideBuiltInItems():void { notImplemented("hideBuiltInItems"); }
    public function get builtInItems():ContextMenuBuiltInItems { notImplemented("builtInItems"); }
    public function set builtInItems(value:ContextMenuBuiltInItems):void { notImplemented("builtInItems"); }
    private native function doGetBuiltInItems():ContextMenuBuiltInItems;
    private native function doSetBuiltInItems(value:ContextMenuBuiltInItems):void;
    public native function get customItems():Array;
    public native function set customItems(value:Array):void;

    // [Version("10")]
    [compat]
    public native function get link():URLRequest;
    // [Version("10")]
    [compat]
    public native function set link(value:URLRequest):void;
    // [Version("10")]
    [compat]
    public native function get clipboardMenu():Boolean;
    // [Version("10")]
    [compat]
    public native function set clipboardMenu(value:Boolean):void;
    // [Version("10")]
    [compat]
    public native function get clipboardItems():ContextMenuClipboardItems;
    // [Version("10")]
    [compat]
    public native function set clipboardItems(value:ContextMenuClipboardItems):void;

    public function clone():ContextMenu { notImplemented("clone"); }
    private native function cloneLinkAndClipboardProperties(c:ContextMenu):void;
  }

}
