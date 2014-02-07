package flash.filters {
public final class GlowFilter extends BitmapFilter {
    public function GlowFilter(color:uint = 16711680, alpha:Number = 1, blurX:Number = 6, blurY:Number = 6, strength:Number = 2, quality:int = 1, inner:Boolean = false, knockout:Boolean = false) {}
    public native function get color():uint;
    public native function set color(value:uint):void;
    public native function get alpha():Number;
    public native function set alpha(value:Number):void;
    public native function get blurX():Number;
    public native function set blurX(value:Number):void;
    public native function get blurY():Number;
    public native function set blurY(value:Number):void;
    public native function get inner():Boolean;
    public native function set inner(value:Boolean):void;
    public native function get knockout():Boolean;
    public native function set knockout(value:Boolean):void;
    public native function get quality():int;
    public native function set quality(value:int):void;
    public native function get strength():Number;
    public native function set strength(value:Number):void;
    public override function clone():BitmapFilter { notImplemented("clone"); return null; }
  }
}
