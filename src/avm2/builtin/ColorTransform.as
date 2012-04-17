package flash.geom {

  [native(cls="ColorTransformClass")]
  public class ColorTransform {
    public function ColorTransform(redMultiplier:Number=1, greenMultiplier:Number=1, blueMultiplier:Number=1, alphaMultiplier:Number=1, redOffset:Number=0, greenOffset:Number=0, blueOffset:Number=0, alphaOffset:Number=0) {}

    public var redMultiplier:Number;
    public var greenMultiplier:Number;
    public var blueMultiplier:Number;
    public var alphaMultiplier:Number;
    public var redOffset:Number;
    public var greenOffset:Number;
    public var blueOffset:Number;
    public var alphaOffset:Number;

    public function get color():uint { notImplemented("color"); }
    public function set color(newColor:uint):void { notImplemented("color"); }
    public function concat(second:ColorTransform):void { notImplemented("concat"); }
    public function toString():String { notImplemented("toString"); }
  }

}
