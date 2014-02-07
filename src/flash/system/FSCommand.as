package flash.system {
internal final class FSCommand {
    public function FSCommand() {}
    public static native function _fscommand(command:String, args:String):void;
  }

  public function fscommand(command:String, args:String = ''):void {
    FSCommand._fscommand(command, args);
  }
}
