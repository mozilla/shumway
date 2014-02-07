package flash.automation {
public class MouseAutomationAction extends AutomationAction {
    public function MouseAutomationAction(type:String, stageX:Number = 0, stageY:Number = 0, delta:int = 0) {}
    public static const MOUSE_DOWN:String = "mouseDown";
    public static const MOUSE_MOVE:String = "mouseMove";
    public static const MOUSE_UP:String = "mouseUp";
    public static const MOUSE_WHEEL:String = "mouseWheel";
    public static const MIDDLE_MOUSE_DOWN:String = "middleMouseDown";
    public static const MIDDLE_MOUSE_UP:String = "middleMouseUp";
    public static const RIGHT_MOUSE_DOWN:String = "rightMouseDown";
    public static const RIGHT_MOUSE_UP:String = "rightMouseUp";
    public function get stageX():Number { notImplemented("stageX"); return -1; }
    public function set stageX(value:Number):void { notImplemented("stageX"); }
    public function get stageY():Number { notImplemented("stageY"); return -1; }
    public function set stageY(value:Number):void { notImplemented("stageY"); }
    public function get delta():int { notImplemented("delta"); return -1; }
    public function set delta(value:int):void { notImplemented("delta"); }
  }
}
