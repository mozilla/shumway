package flash.utils {
import flash.events.EventDispatcher;

public class Timer extends EventDispatcher {
    public function Timer(delay:Number, repeatCount:int = 0) {}
    public function get delay():Number { notImplemented("delay"); return -1; }
    public function get repeatCount():int { notImplemented("repeatCount"); return -1; }
    public function set repeatCount(value:int):void { notImplemented("repeatCount"); }
    public function get currentCount():int { notImplemented("currentCount"); return -1; }
    public native function get running():Boolean;
    public function set delay(value:Number):void { notImplemented("delay"); }
    public function start():void { notImplemented("start"); }
    public function reset():void { notImplemented("reset"); }
    public native function stop():void;
  }
}
