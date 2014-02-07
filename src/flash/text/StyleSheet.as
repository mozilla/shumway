package flash.text {
import flash.events.EventDispatcher;

public dynamic class StyleSheet extends EventDispatcher {
    public function StyleSheet() {}
    public function getStyle(styleName:String):Object { notImplemented("getStyle"); return null; }
    public function setStyle(styleName:String, styleObject:Object):void { notImplemented("setStyle"); }
    public function clear():void { notImplemented("clear"); }
    public function get styleNames():Array { notImplemented("styleNames"); return null; }
    public function transform(formatObject:Object):TextFormat { notImplemented("transform"); return null; }
    public function parseCSS(CSSText:String):void { notImplemented("parseCSS"); }
  }
}
