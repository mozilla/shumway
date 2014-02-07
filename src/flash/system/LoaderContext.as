package flash.system {
//  import Object;
import flash.display.DisplayObjectContainer;

//  import flash.system.ApplicationDomain;
//  import flash.system.SecurityDomain;
//  import flash.system.Security;
//  import flash.system.ImageDecodingPolicy;
  public class LoaderContext {
    public function LoaderContext(checkPolicyFile:Boolean = false, applicationDomain:ApplicationDomain = null, securityDomain:SecurityDomain = null) {}
    public var checkPolicyFile:Boolean;
    public var applicationDomain:ApplicationDomain;
    public var securityDomain:SecurityDomain;
    public function get allowLoadBytesCodeExecution():Boolean { notImplemented("allowLoadBytesCodeExecution"); return false; }
    public function set allowLoadBytesCodeExecution(allow:Boolean):void { notImplemented("allowLoadBytesCodeExecution"); }
    public var allowCodeImport:Boolean;
    public var requestedContentParent:DisplayObjectContainer;
    public var parameters:Object;
    public var imageDecodingPolicy:String;
  }
}
