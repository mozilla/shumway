/*
   Compiled with:
   java -jar utils/asc.jar -import playerglobal.abc -swf Template,100,100,10 test/swfs/test_TemplateTest.as

   This template is for writing test SWFs using pure AS3. It allows for testing
   UI events, screen and program state using the Shumway test harness.
*/

package {

    import flash.display.Sprite;
    import flash.events.Event;

    public class TemplateTest extends Sprite {
        public var loader;
        public function TemplateTest() {
            var child = new TestObject();
            addChild(child);
            addEventListener(Event.ENTER_FRAME, child.enterFrameHandler);
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.net.*;

class TestObject extends Sprite {
    private var color: uint = 0xFFCC00;
    private var pos: uint   = 10;
    private var size: uint  = 80;

    /*
      In the constructor, install event listeners for testing events, and
      construct and add child objects.
    */
    public function TestObject() {
    }

    private var frameCount = 0;

    /*
      In the enterFrameHandler, make API calls per frame to test both
      screen and program side-effects.
    */
    function enterFrameHandler(event:Event):void {
        frameCount++;
        var target = event.target;
        var loader = target.loader;
        switch (frameCount) {
        case 1:
            (function () {
                /*
                  Log test results in the standard format shown here to allow
                  for easy linking with monitor programs.
                */
                var result = true ? "PASS" : "FAIL";
                trace(result + ": test::Template/method ()");
                trace(result + ": test::Template/get name ()");
                trace(result + ": test::Template/set name ()");
            })();
            break;
        default:
            /*
              Remove enterFrameHandler when done.
            */
            parent.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
            break;
        }
    }
}
