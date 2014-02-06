package flash.filters {
  import flash.filters.BitmapFilter;
  import Boolean;
  import uint;
  import Number;
  import int;
  public final class DropShadowFilter extends BitmapFilter {
    public function DropShadowFilter(distance:Number = 4, angle:Number = 45, color:uint = 0, alpha:Number = 1, blurX:Number = 4, blurY:Number = 4, strength:Number = 1, quality:int = 1, inner:Boolean = false, knockout:Boolean = false, hideObject:Boolean = false) {}
    public native function get distance():Number;
    public native function set distance(value:Number):void;
    public native function get angle():Number;
    public native function set angle(value:Number):void;
    public native function get color():uint;
    public native function set color(value:uint):void;
    public native function get alpha():Number;
    public native function set alpha(value:Number):void;
    public native function get blurX():Number;
    public native function set blurX(value:Number):void;
    public native function get blurY():Number;
    public native function set blurY(value:Number):void;
    public native function get hideObject():Boolean;
    public native function set hideObject(value:Boolean):void;
    public native function get inner():Boolean;
    public native function set inner(value:Boolean):void;
    public native function get knockout():Boolean;
    public native function set knockout(value:Boolean):void;
    public native function get quality():int;
    public native function set quality(value:int):void;
    public native function get strength():Number;
    public native function set strength(value:Number):void;
    public override function clone():BitmapFilter { notImplemented("clone"); }
  }
}
