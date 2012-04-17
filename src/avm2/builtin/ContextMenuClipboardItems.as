package flash.ui {

  // [Version("10")]
  [compat]
  public final class ContextMenuClipboardItems {
    public function ContextMenuClipboardItems() {}
    private var _cut:Boolean;
    public function get cut():Boolean { notImplemented("cut"); }
    public function set cut(val:Boolean):void { notImplemented("cut"); }
    private var _copy:Boolean;
    public function get copy():Boolean { notImplemented("copy"); }
    public function set copy(val:Boolean):void { notImplemented("copy"); }
    private var _paste:Boolean;
    public function get paste():Boolean { notImplemented("paste"); }
    public function set paste(val:Boolean):void { notImplemented("paste"); }
    private var _clear:Boolean;
    public function get clear():Boolean { notImplemented("clear"); }
    public function set clear(val:Boolean):void { notImplemented("clear"); }
    private var _selectAll:Boolean = true;
    public function get selectAll():Boolean { notImplemented("selectAll"); }
    public function set selectAll(val:Boolean):void { notImplemented("selectAll"); }
    [Inspectable(environment="none")]
    public function clone():ContextMenuClipboardItems { notImplemented("clone"); }
  }

}
