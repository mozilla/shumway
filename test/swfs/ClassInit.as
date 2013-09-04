/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   java -jar utils/asc.jar -import playerglobal.abc -swf Test,300,250 test/swfs/ClassInit.as
*/

package {
    import flash.display.MovieClip;
    import flash.events.Event;

    public class Test extends MovieClip {
        private var color: uint = 0xFFCC00;
        private var pos: uint   = 10;
        private var size: uint  = 80;
        public var loader;
        public function Test() {
            stage.frameRate = 30;
            loader = new CustomLoader();
            addChild(loader);
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.net.*;

// This test loads a SWF that has a circular class dependency when the instance
// initializers are verified when the class is created. This results in an
// undefined base class. Fixed in #602.

class CustomLoader extends Loader {
    private var bgColor: uint = 0xFFCC00;
    private var pos: uint     = 10;
    private var size: uint    = 80;
    private var url           = "eca3d576f80aea19111760eea596d371325423eb5163add12de1a529992e84cb.swf";

    public function CustomLoader() {
        var request:URLRequest = new URLRequest(url);
        load(request);
        contentLoaderInfo.addEventListener(Event.COMPLETE, completeHandler);
    }

    private function completeHandler(event:Event): void {
        trace("XXX completeHandler()");
        event.target.content.addEventListener(Event.EXIT_FRAME, exitFrameHandler);
    }

    var frameCount = 1;
    private function exitFrameHandler(event:Event): void {
        var currentFrame = event.target.currentFrame;
        trace("XXX exitFrameHandler() " + currentFrame);
        if (currentFrame === 1) {
            event.target.removeEventListener(Event.EXIT_FRAME, exitFrameHandler);
        }
    }
}
