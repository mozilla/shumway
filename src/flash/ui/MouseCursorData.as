package flash.ui {
import flash.geom.Point;

public final class MouseCursorData {
    public function MouseCursorData() {}
    public native function get data():Vector;
    public native function set data(data:Vector):void;
    public native function get hotSpot():Point;
    public native function set hotSpot(data:Point):void;
    public native function get frameRate():Number;
    public native function set frameRate(data:Number):void;
  }
}
