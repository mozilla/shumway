package flash.system {
  import Object;
  import flash.system.ApplicationInstaller;
  import flash.net.URLStream;
  import XML;
  import flash.utils.ByteArray;
  public final class AuthorizedFeatures {
    public function AuthorizedFeatures() {}
    public native function createApplicationInstaller(strings:XML, icon:ByteArray):ApplicationInstaller;
    public native function enableDiskCache(stream:URLStream):Boolean;
    internal native function isFeatureEnabled(feature:String, data:String = null):Boolean;
    internal native function isNegativeToken():Boolean;
  }
}
