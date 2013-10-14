package {

import flash.display.Bitmap;
import flash.display.Sprite;

public class NonSmoothedBitmap extends Sprite {
  [Embed(source="bitmap.png")]
  private static const ImgClass : Class;
    public function NonSmoothedBitmap() {
      var image : Bitmap = new ImgClass();
      image.scaleX = image.scaleY = 2;
      addChild(image);
    }
}
}
