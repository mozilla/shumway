package flash.filters {
public final class ColorMatrixFilter extends BitmapFilter {
    public function ColorMatrixFilter(matrix:Array = null) {}
    public native function get matrix():Array;
    public native function set matrix(value:Array):void;
    public override function clone():BitmapFilter { notImplemented("clone"); return null; }
  }
}
