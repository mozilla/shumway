package flash.text.engine {
  import flash.text.engine.ContentElement;
  import String;
  import flash.text.engine.ElementFormat;
  import int;
  import flash.events.EventDispatcher;
  public final class TextElement extends ContentElement {
    public function TextElement(text:String = null, elementFormat:ElementFormat = null, eventMirror:EventDispatcher = null, textRotation:String = "rotate0") {}
    public native function set text(value:String):void;
    public native function replaceText(beginIndex:int, endIndex:int, newText:String):void;
  }
}
