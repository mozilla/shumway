package flash.automation {
public class Configuration {
    public function Configuration() {}
    public static native function get testAutomationConfiguration():String;
    public static native function set deviceConfiguration(configData:String):void;
    public static native function get deviceConfiguration():String;
  }
}
