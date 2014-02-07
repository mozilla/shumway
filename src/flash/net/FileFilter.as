package flash.net {
public final class FileFilter {
    public function FileFilter(description:String, extension:String, macType:String = null) {}
    public native function get description():String;
    public native function set description(value:String):void;
    public native function get extension():String;
    public native function set extension(value:String):void;
    public native function get macType():String;
    public native function set macType(value:String):void;
  }
}
