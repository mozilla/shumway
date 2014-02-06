package flash.concurrent {
  import Object;
  import int;
  import flash.errors.IllegalOperationError;
  import Error;
  import ArgumentError;
  import Math;
  public final class Condition {
    public function Condition(mutex:Mutex) {}
    public native function get mutex():Mutex;
    public function wait(timeout:Number = -1):Boolean { notImplemented("wait"); }
    public function notify():void { notImplemented("notify"); }
    public function notifyAll():void { notImplemented("notifyAll"); }
  }
}
