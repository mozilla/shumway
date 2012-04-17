package flash.system {

  import flash.display.DisplayObjectContainer;

  public class LoaderContext {
    public function LoaderContext(checkPolicyFile:Boolean=false, applicationDomain:ApplicationDomain=null, securityDomain:SecurityDomain=null) {}

    public var checkPolicyFile:Boolean;
    public var applicationDomain:ApplicationDomain;
    public var securityDomain:SecurityDomain;

    // [API("661")]
    public function get allowLoadBytesCodeExecution():Boolean { notImplemented("allowLoadBytesCodeExecution"); }
    // [API("661")]
    public function set allowLoadBytesCodeExecution(allow:Boolean):void { notImplemented("allowLoadBytesCodeExecution"); }

    public var allowCodeImport:Boolean;
    // [API("670")]
    public var requestedContentParent:DisplayObjectContainer;
    // [API("670")]
    public var parameters:Object;
    // [API("671", "674")]
    [compat]
    public var imageDecodingPolicy:String;
  }

}
