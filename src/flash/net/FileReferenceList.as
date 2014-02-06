package flash.net {
  import flash.events.EventDispatcher;
  import Array;
  import Boolean;
  import flash.events.Event;
  public class FileReferenceList extends EventDispatcher {
    public function FileReferenceList() {}
    public native function get fileList():Array;
    public native function browse(typeFilter:Array = null):Boolean;
  }
}
