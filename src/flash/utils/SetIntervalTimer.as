package flash.utils {
internal final class SetIntervalTimer extends Timer {
    public function SetIntervalTimer(closure:Function, delay:Number, repeats:Boolean, rest:Array) {
      super(delay, repeats ? 1 : 0);
      notImplemented("SetIntervalTimer");
    }
    internal static function clearInterval(id_to_clear:uint):void { notImplemented("clearInterval"); }
    internal var id:uint;
  }

  public function setInterval(closure:Function, delay:Number):uint { notImplemented("setInterval"); return 0; }
  public function setTimeout(closure:Function, delay:Number):uint { notImplemented("setTimeout"); return 0; }
  public function clearInterval(id:uint):void { notImplemented("clearInterval"); }
  public function clearTimeout(id:uint):void { notImplemented("clearTimeout"); }
}
