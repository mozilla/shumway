package flash.filters {
  import flash.filters.BitmapFilter;
  import String;
  import Array;
  import Boolean;
  import Number;
  import int;
  public final class GradientBevelFilter extends BitmapFilter {
    public function GradientBevelFilter(distance:Number = 4, angle:Number = 45, colors:Array = null, alphas:Array = null, ratios:Array = null, blurX:Number = 4, blurY:Number = 4, strength:Number = 1, quality:int = 1, type:String = "inner", knockout:Boolean = false) {}
    public native function get distance():Number;
    public native function set distance(value:Number):void;
    public native function get angle():Number;
    public native function set angle(value:Number):void;
    public native function get colors():Array;
    public native function set colors(value:Array):void;
    public native function get alphas():Array;
    public native function set alphas(value:Array):void;
    public native function get ratios():Array;
    public native function set ratios(value:Array):void;
    public native function get blurX():Number;
    public native function set blurX(value:Number):void;
    public native function get blurY():Number;
    public native function set blurY(value:Number):void;
    public native function get knockout():Boolean;
    public native function set knockout(value:Boolean):void;
    public native function get quality():int;
    public native function set quality(value:int):void;
    public native function get strength():Number;
    public native function set strength(value:Number):void;
    public native function get type():String;
    public native function set type(value:String):void;
    public override function clone():BitmapFilter { notImplemented("clone"); }
  }
}
