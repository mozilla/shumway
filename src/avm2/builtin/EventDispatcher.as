package flash.events {

  [native(cls="EventDispatcherClass")]
  [Event(name="activate", type="flash.events.Event")]
  public class EventDispatcher implements IEventDispatcher {
    public function EventDispatcher(target:IEventDispatcher=null) {}

    private static native function trimHeaderValue(headerValue:String):String;
    private native function ctor(target:IEventDispatcher):void;

    public native function addEventListener(type:String, listener:Function, useCapture:Boolean=false, priority:int=0, useWeakReference:Boolean=false):void;
    public native function removeEventListener(type:String, listener:Function, useCapture:Boolean=false):void;
    public native function dispatchEvent(event:Event):Boolean;
    public native function hasEventListener(type:String):Boolean;
    public native function willTrigger(type:String):Boolean;
    private native function dispatchEventFunction(event:Event):Boolean;
    private native function dispatchHttpStatusEvent(status:uint, responseLocation:String, headers:String):void;

    public function toString():String {
      return Object.prototype.toString.call(this);
    }
  }

}
