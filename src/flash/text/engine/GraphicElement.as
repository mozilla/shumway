package flash.text.engine {
  import flash.text.engine.ContentElement;
  import String;
  import flash.display.DisplayObject;
  import Number;
  import flash.text.engine.ElementFormat;
  import flash.events.EventDispatcher;
  public final class GraphicElement extends ContentElement {
    public function GraphicElement(graphic:DisplayObject = null, elementWidth:Number = 15, elementHeight:Number = 15, elementFormat:ElementFormat = null, eventMirror:EventDispatcher = null, textRotation:String = "rotate0") {}
    public native function get graphic():DisplayObject;
    public native function set graphic(value:DisplayObject):void;
    public native function get elementHeight():Number;
    public native function set elementHeight(value:Number):void;
    public native function get elementWidth():Number;
    public native function set elementWidth(value:Number):void;
  }
}
