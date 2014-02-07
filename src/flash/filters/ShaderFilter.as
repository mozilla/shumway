package flash.filters {
import flash.display.Shader;

public class ShaderFilter extends BitmapFilter {
    public function ShaderFilter(shader:Shader = null) {}
    public native function get shader():Shader;
    public native function set shader(shader:Shader):void;
    public function get leftExtension():int { notImplemented("leftExtension"); return -1; }
    public function set leftExtension(v:int):void { notImplemented("leftExtension"); }
    public function get topExtension():int { notImplemented("topExtension"); return -1; }
    public function set topExtension(v:int):void { notImplemented("topExtension"); }
    public function get rightExtension():int { notImplemented("rightExtension"); return -1; }
    public function set rightExtension(v:int):void { notImplemented("rightExtension"); }
    public function get bottomExtension():int { notImplemented("bottomExtension"); return -1; }
    public function set bottomExtension(v:int):void { notImplemented("bottomExtension"); }
  }
}
