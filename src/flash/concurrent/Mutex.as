package flash.concurrent {
  import Object;
  import int;
  import flash.errors.IllegalOperationError;
  import Error;
  import ArgumentError;
  import Math;
  public final class Mutex {
    public function Mutex() {}
    public native function lock():void;
    public native function tryLock():Boolean;
    public native function unlock():void;
  }
}
