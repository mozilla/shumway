package flash.ui {
import flash.display.NativeMenuItem;

public final class ContextMenuItem extends NativeMenuItem {
    public function ContextMenuItem(caption:String, separatorBefore:Boolean = false, enabled:Boolean = true, visible:Boolean = true) {}
    public native function get caption():String;
    public native function set caption(value:String):void;
    public native function get separatorBefore():Boolean;
    public native function set separatorBefore(value:Boolean):void;
    public native function get visible():Boolean;
    public native function set visible(value:Boolean):void;
    public function clone():ContextMenuItem { notImplemented("clone"); return null; }
  }
}
