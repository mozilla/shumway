package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import Number;
  import int;
  import flash.display.InteractiveObject;
  import isNaN;
  import Number;
  public class TouchEvent extends Event {
    public function TouchEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false, touchPointID:int = 0, isPrimaryTouchPoint:Boolean = false, localX:Number = NaN, localY:Number = NaN, sizeX:Number = NaN, sizeY:Number = NaN, pressure:Number = NaN, relatedObject:InteractiveObject = null, ctrlKey:Boolean = false, altKey:Boolean = false, shiftKey:Boolean = false) {}
    public static const TOUCH_BEGIN:String = "touchBegin";
    public static const TOUCH_END:String = "touchEnd";
    public static const TOUCH_MOVE:String = "touchMove";
    public static const TOUCH_OVER:String = "touchOver";
    public static const TOUCH_OUT:String = "touchOut";
    public static const TOUCH_ROLL_OVER:String = "touchRollOver";
    public static const TOUCH_ROLL_OUT:String = "touchRollOut";
    public static const TOUCH_TAP:String = "touchTap";
    public static const PROXIMITY_BEGIN:String = "proximityBegin";
    public static const PROXIMITY_END:String = "proximityEnd";
    public static const PROXIMITY_MOVE:String = "proximityMove";
    public static const PROXIMITY_OUT:String = "proximityOut";
    public static const PROXIMITY_OVER:String = "proximityOver";
    public static const PROXIMITY_ROLL_OUT:String = "proximityRollOut";
    public static const PROXIMITY_ROLL_OVER:String = "proximityRollOver";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public native function get localX():Number;
    public native function set localX(value:Number):void;
    public native function get localY():Number;
    public native function set localY(value:Number):void;
    public function get touchPointID():int { notImplemented("touchPointID"); }
    public function set touchPointID(value:int):void { notImplemented("touchPointID"); }
    public function get isPrimaryTouchPoint():Boolean { notImplemented("isPrimaryTouchPoint"); }
    public function set isPrimaryTouchPoint(value:Boolean):void { notImplemented("isPrimaryTouchPoint"); }
    public function get sizeX():Number { notImplemented("sizeX"); }
    public function set sizeX(value:Number):void { notImplemented("sizeX"); }
    public function get sizeY():Number { notImplemented("sizeY"); }
    public function set sizeY(value:Number):void { notImplemented("sizeY"); }
    public function get pressure():Number { notImplemented("pressure"); }
    public function set pressure(value:Number):void { notImplemented("pressure"); }
    public function get relatedObject():InteractiveObject { notImplemented("relatedObject"); }
    public function set relatedObject(value:InteractiveObject):void { notImplemented("relatedObject"); }
    public function get ctrlKey():Boolean { notImplemented("ctrlKey"); }
    public function set ctrlKey(value:Boolean):void { notImplemented("ctrlKey"); }
    public function get altKey():Boolean { notImplemented("altKey"); }
    public function set altKey(value:Boolean):void { notImplemented("altKey"); }
    public function get shiftKey():Boolean { notImplemented("shiftKey"); }
    public function set shiftKey(value:Boolean):void { notImplemented("shiftKey"); }
    public function get stageX():Number { notImplemented("stageX"); }
    public function get stageY():Number { notImplemented("stageY"); }
    public native function updateAfterEvent():void;
    public function get isRelatedObjectInaccessible():Boolean { notImplemented("isRelatedObjectInaccessible"); }
    public function set isRelatedObjectInaccessible(value:Boolean):void { notImplemented("isRelatedObjectInaccessible"); }
  }
}
