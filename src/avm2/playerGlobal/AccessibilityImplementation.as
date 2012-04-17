package flash.accessibility {

  import flash.geom.Rectangle;

  public class AccessibilityImplementation {
    public function AccessibilityImplementation() {}

    public var stub:Boolean;
    public var errno:uint;

    public function get_accRole(childID:uint):uint { notImplemented("get_accRole"); }
    public function get_accName(childID:uint):String { notImplemented("get_accName"); }
    public function get_accValue(childID:uint):String { notImplemented("get_accValue"); }
    public function get_accState(childID:uint):uint { notImplemented("get_accState"); }
    public function get_accDefaultAction(childID:uint):String { notImplemented("get_accDefaultAction"); }
    public function accDoDefaultAction(childID:uint):void { notImplemented("accDoDefaultAction"); }
    public function isLabeledBy(labelBounds:Rectangle):Boolean { notImplemented("isLabeledBy"); }
    public function getChildIDArray():Array { notImplemented("getChildIDArray"); }
    public function accLocation(childID:uint) { notImplemented("accLocation"); }
    public function get_accSelection():Array { notImplemented("get_accSelection"); }
    public function get_accFocus():uint { notImplemented("get_accFocus"); }
    public function accSelect(operation:uint, childID:uint):void { notImplemented("accSelect"); }
  }

}
