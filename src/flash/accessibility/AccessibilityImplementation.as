package flash.accessibility {
import flash.geom.Rectangle;

public class AccessibilityImplementation {
    public function AccessibilityImplementation() {}
    public var stub:Boolean;
    public var errno:uint;
    public function get_accRole(childID:uint):uint { notImplemented("get_accRole"); return 0; }
    public function get_accName(childID:uint):String { notImplemented("get_accName"); return ""; }
    public function get_accValue(childID:uint):String { notImplemented("get_accValue"); return ""; }
    public function get_accState(childID:uint):uint { notImplemented("get_accState"); return 0; }
    public function get_accDefaultAction(childID:uint):String { notImplemented("get_accDefaultAction"); return ""; }
    public function accDoDefaultAction(childID:uint):void { notImplemented("accSelect"); }
    public function isLabeledBy(labelBounds:Rectangle):Boolean { notImplemented("isLabeledBy"); return false; }
    public function getChildIDArray():Array { notImplemented("getChildIDArray"); return null; }
    public function accLocation(childID:uint) { notImplemented("accLocation"); }
    public function get_accSelection():Array { notImplemented("get_accSelection"); return null; }
    public function get_accFocus():uint { notImplemented("get_accFocus"); return 0; }
    public function accSelect(operation:uint, childID:uint):void { notImplemented("accSelect"); }
    public function get_selectionAnchorIndex() { notImplemented("get_selectionAnchorIndex"); }
    public function get_selectionActiveIndex() { notImplemented("get_selectionActiveIndex"); }
  }
}
