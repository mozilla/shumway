package flash.system {
  import flash.system.LoaderContext;
  import Boolean;
  import Number;
  import flash.system.ApplicationDomain;
  import flash.system.SecurityDomain;
  public class JPEGLoaderContext extends LoaderContext {
    public function JPEGLoaderContext(deblockingFilter:Number = 0, checkPolicyFile:Boolean = false, applicationDomain:ApplicationDomain = null, securityDomain:SecurityDomain = null) {}
    public var deblockingFilter:Number;
  }
}
