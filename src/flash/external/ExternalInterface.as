package flash.external {
  import Object;
  import Error;
  import XML;
  import Error;
  import Date;
  import flash.system.Capabilities;
  import XML;
  import flash.utils.getDefinitionByName;
  public final class ExternalInterface {
    public function ExternalInterface() {}
    public static native function get available():Boolean;
    public static var marshallExceptions:Boolean;
    public static function addCallback(functionName:String, closure:Function):void { notImplemented("addCallback"); }
    public static function call(functionName:String) { notImplemented("call"); }
    public static native function get objectID():String;
  }
}
