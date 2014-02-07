package flash.system {
import flash.events.EventDispatcher;

public final class MessageChannel extends EventDispatcher {
    public function MessageChannel() {}
    public native function send(arg, queueLimit:int = -1):void;
    public native function get messageAvailable():Boolean;
    public native function receive(blockUntilReceived:Boolean = false);
    public override function addEventListener(type:String, listener:Function, useCapture:Boolean = false, priority:int = 0, useWeakReference:Boolean = false):void { notImplemented("addEventListener"); }
    public override function removeEventListener(type:String, listener:Function, useCapture:Boolean = false):void { notImplemented("removeEventListener"); }
    public native function close():void;
    public native function get state():String;
    public override function toString():String { notImplemented("toString"); return ""; }
  }
}
