package flash.display {

  import flash.events.Event;
  import flash.events.EventDispatcher;
  import flash.events.UncaughtErrorEvents;
  import flash.system.ApplicationDomain;
  import flash.utils.ByteArray;

  [native(cls="LoaderInfoClass")]
  [Exclude(name="dispatchEvent", kind="method")]
  [Event(name="complete", type="flash.events.Event")]
  public class LoaderInfo extends EventDispatcher {
    public function LoaderInfo() {}

    public static native function getLoaderInfoByDefinition(object:Object):LoaderInfo;

    public native function get loaderURL():String;
    public native function get url():String;
    public native function get isURLInaccessible():Boolean;
    public native function get bytesLoaded():uint;
    public native function get bytesTotal():uint;
    public native function get applicationDomain():ApplicationDomain;
    public native function get swfVersion():uint;
    public native function get actionScriptVersion():uint;
    public native function get frameRate():Number;
    public function get parameters():Object { notImplemented("parameters"); }
    public native function get width():int;
    public native function get height():int;
    public native function get contentType():String;
    public native function get sharedEvents():EventDispatcher;
    [Inspectable(environment="none")]
    public override function dispatchEvent(event:Event):Boolean { notImplemented("dispatchEvent"); }
    public native function get sameDomain():Boolean;
    public native function get childAllowsParent():Boolean;
    public native function get parentAllowsChild():Boolean;
    public native function get loader():Loader;
    public native function get content():DisplayObject;
    public native function get bytes():ByteArray;
    private native function _getArgs():Object;
    // [Version("10.1")]
    [compat]
    public function get uncaughtErrorEvents():UncaughtErrorEvents { notImplemented("uncaughtErrorEvents"); }
    private native function _getUncaughtErrorEvents():UncaughtErrorEvents;
    private native function _setUncaughtErrorEvents(value:UncaughtErrorEvents):void;
  }

}
