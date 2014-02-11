package flash.display {
import flash.errors.IllegalOperationError;
import flash.events.UncaughtErrorEvents;
import flash.net.URLRequest;
import flash.system.ApplicationDomain;
import flash.system.LoaderContext;
import flash.system.SecurityDomain;
import flash.utils.ByteArray;

[native(cls='LoaderClass')]
public class Loader extends DisplayObjectContainer {
  public function Loader() {
  }
  public native function get content():DisplayObject;
  public native function get contentLoaderInfo():LoaderInfo;
  public function get uncaughtErrorEvents():UncaughtErrorEvents {
    var events:UncaughtErrorEvents = _getUncaughtErrorEvents();
    if (!events) {
      events = new UncaughtErrorEvents();
      _setUncaughtErrorEvents(events);
    }
    return events;
  }
  public override function addChild(child:DisplayObject):DisplayObject {
    Error.throwError(IllegalOperationError, 2069);
    return null;
  }
  public override function addChildAt(child:DisplayObject, index:int):DisplayObject {
    Error.throwError(IllegalOperationError, 2069);
    return null;
  }
  public override function removeChild(child:DisplayObject):DisplayObject {
    Error.throwError(IllegalOperationError, 2069);
    return null;
  }
  public override function removeChildAt(index:int):DisplayObject {
    Error.throwError(IllegalOperationError, 2069);
    return null;
  }
  public override function setChildIndex(child:DisplayObject, index:int):void
  {
    Error.throwError(IllegalOperationError, 2069);
  }
  public function load(request:URLRequest, context:LoaderContext = null):void {
    context = sanitizeContext(context);
    _load(request, context.checkPolicyFile, context.applicationDomain, context.securityDomain,
          context.requestedContentParent, context.parameters,
          _getJPEGLoaderContextdeblockingfilter(context), context.allowCodeImport,
          context.imageDecodingPolicy);
  }
  private function sanitizeContext(context:LoaderContext):LoaderContext {
    if (!context) {
      context = new LoaderContext();
    }
    if (!context.applicationDomain) {
      context.applicationDomain = new ApplicationDomain(ApplicationDomain.currentDomain);
    }
    context.parameters = cloneObject(context.parameters);
    return context;
  }
  public function loadBytes(bytes:ByteArray, context:LoaderContext = null):void {
    context = sanitizeContext(context);
    _loadBytes(bytes, context.checkPolicyFile, context.applicationDomain, context.securityDomain,
          context.requestedContentParent, context.parameters,
          _getJPEGLoaderContextdeblockingfilter(context), context.allowCodeImport,
          context.imageDecodingPolicy);
  }
  public function close():void {
    _close();
  }
  public function unload():void {
    _unload(false, false);
  }
  public function unloadAndStop(gc:Boolean = true):void {
    _unload(true, gc);
  }

  private function cloneObject(obj:Object):Object {
    if (!obj) {
      return null;
    }
    var clone:Object = {};
    for (var key:String in obj) {
      clone[key] = obj[key];
    }
    return clone;
  }
  private native function _close():void;
  private native function _unload(stopExecution:Boolean, gc:Boolean):void;
  private native function _getJPEGLoaderContextdeblockingfilter(context:LoaderContext):Number;
  private native function _getUncaughtErrorEvents():UncaughtErrorEvents;
  private native function _setUncaughtErrorEvents(value:UncaughtErrorEvents):void;
  private native function _load(request:URLRequest, checkPolicyFile:Boolean,
                                applicationDomain:ApplicationDomain, securityDomain:SecurityDomain,
                                requestedContentParent:DisplayObjectContainer, parameters:Object,
                                deblockingFilter:Number, allowCodeExecution:Boolean,
                                imageDecodingPolicy:String):void;
  private native function _loadBytes(bytes:ByteArray, checkPolicyFile:Boolean,
                                applicationDomain:ApplicationDomain, securityDomain:SecurityDomain,
                                requestedContentParent:DisplayObjectContainer, parameters:Object,
                                deblockingFilter:Number, allowCodeExecution:Boolean,
                                imageDecodingPolicy:String):void;
}
}
