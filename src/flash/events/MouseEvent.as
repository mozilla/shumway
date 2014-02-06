package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import Number;
  import int;
  import flash.display.InteractiveObject;
  import isNaN;
  import Number;
  public class MouseEvent extends Event {
    public function MouseEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false, localX:Number = void 0, localY:Number = void 0, relatedObject:InteractiveObject = null, ctrlKey:Boolean = false, altKey:Boolean = false, shiftKey:Boolean = false, buttonDown:Boolean = false, delta:int = 0) {}
    public static const CLICK:String = "click";
    public static const DOUBLE_CLICK:String = "doubleClick";
    public static const MOUSE_DOWN:String = "mouseDown";
    public static const MOUSE_MOVE:String = "mouseMove";
    public static const MOUSE_OUT:String = "mouseOut";
    public static const MOUSE_OVER:String = "mouseOver";
    public static const MOUSE_UP:String = "mouseUp";
    public static const RELEASE_OUTSIDE:String = "releaseOutside";
    public static const MOUSE_WHEEL:String = "mouseWheel";
    public static const ROLL_OUT:String = "rollOut";
    public static const ROLL_OVER:String = "rollOver";
    public static const MIDDLE_CLICK:String = "middleClick";
    public static const MIDDLE_MOUSE_DOWN:String = "middleMouseDown";
    public static const MIDDLE_MOUSE_UP:String = "middleMouseUp";
    public static const RIGHT_CLICK:String = "rightClick";
    public static const RIGHT_MOUSE_DOWN:String = "rightMouseDown";
    public static const RIGHT_MOUSE_UP:String = "rightMouseUp";
    public static const CONTEXT_MENU:String = "contextMenu";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public native function get localX():Number;
    public native function set localX(value:Number):void;
    public native function get localY():Number;
    public native function set localY(value:Number):void;
    public function get relatedObject():InteractiveObject { notImplemented("relatedObject"); }
    public function set relatedObject(value:InteractiveObject):void { notImplemented("relatedObject"); }
    public function get ctrlKey():Boolean { notImplemented("ctrlKey"); }
    public function set ctrlKey(value:Boolean):void { notImplemented("ctrlKey"); }
    public function get altKey():Boolean { notImplemented("altKey"); }
    public function set altKey(value:Boolean):void { notImplemented("altKey"); }
    public function get shiftKey():Boolean { notImplemented("shiftKey"); }
    public function set shiftKey(value:Boolean):void { notImplemented("shiftKey"); }
    public function get buttonDown():Boolean { notImplemented("buttonDown"); }
    public function set buttonDown(value:Boolean):void { notImplemented("buttonDown"); }
    public function get delta():int { notImplemented("delta"); }
    public function set delta(value:int):void { notImplemented("delta"); }
    public function get stageX():Number { notImplemented("stageX"); }
    public function get stageY():Number { notImplemented("stageY"); }
    public native function updateAfterEvent():void;
    public function get isRelatedObjectInaccessible():Boolean { notImplemented("isRelatedObjectInaccessible"); }
    public function set isRelatedObjectInaccessible(value:Boolean):void { notImplemented("isRelatedObjectInaccessible"); }
    public native function get movementX():Number;
    public native function set movementX(value:Number):void;
    public native function get movementY():Number;
    public native function set movementY(value:Number):void;
  }
}
