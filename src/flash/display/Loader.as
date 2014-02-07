package flash.display {
import flash.events.UncaughtErrorEvents;
import flash.net.URLRequest;
import flash.system.LoaderContext;
import flash.utils.ByteArray;

public class Loader extends DisplayObjectContainer {
    public function Loader() {}
    public function load(request:URLRequest, context:LoaderContext = null):void { notImplemented("load"); }
    public function loadBytes(bytes:ByteArray, context:LoaderContext = null):void { notImplemented("loadBytes"); }
    public function close():void { notImplemented("close"); }
    public function unload():void { notImplemented("unload"); }
    public function unloadAndStop(gc:Boolean = true):void { notImplemented("unloadAndStop"); }
    public native function get content():DisplayObject;
    public native function get contentLoaderInfo():LoaderInfo;
    public override function addChild(child:DisplayObject):DisplayObject { notImplemented("addChild"); return null; }
    public override function addChildAt(child:DisplayObject, index:int):DisplayObject { notImplemented("addChildAt"); return null; }
    public override function removeChild(child:DisplayObject):DisplayObject { notImplemented("removeChild"); return null; }
    public override function removeChildAt(index:int):DisplayObject { notImplemented("removeChildAt"); return null; }
    public override function setChildIndex(child:DisplayObject, index:int):void { notImplemented("setChildIndex"); }
    public function get uncaughtErrorEvents():UncaughtErrorEvents { notImplemented("uncaughtErrorEvents"); return null; }
  }
}
