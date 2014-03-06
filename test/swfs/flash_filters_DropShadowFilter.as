/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf DropShadowFilterTest,600,600,60 -p test/swfs/flash_filters_DropShadowFilter.as
*/

package {

    import flash.display.Sprite;
    import flash.events.Event;
    import flash.display.Shape;

    public class DropShadowFilterTest extends Sprite {
        public var loader;
        public function DropShadowFilterTest() {
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
        filter = new DropShadowFilter();
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
                var result = filter.angle === 45 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/get angle (): " + filter.angle);
                var result = Math.round(filter.alpha * 100) === 100 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/get alpha (): " + filter.alpha);
                var result = filter.blurX === 4 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/get blurX (): " + filter.blurX);
                var result = filter.blurY === 4 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/get blurY (): " + filter.blurY);
                var result = filter.color === 0 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/get color (): " + filter.color);
                var result = filter.distance === 4 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/get distance (): " + filter.distance);
                var result = filter.hideObject === false ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/get hideObject (): " + filter.hideObject);
                var result = filter.inner === false ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/get inner (): " + filter.inner);
                var result = filter.knockout === false ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/get knockout (): " + filter.knockout);
                var result = filter.quality === BitmapFilterQuality.LOW ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/get quality (): " + filter.quality);
                var result = filter.strength === 1 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/get strength (): " + filter.strength);
            })();
            break;
        case 2:
            (function () {
                filter.angle = 225;
                filters = [filter];
                var result = filter.angle === 225 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/set angle ()");
                trace(result + ": flash.filters::DropShadowFilter/get angle ()");
            })();
            break;
        case 3:
            (function () {
                filter.alpha = 1;
                filters = [filter];
                var result = Math.round(filter.alpha * 100) === 100 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/set alpha ()");
                trace(result + ": flash.filters::DropShadowFilter/get alpha ()");
            })();
            break;
        case 4:
            (function () {
                filter.blurX = 128;
                filters = [filter];
                var result = filter.blurX === 128 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/set blurX ()");
                trace(result + ": flash.filters::DropShadowFilter/get blurX ()");
            })();
            break;
        case 5:
            (function () {
                filter.blurY = 128;
                filters = [filter];
                var result = filter.blurY === 128 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/set blurY ()");
                trace(result + ": flash.filters::DropShadowFilter/get blurY ()");
            })();
            break;
        case 6:
            (function () {
                filter.color = 0xFF0000;
                filters = [filter];
                var result = filter.color === 0xFF0000 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/set color ()");
                trace(result + ": flash.filters::DropShadowFilter/get color ()");
            })();
            break; 
        case 7:
            (function () {
                filter.distance = 20;
                filters = [filter];
                var result = filter.distance === 20 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/set distance ()");
                trace(result + ": flash.filters::DropShadowFilter/get distance ()");
            })();
            break;
        case 8:
            (function () {
                filter.hideObject = true;
                filters = [filter];
                var result = filter.hideObject === true ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/set hideObject ()");
                trace(result + ": flash.filters::DropShadowFilter/get hideObject ()");
            })();
            (function () {
                filter.inner = true;
                filters = [filter];
                var result = filter.inner === true ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/set inner ()");
                trace(result + ": flash.filters::DropShadowFilter/get inner ()");
            })();
            (function () {
                filter.knockout = true;
                filters = [filter];
                var result = filter.knockout === true ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/set knockout ()");
                trace(result + ": flash.filters::DropShadowFilter/get knockout ()");
            })();
            (function () {
                filter.quality = BitmapFilterQuality.HIGH;
                filters = [filter];
                var result = filter.quality === BitmapFilterQuality.HIGH ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/set quality ()");
                trace(result + ": flash.filters::DropShadowFilter/get quality ()");
            })();
            (function () {
                filter.strength = 255;
                filters = [filter];
                var result = filter.strength === 255 ? "PASS" : "FAIL";
                trace(result + ": flash.filters::DropShadowFilter/set strength ()");
                trace(result + ": flash.filters::DropShadowFilter/get strength ()");
            })();
            break;
        default:
            parent.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
            break;
        }
    }
}

