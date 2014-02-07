package flash.net {
import flash.events.EventDispatcher;

public class LocalConnection extends EventDispatcher {
    public function LocalConnection() {}
    public static function get isSupported():Boolean { notImplemented("isSupported"); return false; }
    public native function close():void;
    public native function connect(connectionName:String):void;
    public native function get domain():String;
    public native function send(connectionName:String, methodName:String):void;
    public native function get client():Object;
    public native function set client(client:Object):void;
    public native function get isPerUser():Boolean;
    public native function set isPerUser(newValue:Boolean):void;
    public native function allowDomain():void;
    public native function allowInsecureDomain():void;
  }
}
