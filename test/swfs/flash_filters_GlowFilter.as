/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf GlowFilterTest,600,600,60 -p test/swfs/flash_filters_GlowFilter.as
*/

package {

    import flash.display.Sprite;
    import flash.events.Event;
    import flash.display.Shape;

    public class GlowFilterTest extends Sprite {
        public var loader;
        public function GlowFilterTest() {
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
        filter = new GlowFilter(0, 0.25, 14, 14, 1, 1);
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
                var result = Math.round(filter.alpha * 100) === 25 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/get alpha ()");
                var result = filter.blurX === 14 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/get blurX ()");
                var result = filter.blurY === 14 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/get blurY ()");
                var result = filter.color === 0 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/get color ()");
                var result = filter.inner === false ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/get inner ()");
                var result = filter.knockout === false ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/get knockout ()");
                var result = filter.quality === BitmapFilterQuality.LOW ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/get quality ()");
                var result = filter.strength === 1 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/get strength ()");
            })();
            break;
        case 2:
            (function () {
                filter.alpha = 1;
                filters = [filter];
                var result = Math.round(filter.alpha * 100) === 100 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/set alpha ()");
                trace(result + ": flash.filters::GlowFilter/get alpha ()");
                stage.invalidate();
            })();
            break;
        case 3:
            (function () {
                filter.blurX = 128;
                filters = [filter];
                var result = filter.blurX === 128 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/set blurX ()");
                trace(result + ": flash.filters::GlowFilter/get blurX ()");
                stage.invalidate();
            })();
            break;
        case 4:
            (function () {
                filter.blurY = 128;
                filters = [filter];
                var result = filter.blurY === 128 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/set blurY ()");
                trace(result + ": flash.filters::GlowFilter/get blurY ()");
                stage.invalidate();
            })();
            break;
        case 5:
            (function () {
                filter.color = 0xFF0000;
                filters = [filter];
                var result = filter.color === 0xFF0000 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/set color ()");
                trace(result + ": flash.filters::GlowFilter/get color ()");
                stage.invalidate();
            })();
            break;
        case 6:
            (function () {
                filter.inner = true;
                filters = [filter];
                var result = filter.inner === true ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/set inner ()");
                trace(result + ": flash.filters::GlowFilter/get inner ()");
            })();
            break;
        case 7:
            (function () {
                filter.knockout = true;
                filters = [filter];
                var result = filter.knockout === true ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/set knockout ()");
                trace(result + ": flash.filters::GlowFilter/get knockout ()");
            })();
            break;
        case 8:
            (function () {
                filter.quality = BitmapFilterQuality.HIGH;
                filters = [filter];
                var result = filter.quality === BitmapFilterQuality.HIGH ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/set quality ()");
                trace(result + ": flash.filters::GlowFilter/get quality ()");
            })();
            break;
        case 9:
            (function () {
                filter.strength = 255;
                filters = [filter];
                var result = filter.strength === 255 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::GlowFilter/set strength ()");
                trace(result + ": flash.filters::GlowFilter/get strength ()");
            })();
            break;
        default:
            parent.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
            break;
        }
    }
}

