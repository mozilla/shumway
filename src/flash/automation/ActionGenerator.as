package flash.automation {
  import Object;
  import flash.automation.AutomationAction;
  public class ActionGenerator {
    public function ActionGenerator() {}
    public native function generateActions(a:Array):void;
    public function generateAction(action:AutomationAction):void { notImplemented("generateAction"); }
  }
}
