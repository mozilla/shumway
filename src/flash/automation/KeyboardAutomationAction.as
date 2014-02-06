package flash.automation {
  import flash.automation.AutomationAction;
  import String;
  import uint;
  public class KeyboardAutomationAction extends AutomationAction {
    public function KeyboardAutomationAction(type:String, keyCode:uint = 0) {}
    public static const KEY_DOWN:String = "keyDown";
    public static const KEY_UP:String = "keyUp";
    public function get keyCode():uint { notImplemented("keyCode"); }
    public function set keyCode(value:uint):void { notImplemented("keyCode"); }
  }
}
