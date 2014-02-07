package flash.net {
import flash.events.EventDispatcher;

public dynamic class NetStreamPlayOptions extends EventDispatcher {
    public function NetStreamPlayOptions() {}
    public var streamName:String;
    public var oldStreamName:String;
    public var start:Number;
    public var len:Number;
    public var offset:Number;
    public var transition:String;
  }
}
