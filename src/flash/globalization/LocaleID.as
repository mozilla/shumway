package flash.globalization {
public final class LocaleID {
    public function LocaleID(name:String) {}
    public static const DEFAULT:String = "i-default";
    public static native function determinePreferredLocales(want:Vector, have:Vector, keyword:String = "userinterface"):Vector;
    public native function getLanguage():String;
    public native function getRegion():String;
    public native function getScript():String;
    public native function getVariant():String;
    public native function get name():String;
    public native function getKeysAndValues():Object;
    public native function get lastOperationStatus():String;
    public native function isRightToLeft():Boolean;
  }
}
