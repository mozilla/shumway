package flash.display {
import flash.media.SoundTransform;

public class SimpleButton extends InteractiveObject {
    public function SimpleButton(upState:DisplayObject = null, overState:DisplayObject = null, downState:DisplayObject = null, hitTestState:DisplayObject = null) {}
    public native function get useHandCursor():Boolean;
    public native function set useHandCursor(value:Boolean):void;
    public native function get enabled():Boolean;
    public native function set enabled(value:Boolean):void;
    public native function get trackAsMenu():Boolean;
    public native function set trackAsMenu(value:Boolean):void;
    public native function get upState():DisplayObject;
    public native function set upState(value:DisplayObject):void;
    public native function get overState():DisplayObject;
    public native function set overState(value:DisplayObject):void;
    public native function get downState():DisplayObject;
    public native function set downState(value:DisplayObject):void;
    public native function get hitTestState():DisplayObject;
    public native function set hitTestState(value:DisplayObject):void;
    public native function get soundTransform():SoundTransform;
    public native function set soundTransform(sndTransform:SoundTransform):void;
  }
}
