package flash.ui {
  import flash.events.EventDispatcher;
  import __AS3__.vec.Vector;
  import String;
  import flash.ui.GameInputControl;
  import Boolean;
  import int;
  import flash.utils.ByteArray;
  public final class GameInputDevice extends EventDispatcher {
    public function GameInputDevice() {}
    public static const MAX_BUFFER_SIZE:int = 4800;
    public native function getControlAt(i:int):GameInputControl;
    public native function get numControls():int;
    public native function startCachingSamples(numSamples:int, controls:Vector):void;
    public native function get sampleInterval():int;
    public native function set sampleInterval(val:int):void;
    public native function stopCachingSamples():void;
    public native function getCachedSamples(data:ByteArray, append:Boolean = false):int;
    public native function get enabled():Boolean;
    public native function set enabled(val:Boolean):void;
    public native function get id():String;
    public native function get name():String;
  }
}
