package flash.trace {
  import Object;
  public class Trace {
    public function Trace() {}
    public static const OFF:int;
    public static const METHODS:int = 1;
    public static const METHODS_WITH_ARGS:int = 2;
    public static const METHODS_AND_LINES:int = 3;
    public static const METHODS_AND_LINES_WITH_ARGS:int = 4;
    public static const FILE = 1;
    public static const LISTENER = 2;
    public static native function setLevel(l:int, target:int = 2);
    public static native function getLevel(target:int = 2):int;
    public static native function setListener(f:Function);
    public static native function getListener():Function;
  }
}
