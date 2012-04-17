package flash.display {

  import flash.utils.ByteArray;
  import flash.events.UncaughtErrorEvents;
  import flash.net.URLRequest;
  import flash.system.ApplicationDomain;
  import flash.system.SecurityDomain;
  import flash.system.LoaderContext;

  [native(cls="LoaderClass")]
  public class Loader extends DisplayObjectContainer {
    public function Loader() {}

    private static function cloneParams(lc:LoaderContext):void { notImplemented("cloneParams"); }

    public function load(request:URLRequest, context:LoaderContext=null):void { notImplemented("load"); }
    private native function _getJPEGLoaderContextdeblockingfilter(context:Object):Number;
    private function _buildLoaderContext(context:LoaderContext):LoaderContext { notImplemented("_buildLoaderContext"); }
    public function loadBytes(bytes:ByteArray, context:LoaderContext=null):void { notImplemented("loadBytes"); }
    private native function _loadBytes(bytes:ByteArray, checkPolicyFile:Boolean, applicationDomain:ApplicationDomain, securityDomain:SecurityDomain, requestedContentParent:DisplayObjectContainer, parameters:Object, deblockingFilter:Number, allowLoadBytesCodeExecution:Boolean, imageDecodingPolicy:String):void;
    public function close():void { notImplemented("close"); }
    public function unload():void { notImplemented("unload"); }

    // [Version("10")]
    [compat]
    public function unloadAndStop(gc:Boolean=true):void { notImplemented("unloadAndStop"); }
    private native function _unload(halt:Boolean, gc:Boolean):void;
    private native function _close():void;
    public native function get content():DisplayObject;
    public native function get contentLoaderInfo():LoaderInfo;

    // [Inspectable(environment="none")]
    public override function addChild(child:DisplayObject):DisplayObject { notImplemented("addChild"); }
    // [Inspectable(environment="none")]
    public override function addChildAt(child:DisplayObject, index:int):DisplayObject { notImplemented("addChildAt"); }
    [Inspectable(environment="none")]
    public override function removeChild(child:DisplayObject):DisplayObject { notImplemented("removeChild"); }
    [Inspectable(environment="none")]
    public override function removeChildAt(index:int):DisplayObject { notImplemented("removeChildAt"); }
    [Inspectable(environment="none")]
    public override function setChildIndex(child:DisplayObject, index:int):void { notImplemented("setChildIndex"); }

    // [Version("10.1")]
    [compat]
    public function get uncaughtErrorEvents():UncaughtErrorEvents { notImplemented("uncaughtErrorEvents"); }
    private native function _getUncaughtErrorEvents():UncaughtErrorEvents;
    private native function _setUncaughtErrorEvents(value:UncaughtErrorEvents):void;
    private native function _load(request:URLRequest, checkPolicyFile:Boolean, applicationDomain:ApplicationDomain, securityDomain:SecurityDomain, requestedContentParent:DisplayObjectContainer, parameters:Object, deblockingFilter:Number, allowCodeExecution:Boolean, imageDecodingPolicy:String):void;
  }

}
