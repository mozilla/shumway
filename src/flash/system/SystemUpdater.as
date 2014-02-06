package flash.system {
  import flash.events.EventDispatcher;
  import Object;
  import Error;
  import flash.events.Event;
  import adobe.utils.ProductManager;
  import flash.events.SecurityErrorEvent;
  import flash.events.ProgressEvent;
  import Error;
  import flash.system.Capabilities;
  import flash.events.Event;
  import flash.events.StatusEvent;
  import adobe.utils.ProductManager;
  import flash.events.IOErrorEvent;
  public class SystemUpdater extends EventDispatcher {
    public function SystemUpdater() {}
    public function update(type:String):void { notImplemented("update"); }
    public function cancel():void { notImplemented("cancel"); }
  }
}
