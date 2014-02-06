package flash.filters {
  import flash.filters.BitmapFilter;
  import String;
  import Boolean;
  import uint;
  import Number;
  import int;
  public final class BevelFilter extends BitmapFilter {
    public function BevelFilter(distance:Number = 4, angle:Number = 45, highlightColor:uint = 16777215, highlightAlpha:Number = 1, shadowColor:uint = 0, shadowAlpha:Number = 1, blurX:Number = 4, blurY:Number = 4, strength:Number = 1, quality:int = 1, type:String = "inner", knockout:Boolean = false) {}
    public native function get distance():Number;
    public native function set distance(value:Number):void;
    public native function get angle():Number;
    public native function set angle(value:Number):void;
    public native function get highlightColor():uint;
    public native function set highlightColor(value:uint):void;
    public native function get highlightAlpha():Number;
    public native function set highlightAlpha(value:Number):void;
    public native function get shadowColor():uint;
    public native function set shadowColor(value:uint):void;
    public native function get shadowAlpha():Number;
    public native function set shadowAlpha(value:Number):void;
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
