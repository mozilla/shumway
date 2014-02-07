package flash.concurrent {
public final class Mutex {
    public function Mutex() {}
    public native function lock():void;
    public native function tryLock():Boolean;
    public native function unlock():void;
  }
}
