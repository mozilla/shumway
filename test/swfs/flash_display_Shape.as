/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf ShapeTest,100,100,60 -p test/swfs/flash_display_Shape.as
*/

package {
    import flash.display.Sprite;
    import flash.events.Event;
    public class ShapeTest extends Sprite {
        public var loader;
        public function ShapeTest() {
            var child = new TestObject();
            addChild(child);
            addEventListener(Event.ENTER_FRAME, child.enterFrameHandler);
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.net.*;

class TestObject extends Shape {
    private var color: uint = 0xFFCC00;
    private var pos: uint   = 10;
    private var size: uint  = 80;

    public function TestObject() {
        graphics.beginFill(color);
        graphics.drawRect(pos, pos, size, size);
        graphics.endFill();
    }

    private var frameCount = 0;

    function enterFrameHandler(event:Event):void {
        frameCount++;
        switch (frameCount) {
        case 1:
            (function () {
                var result = graphics ? "PASS" : "FAIL";
                trace(result + ": flash.display::Shape/get graphics ()");
            })();
            break;
        default:
            parent.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
            break;
        }
    }
}
