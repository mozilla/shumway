/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf PointTest,100,100,60 -p test/swfs/flash_geom_Point.as
*/

package {

    import flash.display.Sprite;
    import flash.events.Event;

    public class PointTest extends Sprite {
        public function PointTest() {
            var child = new TestObject();
            addChild(child);
            addEventListener(Event.ENTER_FRAME, child.enterFrameHandler);
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.geom.Point;

class TestObject extends Sprite {
    private var bgColor: uint = 0xFFCC00;
    private var pos: uint     = 10;
    private var size: uint    = 80;

    private var point;

    public function TestObject() {
        point = new Point(3, 4);
    }

    private var frameCount = 0;

    function enterFrameHandler(event:Event):void {
        frameCount++;
        var target = event.target;
        switch (frameCount) {
        case 1:
            (function () {
                var point2 = new Point(3, 4);
                var result = point2.equals(point) ? "PASS" : "FAIL";
                trace(result + ": flash.geom::Point/equals ()");
            })();
            break;
        default:
            parent.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
            break;
        }
    }
}
