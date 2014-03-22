/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf BlurFilterTest,600,600,60 -p test/swfs/flash_filters_BlurFilter.as
*/

package {

    import flash.display.Sprite;
    import flash.events.Event;
    import flash.display.Shape;

    public class BlurFilterTest extends Sprite {
        public var loader;
        public function BlurFilterTest() {
            var child = new TestObject();
            background(0xFFFFFF);
            addEventListener(Event.ENTER_FRAME, child.enterFrameHandler);
            addChild(child);
        }

        public function background(color) {
            var bg = new Shape;
            bg.graphics.beginFill(color);
            bg.graphics.drawRect(0, 0, 600, 600);
            bg.graphics.endFill();
            addChild(bg);
        }

    }

}

import flash.display.*;
import flash.events.*;
import flash.filters.*;

class TestObject extends Sprite {
    private var color: uint = 0xFFCC00;
    private var pos: uint   = 200;
    private var size: uint  = 200;
    private var filter;
    public function TestObject() {
        graphics.beginFill(color);
        graphics.drawRect(pos, pos, size, size);
        filter = new BlurFilter();
        filters = [ filter ];
    }

    private var frameCount = 0;

    function enterFrameHandler(event:Event):void {
        frameCount++;
        var target = event.target;
        var loader = target.loader;
        switch (frameCount) {
        case 1:
            (function () {
                var result = filter.blurX === 4 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::BlurFilter/get blurX (): " + filter.blurX);
                var result = filter.blurY === 4 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::BlurFilter/get blurY (): " + filter.blurY);
                var result = filter.quality === BitmapFilterQuality.LOW ? "PASS" : "FAIL";
                trace(result + ": flash.filters::BlurFilter/get quality (): " + filter.quality);
            })();
            break;
        case 2:
            (function () {
                filter.blurX = 128;
                filters = [filter];
                var result = filter.blurX === 128 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::BlurFilter/set blurX ()");
                trace(result + ": flash.filters::BlurFilter/get blurX ()");
            })();
            break;
        case 3:
            (function () {
                filter.blurY = 128;
                filters = [filter];
                var result = filter.blurY === 128 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::BlurFilter/set blurY ()");
                trace(result + ": flash.filters::BlurFilter/get blurY ()");
            })();
            break;
        case 4:
            (function () {
                filter.quality = BitmapFilterQuality.HIGH;
                filters = [filter];
                var result = filter.quality === BitmapFilterQuality.HIGH ? "PASS" : "FAIL";
                trace(result + ": flash.filters::BlurFilter/set quality ()");
                trace(result + ": flash.filters::BlurFilter/get quality ()");
            })();
            break;
        default:
            parent.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
            break;
        }
    }
}
