package flash.media {

  [native(cls="SoundTransformClass")]
  public final class SoundTransform {
    public function SoundTransform(vol:Number=1, panning:Number=0) {}

    public native function get volume():Number;
    public native function set volume(volume:Number):void;
    public native function get leftToLeft():Number;
    public native function set leftToLeft(leftToLeft:Number):void;
    public native function get leftToRight():Number;
    public native function set leftToRight(leftToRight:Number):void;
    public native function get rightToRight():Number;
    public native function set rightToRight(rightToRight:Number):void;
    public native function get rightToLeft():Number;
    public native function set rightToLeft(rightToLeft:Number):void;

    public function get pan():Number { notImplemented("pan"); }
    public function set pan(panning:Number):void { notImplemented("pan"); }
  }

}
