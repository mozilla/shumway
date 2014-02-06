package flash.filters {
  import flash.filters.BitmapFilter;
  import flash.geom.Rectangle;
  import flash.display.Shader;
  import int;
  import Number;
  import int;
  public class ShaderFilter extends BitmapFilter {
    public function ShaderFilter(shader:Shader = null) {}
    public native function get shader():Shader;
    public native function set shader(shader:Shader):void;
    public function get leftExtension():int { notImplemented("leftExtension"); }
    public function set leftExtension(v:int):void { notImplemented("leftExtension"); }
    public function get topExtension():int { notImplemented("topExtension"); }
    public function set topExtension(v:int):void { notImplemented("topExtension"); }
    public function get rightExtension():int { notImplemented("rightExtension"); }
    public function set rightExtension(v:int):void { notImplemented("rightExtension"); }
    public function get bottomExtension():int { notImplemented("bottomExtension"); }
    public function set bottomExtension(v:int):void { notImplemented("bottomExtension"); }
  }
}
