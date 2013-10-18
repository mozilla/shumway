package {

import flash.display.Bitmap;
import flash.display.Sprite;

public class Flexbitmap extends Sprite {
  [Embed(source="firefox.png")]
  private static const ImgClass : Class;
    public function Flexbitmap() {
      var image : Bitmap = new ImgClass();
      addChild(image);
    }
}
}
