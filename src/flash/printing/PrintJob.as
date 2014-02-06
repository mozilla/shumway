package flash.printing {
  import flash.events.EventDispatcher;
  import String;
  import flash.geom.Rectangle;
  import Boolean;
  import flash.display.Sprite;
  import uint;
  import flash.printing.PrintJobOptions;
  import int;
  import Object;
  import Error;
  public class PrintJob extends EventDispatcher {
    public function PrintJob() {}
    public static function get isSupported():Boolean { notImplemented("isSupported"); }
    public function get paperHeight():int { notImplemented("paperHeight"); }
    public function get paperWidth():int { notImplemented("paperWidth"); }
    public function get pageHeight():int { notImplemented("pageHeight"); }
    public function get pageWidth():int { notImplemented("pageWidth"); }
    public function get orientation():String { notImplemented("orientation"); }
    public function start():Boolean { notImplemented("start"); }
    public function send():void { notImplemented("send"); }
    public function addPage(sprite:Sprite, printArea:Rectangle = null, options:PrintJobOptions = null, frameNum:int = 0):void { notImplemented("addPage"); }
  }
}
