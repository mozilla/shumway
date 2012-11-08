package {
import flash.display.Bitmap;
import flash.display.BitmapData;
import flash.display.Sprite;
import flash.geom.Rectangle;

public class BitmapTests extends Sprite {
    //----------------------              Public Properties             ----------------------//


    //----------------------       Private / Protected Properties       ----------------------//


    //----------------------               Public Methods               ----------------------//
    public function BitmapTests() {
        var bits : BitmapData = new BitmapData(100, 100, false, 0xff0000);
        var bitmap : Bitmap = new Bitmap(bits);
        addChild(bitmap);
        bits.fillRect(new Rectangle(10, 10, 80, 80), 0x0000ff);
    }

    //----------------------         Private / Protected Methods        ----------------------//
}
}