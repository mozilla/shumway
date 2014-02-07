package flash.events {
public class TransformGestureEvent extends GestureEvent {
    public function TransformGestureEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false, phase:String = null, localX:Number = 0, localY:Number = 0, scaleX:Number = 1, scaleY:Number = 1, rotation:Number = 0, offsetX:Number = 0, offsetY:Number = 0, ctrlKey:Boolean = false, altKey:Boolean = false, shiftKey:Boolean = false) {
      super(type, bubbles, cancelable);
      notImplemented("TransformGestureEvent");
    }
    public static const GESTURE_ZOOM:String = "gestureZoom";
    public static const GESTURE_PAN:String = "gesturePan";
    public static const GESTURE_ROTATE:String = "gestureRotate";
    public static const GESTURE_SWIPE:String = "gestureSwipe";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get scaleX():Number { notImplemented("scaleX"); return -1; }
    public function set scaleX(value:Number):void { notImplemented("scaleX"); }
    public function get scaleY():Number { notImplemented("scaleY"); return -1; }
    public function set scaleY(value:Number):void { notImplemented("scaleY"); }
    public function get rotation():Number { notImplemented("rotation"); return -1; }
    public function set rotation(value:Number):void { notImplemented("rotation"); }
    public function get offsetX():Number { notImplemented("offsetX"); return -1; }
    public function set offsetX(value:Number):void { notImplemented("offsetX"); }
    public function get offsetY():Number { notImplemented("offsetY"); return -1; }
    public function set offsetY(value:Number):void { notImplemented("offsetY"); }
  }
}
