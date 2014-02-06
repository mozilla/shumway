package flash.text.engine {
  import Object;
  import flash.geom.Rectangle;
  public final class FontMetrics {
    public function FontMetrics(emBox:Rectangle, strikethroughOffset:Number, strikethroughThickness:Number, underlineOffset:Number, underlineThickness:Number, subscriptOffset:Number, subscriptScale:Number, superscriptOffset:Number, superscriptScale:Number, lineGap:Number = 0) {}
    public var emBox:Rectangle;
    public var strikethroughOffset:Number;
    public var strikethroughThickness:Number;
    public var underlineOffset:Number;
    public var underlineThickness:Number;
    public var subscriptOffset:Number;
    public var subscriptScale:Number;
    public var superscriptOffset:Number;
    public var superscriptScale:Number;
    public var lineGap:Number;
  }
}
