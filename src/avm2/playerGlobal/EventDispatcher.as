package flash.events {

  [native(cls="EventDispatcherClass")]
  [Event(name="activate", type="flash.events.Event")]
  public class EventDispatcher implements IEventDispatcher {
    public function EventDispatcher(target:IEventDispatcher=null) {}

    private static native function trimHeaderValue(headerValue:String):String;
    private native function ctor(target:IEventDispatcher):void;

    public native function addEventListener(type:String, listener:Function, useCapture:Boolean=false, priority:int=0, useWeakReference:Boolean=false):void;
    public native function removeEventListener(type:String, listener:Function, useCapture:Boolean=false):void;
    public function dispatchEvent(event:Event):Boolean { notImplemented("dispatchEvent"); }
    public native function hasEventListener(type:String):Boolean;
    public native function willTrigger(type:String):Boolean;
    private native function dispatchEventFunction(event:Event):Boolean;
    private function dispatchHttpStatusEvent(status:uint, responseLocation:String, headers:String):void { notImplemented("dispatchHttpStatusEvent"); }

    public function toString():String { notImplemented("toString"); }
  }

}
