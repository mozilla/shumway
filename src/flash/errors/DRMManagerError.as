package flash.errors {
public class DRMManagerError extends Error {
    public function DRMManagerError(message:String, id:int, subErrorID:int) {}
    public function get subErrorID():int { notImplemented("subErrorID"); return -1; }
    public function toString():String { notImplemented("toString"); return ""; }
  }
}
