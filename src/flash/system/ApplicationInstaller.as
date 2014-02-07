package flash.system {
import flash.events.EventDispatcher;
import flash.utils.ByteArray;

public final class ApplicationInstaller extends EventDispatcher {
    public function ApplicationInstaller() {}
    public static native function stringsDigest(strings:XML):String;
    public static native function iconDigest(icon:ByteArray):String;
    public native function install(shortcutsOnly:Boolean = false):void;
    public native function get isInstalled():Boolean;
  }
}
