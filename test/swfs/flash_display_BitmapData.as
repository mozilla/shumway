/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf BitmapDataTest,600,600,60 -p test/swfs/flash_display_BitmapData.as
*/

package {
    import flash.display.Sprite;
    import flash.events.Event;

    public class BitmapDataTest extends Sprite {
        public var child;
        public function BitmapDataTest() {
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

    public function BitmapDataObject() {
        graphics.beginFill(color);
        graphics.drawRect(0, 0, 100, 100);
    }

    function menuSelectHandler(e) {
        var result = true ? "PASS" : "FAIL";
        trace(result + ": flash.ui::BitmapData/event menuSelect ()");
    }

    private var frameCount = 0;

    public var points = [];
    public var bitmapData;

    private function initPixelPoints() {
        var x = 0, y = 0, width = stage.stageWidth, height = stage.stageHeight;
        var dx = 50;
        var dy = 50;
        for (var i = x + dx; i < width - x; i += dx) {
            for (var j = y + dy; j < height - y; j += dy) {
                points.push({x: i, y: j});
            }
        }
        bitmapData = new BitmapData(width, height, false);
    }

    private function tracePixels(traceWhitespace=false) {
        var pixels = [];
        bitmapData.draw(stage);
        points.forEach(function (p, i) {
            var px = bitmapData.getPixel(p.x, p.y);
            if (traceWhitespace || px != 0xFFFFFF) {
                pixels.push("[" + p.x + "," + p.y + "]=" + px.toString(16).toUpperCase());
            }
        });
        trace(pixels.join("\n"));
    }

    function enterFrameHandler(event:Event):void {
        frameCount++;
        var target = event.target;
        switch (frameCount) {
        case 1:
            (function () {
              initPixelPoints();
              tracePixels(true);
            })();
            break;
        default:
            parent.removeEventListener("enterFrame", enterFrameHandler);
            break;
        }
    }
}
