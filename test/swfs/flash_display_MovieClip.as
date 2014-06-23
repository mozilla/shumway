/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf MovieClipTest,100,100,60 -p test/swfs/flash_display_MovieClip.as
*/

package {
    import flash.display.MovieClip;
    import flash.events.Event;

    public class MovieClipTest extends MovieClip {
        private var color: uint = 0xFFCC00;
        private var pos: uint   = 10;
        private var size: uint  = 80;
        public var loader;
        public function MovieClipTest() {
            loader = new CustomLoader();
            addChild(loader);
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.net.*;

class CustomLoader extends Loader {
    private var bgColor: uint = 0xFFCC00;
    private var pos: uint     = 10;
    private var size: uint    = 80;
    private var url           = "fiveframes.swf";

    public function CustomLoader() {
        configureListeners(contentLoaderInfo);
        var request:URLRequest = new URLRequest(url);
        load(request);
    }

    private function configureListeners(dispatcher:IEventDispatcher):void {
        dispatcher.addEventListener(Event.COMPLETE, completeHandler);
    }

    private function completeHandler(event:Event):void {
        trace("completeHandler()");
        var mc = this.content;
        mc.addFrameScript(
            0,
            function () {
                mc.gotoAndPlay(3);
            },
            1,
            function () {
                // play starts here after loading SWF
                trace("frame 2");
                var result = mc.totalFrames === 5 ? "PASS" : "FAIL";
                trace(result + ": flash.display::MovieClip/get totalFrames ()");
                mc.gotoAndPlay(1);
            },
            2,
            function () {
                trace("frame 3");
                var result = mc.currentFrame === 3 ? "PASS" : "FAIL";
                trace(result + ": flash.display::MovieClip/addFrameScript ()");
            },
            3,
            function () {
                trace("frame 4");
                var result = mc.currentFrame === 4 ? "PASS" : "FAIL";
                trace(result + ": flash.display::MovieClip/gotoAndPlay ()");
                mc.gotoAndStop(5);
            },
            4,
            function () {
                trace("frame 5");
                var result = mc.currentFrame === 5 ? "PASS" : "FAIL";
                trace(result + ": flash.display::MovieClip/gotoAndStop ()");
                mc.stop();
            });
        parent.addEventListener(Event.ENTER_FRAME, enterFrameHandler);
    }
    
    private var frameCount = 0;

    function enterFrameHandler(event:Event):void {
        frameCount++;
        var mc = this.content;
        switch (frameCount) {
        case 1:
            (function () {
                var result = mc.currentScene != null ? "PASS" : "FAIL";
                trace(result + ": flash.display::MovieClip/get currentScene ()");
            })();
            (function () {
                var result = mc.currentLabels.length === 0 ? "PASS" : "FAIL";
                trace(result + ": flash.display::MovieClip/get currentLabels ()");
            })();
            break;
        default:
            parent.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
            break;
        }
    }

}
