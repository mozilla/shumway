package flash.display {
import flash.accessibility.AccessibilityImplementation;
import flash.geom.Rectangle;
import flash.ui.ContextMenu;

public class InteractiveObject extends DisplayObject {
    public function InteractiveObject() {}
    public native function get tabEnabled():Boolean;
    public native function set tabEnabled(enabled:Boolean):void;
    public native function get tabIndex():int;
    public native function set tabIndex(index:int):void;
    public native function get focusRect():Object;
    public native function set focusRect(focusRect:Object):void;
    public native function get mouseEnabled():Boolean;
    public native function set mouseEnabled(enabled:Boolean):void;
    public native function get doubleClickEnabled():Boolean;
    public native function set doubleClickEnabled(enabled:Boolean):void;
    public native function get accessibilityImplementation():AccessibilityImplementation;
    public native function set accessibilityImplementation(value:AccessibilityImplementation):void;
    public native function get softKeyboardInputAreaOfInterest():Rectangle;
    public native function set softKeyboardInputAreaOfInterest(value:Rectangle):void;
    public native function get needsSoftKeyboard():Boolean;
    public native function set needsSoftKeyboard(value:Boolean):void;
    public native function requestSoftKeyboard():Boolean;
    public native function get contextMenu():ContextMenu;
    public native function set contextMenu(cm:ContextMenu):void;
  }
}
