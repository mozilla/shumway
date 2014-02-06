package flash.display {
  import flash.display.DisplayObject;
  import flash.display.Graphics;
  public class Shape extends DisplayObject {
    public function Shape() {}
    public native function get graphics():Graphics;
  }
}
