/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   java -jar utils/asc.jar -import playerglobal.abc -swf BitmapDataTest,600,600 test/swfs/flash_ui_BitmapData.as
*/

package {
    import flash.display.Sprite;
    import flash.events.Event;

    public class BitmapDataTest extends Sprite {
        public var child;
        public function BitmapDataTest() {
            stage.frameRate = 10;
            child = new BitmapDataObject();
            addChild(child);
            addEventListener(Event.ENTER_FRAME, child.enterFrameHandler);
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.ui.*;

class BitmapDataObject extends Sprite {
    private var color:uint = 0xFFCC00;
    private var size:uint  = 80;

    var bitmapData;
    public function BitmapDataObject() {
        var child = bitmapData = new BitmapData(100, 100, false);
        graphics.beginFill(color);
        graphics.drawRect(0, 0, 100, 100);
    }

    function menuSelectHandler(e) {
        var result = true ? "PASS" : "FAIL";
        trace(result + ": flash.ui::BitmapData/event menuSelect ()");
    }

    private var frameCount = 0;

    function enterFrameHandler(event:Event):void {
        frameCount++;
        var target = event.target;
        switch (frameCount) {
        case 1:
            (function () {
                bitmapData.draw(target);
                var result = bitmapData.getPixel(50, 50) === color ? "PASS" : "FAIL";
                trace(result + ": flash.ui::BitmapData/draw ()");
                trace(result + ": flash.ui::BitmapData/getPixel ()");
            })();
            break;
        default:
            parent.removeEventListener("enterFrame", enterFrameHandler);
            break;
        }
    }
}
