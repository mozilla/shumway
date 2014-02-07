package flash.printing {
import flash.display.Sprite;
import flash.events.EventDispatcher;
import flash.geom.Rectangle;

public class PrintJob extends EventDispatcher {
    public function PrintJob() {}
    public static function get isSupported():Boolean { notImplemented("isSupported"); return false; }
    public function get paperHeight():int { notImplemented("paperHeight"); return -1; }
    public function get paperWidth():int { notImplemented("paperWidth"); return -1; }
    public function get pageHeight():int { notImplemented("pageHeight"); return -1; }
    public function get pageWidth():int { notImplemented("pageWidth"); return -1; }
    public function get orientation():String { notImplemented("orientation"); return ""; }
    public function start():Boolean { notImplemented("start"); return false; }
    public function send():void { notImplemented("send"); }
    public function addPage(sprite:Sprite, printArea:Rectangle = null, options:PrintJobOptions = null, frameNum:int = 0):void { notImplemented("addPage"); }
  }
}
