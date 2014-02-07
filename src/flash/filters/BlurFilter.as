package flash.filters {
public final class BlurFilter extends BitmapFilter {
    public function BlurFilter(blurX:Number = 4, blurY:Number = 4, quality:int = 1) {}
    public native function get blurX():Number;
    public native function set blurX(value:Number):void;
    public native function get blurY():Number;
    public native function set blurY(value:Number):void;
    public native function get quality():int;
    public native function set quality(value:int):void;
    public override function clone():BitmapFilter { notImplemented("clone"); return null; }
  }
}
