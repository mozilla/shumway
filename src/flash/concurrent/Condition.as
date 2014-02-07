package flash.concurrent {
public final class Condition {
    public function Condition(mutex:Mutex) {}
    public native function get mutex():Mutex;
    public function wait(timeout:Number = -1):Boolean { notImplemented("wait"); return false; }
    public function notify():void { notImplemented("notify"); }
    public function notifyAll():void { notImplemented("notifyAll"); }
  }
}
