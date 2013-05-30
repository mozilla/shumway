/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   java -jar utils/asc.jar -import playerglobal.abc -swf StageTest,100,100,2 test/swfs/flash_display_Stage.as
*/

package {

    import flash.display.Sprite;
    import flash.events.Event;

    public class StageTest extends Sprite {
        public var loader;
        public function StageTest() {
            var child = new Test();
            addChild(child);
            child.stage.addEventListener(Event.ENTER_FRAME, child.enterFrameHandler);
            child.stage.focus = child;
            child.stage.frameRate = 10;
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.net.*;

class Test extends Sprite {
    private var bgColor: uint = 0xFFCC00;
    private var pos: uint     = 10;
    private var size: uint    = 80;

    public function Test() {        
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
                stage.frameRate = 20;
                var result = stage.frameRate === 20 ? "PASS" : "FAIL";
                trace(result + ": flash.display::Stage/get frameRate ()");
                trace(result + ": flash.display::Stage/set frameRate ()");
                stage.frameRate = frameRate;
            })();
            break;
        case 4:
            (function () {
                var stageHeight = stage.stageHeight;
                //stage.stageHeight = 400;   // NOT IMPLEMENTED
                var result = stage.stageHeight === 100 ? "PASS" : "FAIL";
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
                var result = stage.stageWidth === 100 ? "PASS" : "FAIL";
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
        default:
            stage.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
            break;
        }
    }
}
