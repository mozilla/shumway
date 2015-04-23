package {

import flash.display.Bitmap;
import flash.display.Shape;
import flash.display.Sprite;

public class NonSmoothedBitmap extends Sprite {
  [Embed(source="bitmap.png")]
  private static const ImgClass:Class;

  public function NonSmoothedBitmap() {
    var image:Bitmap = new ImgClass();
    image.scaleX = image.scaleY = 2;
    addChild(image);

    var shape:Shape = new Shape();
    shape.graphics.beginBitmapFill(image.bitmapData);
    shape.graphics.drawRect(0, 0, image.width/2, image.height/2);
    shape.scaleX = shape.scaleY = 2;
    shape.x = image.width + 10;
    addChild(shape);
  }
}
}
