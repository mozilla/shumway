package avmplus {
  public class System {
    [native("getArgv")]
    private native static function getArgv():Array;
    public static const argv:Array = getArgv();
  }
}
