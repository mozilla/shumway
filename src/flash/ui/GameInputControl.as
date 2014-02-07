package flash.ui {
import flash.events.EventDispatcher;

public final class GameInputControl extends EventDispatcher {
    public function GameInputControl() {}
    public native function get numValues():int;
    public native function get index():int;
    public native function getValueAt(index:int = 0):Number;
    public native function get relative():Boolean;
    public native function get type():String;
    public native function get hand():String;
    public native function get finger():String;
    public native function get device():GameInputDevice;
  }
}
