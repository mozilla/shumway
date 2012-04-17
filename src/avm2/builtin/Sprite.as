package flash.display {

  import flash.geom.Rectangle;
  import flash.media.SoundTransform;

  [native(cls="SpriteClass")]
  public class Sprite extends DisplayObjectContainer {
    public function Sprite() {}

    public native function get graphics():Graphics;
    public native function get buttonMode():Boolean;
    public native function set buttonMode(value:Boolean):void;
    public native function startDrag(lockCenter:Boolean=false, bounds:Rectangle=null):void;
    public native function stopDrag():void;
    // [API("667")]
    public native function startTouchDrag(touchPointID:int, lockCenter:Boolean=false, bounds:Rectangle=null):void;
    // [API("667")]
    public native function stopTouchDrag(touchPointID:int):void;
    public native function get dropTarget():DisplayObject;
    private native function constructChildren():void;
    public native function get hitArea():Sprite;
    public native function set hitArea(value:Sprite):void;
    public native function get useHandCursor():Boolean;
    public native function set useHandCursor(value:Boolean):void;
    public native function get soundTransform():SoundTransform;
    public native function set soundTransform(sndTransform:SoundTransform):void;
  }

}
