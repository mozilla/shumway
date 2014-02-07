package flash.desktop {
public class Clipboard {
    public function Clipboard() {}
    public static native function get generalClipboard():Clipboard;
    public native function get formats():Array;
    public native function clear():void;
    public native function clearData(format:String):void;
    public function setData(format:String, data:Object, serializable:Boolean = true):Boolean { notImplemented("setData"); return false; }
    public function setDataHandler(format:String, handler:Function, serializable:Boolean = true):Boolean { notImplemented("setDataHandler"); return false; }
    public function getData(format:String, transferMode:String = "originalPreferred"):Object { notImplemented("getData"); return null; }
    public function hasFormat(format:String):Boolean { notImplemented("hasFormat"); return false; }
  }
}
