package flash.utils {
  import flash.utils.Timer;
  import Array;
  import Boolean;
  import uint;
  import Number;
  import flash.events.Event;
  import Function;
  import flash.events.TimerEvent;
  internal final class SetIntervalTimer extends Timer {
    public function SetIntervalTimer(closure:Function, delay:Number, repeats:Boolean, rest:Array) {}
    internal static function clearInterval(id_to_clear:uint):void { notImplemented("clearInterval"); }
    internal var id:uint;
  }

  public function setInterval(closure:Function, delay:Number):uint { notImplemented("setInterval"); }
  public function setTimeout(closure:Function, delay:Number):uint { notImplemented("setTimeout"); }
  public function clearInterval(id:uint):void { notImplemented("clearInterval"); }
  public function clearTimeout(id:uint):void { notImplemented("clearTimeout"); }
}
