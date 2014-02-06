package flash.desktop {
  import Object;
  import flash.utils.Dictionary;
  import flash.utils.ByteArray;
  import flash.utils.Dictionary;
  import SecurityError;
  import flash.errors.IllegalOperationError;
  import Error;
  import TypeError;
  import flash.utils.ByteArray;
  public class Clipboard {
    public function Clipboard() {}
    public static native function get generalClipboard():Clipboard;
    public native function get formats():Array;
    public native function clear():void;
    public native function clearData(format:String):void;
    public function setData(format:String, data:Object, serializable:Boolean = true):Boolean { notImplemented("setData"); }
    public function setDataHandler(format:String, handler:Function, serializable:Boolean = true):Boolean { notImplemented("setDataHandler"); }
    public function getData(format:String, transferMode:String = "originalPreferred"):Object { notImplemented("getData"); }
    public function hasFormat(format:String):Boolean { notImplemented("hasFormat"); }
  }
}
