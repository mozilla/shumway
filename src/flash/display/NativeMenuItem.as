package flash.display {
  import flash.events.EventDispatcher;
  import Boolean;
  import flash.events.Event;
  public class NativeMenuItem extends EventDispatcher {
    public function NativeMenuItem() {}
    public native function get enabled():Boolean;
    public native function set enabled(isSeparator:Boolean):void;
  }
}
