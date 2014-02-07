package flash.automation {
public class KeyboardAutomationAction extends AutomationAction {
    public function KeyboardAutomationAction(type:String, keyCode:uint = 0) {}
    public static const KEY_DOWN:String = "keyDown";
    public static const KEY_UP:String = "keyUp";
    public function get keyCode():uint { notImplemented("keyCode"); return 0; }
    public function set keyCode(value:uint):void { notImplemented("keyCode"); }
  }
}
