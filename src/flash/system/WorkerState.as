package flash.system {
  import flash.events.EventDispatcher;
  import Object;
  import flash.system.MessageChannel;
  import flash.utils.ByteArray;
  import flash.events.Event;
  public final class WorkerState {
    public function WorkerState() {}
    public static const NEW:String = "new";
    public static const RUNNING:String = "running";
    public static const TERMINATED:String = "terminated";
  }
}
