package flash.net {
  import flash.events.EventDispatcher;
  import String;
  import Array;
  import Boolean;
  import uint;
  import Date;
  import Error;
  import Number;
  import XML;
  import flash.utils.ByteArray;
  import flash.net.URLRequest;
  import String;
  import flash.events.SecurityErrorEvent;
  import flash.events.ProgressEvent;
  import flash.events.DataEvent;
  import Error;
  import flash.events.HTTPStatusEvent;
  import XML;
  import flash.events.Event;
  import ArgumentError;
  import flash.utils.ByteArray;
  import flash.events.IOErrorEvent;
  public class FileReference extends EventDispatcher {
    public function FileReference() {}
    public native function get creationDate():Date;
    public native function get creator():String;
    public native function get modificationDate():Date;
    public native function get name():String;
    public native function get size():Number;
    public native function get type():String;
    public native function cancel():void;
    public native function download(request:URLRequest, defaultFileName:String = null):void;
    public native function upload(request:URLRequest, uploadDataFieldName:String = "Filedata", testUpload:Boolean = false):void;
    public native function get data():ByteArray;
    public function load():void { notImplemented("load"); }
    public function save(data, defaultFileName:String = null):void { notImplemented("save"); }
    public native function browse(typeFilter:Array = null):Boolean;
  }
}
