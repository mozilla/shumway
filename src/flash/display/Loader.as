package flash.display {
  import flash.display.DisplayObjectContainer;
  import String;
  import flash.system.LoaderContext;
  import int;
  import flash.utils.ByteArray;
  import Object;
  import flash.net.URLRequest;
  import flash.display.LoaderInfo;
  import flash.display.DisplayObject;
  import Boolean;
  import Number;
  import flash.system.ApplicationDomain;
  import flash.events.UncaughtErrorEvents;
  import flash.system.SecurityDomain;
  import flash.system.LoaderContext;
  import flash.errors.IllegalOperationError;
  import Error;
  import flash.system.ApplicationDomain;
  import flash.events.UncaughtErrorEvents;
  import ArgumentError;
  public class Loader extends DisplayObjectContainer {
    public function Loader() {}
    public function load(request:URLRequest, context:LoaderContext = null):void { notImplemented("load"); }
    public function loadBytes(bytes:ByteArray, context:LoaderContext = null):void { notImplemented("loadBytes"); }
    public function close():void { notImplemented("close"); }
    public function unload():void { notImplemented("unload"); }
    public function unloadAndStop(gc:Boolean = true):void { notImplemented("unloadAndStop"); }
    public native function get content():DisplayObject;
    public native function get contentLoaderInfo():LoaderInfo;
    public override function addChild(child:DisplayObject):DisplayObject { notImplemented("addChild"); }
    public override function addChildAt(child:DisplayObject, index:int):DisplayObject { notImplemented("addChildAt"); }
    public override function removeChild(child:DisplayObject):DisplayObject { notImplemented("removeChild"); }
    public override function removeChildAt(index:int):DisplayObject { notImplemented("removeChildAt"); }
    public override function setChildIndex(child:DisplayObject, index:int):void { notImplemented("setChildIndex"); }
    public function get uncaughtErrorEvents():UncaughtErrorEvents { notImplemented("uncaughtErrorEvents"); }
  }
}
