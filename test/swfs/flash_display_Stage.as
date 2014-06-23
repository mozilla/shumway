/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf StageTest,600,600,60 -p test/swfs/flash_display_Stage.as
*/

package {

    import flash.display.Sprite;
    import flash.events.Event;

    public class StageTest extends Sprite {
        public var loader;
        public function StageTest() {
            var child = new TestObject();
            addChild(child);
            child.stage.addEventListener(Event.ENTER_FRAME, child.enterFrameHandler);
            child.stage.focus = child;
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.net.*;

class TestObject extends Sprite {
    private var bgColor: uint = 0xFFCC00;
    private var pos: uint     = 10;
    private var size: uint    = 80;

    public function TestObject() {
    }

    private var frameCount = 0;

    function enterFrameHandler(event:Event):void {
        frameCount++;
        var target = event.target;
        switch (frameCount) {
        case 1:
            (function () {
                var result = stage.displayState !== null ? "PASS" : "FAIL";
                trace(result + ": flash.display::Stage/get displayState ()");
            })();
            break;
        case 2:
            (function () {
                var result = stage.focus !== null ? "PASS" : "FAIL";
                trace(result + ": flash.display::Stage/get focus ()");
            })();
            break;
        case 3:
            (function () {
                var frameRate = stage.frameRate;
                stage.frameRate = 10;
                var result = stage.frameRate === 10 ? "PASS" : "FAIL";
                trace(result + ": flash.display::Stage/get frameRate ()");
                trace(result + ": flash.display::Stage/set frameRate ()");
                stage.frameRate = frameRate;
            })();
            break;
        case 4:
            (function () {
                var stageHeight = stage.stageHeight;
                //stage.stageHeight = 400;   // NOT IMPLEMENTED
                var result = stage.stageHeight === 600 ? "PASS" : "FAIL";
                trace(result + ": flash.display::Stage/get stageHeight ()");
                //stage.stageHeight = stageHeight;
            })();
            break;
        case 5:
            (function () {
                var result = stage.stageVideos !== null ? "PASS" : "FAIL";
                trace(result + ": flash.display::Stage/get stageVideos ()");
            })();
            break;
        case 6:
            (function () {
                var stageWidth = stage.stageWidth;
                //stage.stageWidth = 400;   // NOT IMPLEMENTED
                var result = stage.stageWidth === 600 ? "PASS" : "FAIL";
                trace(result + ": flash.display::Stage/get stageWidth ()");
                //stage.stageWidth = stageWidth;
            })();
            break;
        case 7:
            (function () {
                stage.align = StageAlign.BOTTOM_RIGHT;
                var result = stage.align === StageAlign.BOTTOM_RIGHT ? "PASS" : "FAIL";
                trace(result + ": flash.display::Stage/get align ()");
                trace(result + ": flash.display::Stage/set align ()");
            })();
            break;
        case 8:
            (function () {
                stage.scaleMode = StageScaleMode.NO_SCALE;
                var result = stage.scaleMode === StageScaleMode.NO_SCALE ? "PASS" : "FAIL";
                trace(result + ": flash.display::Stage/get scaleMode ()");
                trace(result + ": flash.display::Stage/set scaleMode ()");
            })();
            break;
        case 9:
            (function () {
                var event = new Event(Event.CANCEL);
                stage.addEventListener(Event.CANCEL, function (e) {
                    trace("PASS" + ": flash.display::Stage/dispatchEvent ()");
                });
                stage.dispatchEvent(event);
            })();
            break;
        default:
            stage.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
            break;
        }
    }
}
