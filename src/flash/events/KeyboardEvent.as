package flash.events {
public class KeyboardEvent extends Event {
    public function KeyboardEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false, charCodeValue:uint = 0, keyCodeValue:uint = 0, keyLocationValue:uint = 0, ctrlKeyValue:Boolean = false, altKeyValue:Boolean = false, shiftKeyValue:Boolean = false) {
      super(type, bubbles, cancelable);
      notImplemented("KeyboardEvent");
    }
    public static const KEY_DOWN:String = "keyDown";
    public static const KEY_UP:String = "keyUp";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public native function get charCode():uint;
    public native function set charCode(value:uint):void;
    public function get keyCode():uint { notImplemented("keyCode"); return 0; }
    public function set keyCode(value:uint):void { notImplemented("keyCode"); }
    public function get keyLocation():uint { notImplemented("keyLocation"); return 0; }
    public function set keyLocation(value:uint):void { notImplemented("keyLocation"); }
    public native function get ctrlKey():Boolean;
    public native function set ctrlKey(value:Boolean):void;
    public native function get altKey():Boolean;
    public native function set altKey(value:Boolean):void;
    public native function get shiftKey():Boolean;
    public native function set shiftKey(value:Boolean):void;
    public native function updateAfterEvent():void;
  }
}
