package flash.system {
public final class Security {
    public function Security() {}
    public static native function allowDomain():void;
    public static native function allowInsecureDomain():void;
    public static native function loadPolicyFile(url:String):void;
    public static native function get exactSettings():Boolean;
    public static native function set exactSettings(value:Boolean):void;
    public static native function get disableAVM1Loading():Boolean;
    public static native function set disableAVM1Loading(value:Boolean):void;
    internal static native function duplicateSandboxBridgeInputArguments(toplevel:Object, args:Array):Array;
    internal static native function duplicateSandboxBridgeOutputArgument(toplevel:Object, arg);
    public static native function showSettings(panel:String = "default"):void;
    public static native function get sandboxType():String;
    public static const REMOTE:String = "remote";
    public static const LOCAL_WITH_FILE:String = "localWithFile";
    public static const LOCAL_WITH_NETWORK:String = "localWithNetwork";
    public static const LOCAL_TRUSTED:String = "localTrusted";
    public static const APPLICATION:String = "application";
    public static native function get pageDomain():String;
  }
}
