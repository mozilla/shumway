package flash.net {
import flash.events.EventDispatcher;
import flash.utils.ByteArray;

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
