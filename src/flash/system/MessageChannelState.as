package flash.system {
  import flash.events.EventDispatcher;
  import Object;
  import flash.events.Event;
  public final class MessageChannelState {
    public function MessageChannelState() {}
    public static const OPEN:String = "open";
    public static const CLOSING:String = "closing";
    public static const CLOSED:String = "closed";
  }
}
