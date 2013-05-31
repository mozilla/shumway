/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   java -jar utils/asc.jar -import playerglobal.abc -swf SecurityDomainTest,100,100,10 test/swfs/package_SecurityDomain.as
*/

package {

    import flash.display.Sprite;
    import flash.events.Event;

    public class SecurityDomainTest extends Sprite {
        public var loader;
        public function SecurityDomainTest() {
            stage.frameRate = 10;
            var child = new TestObject();
            addChild(child);
            addEventListener(Event.ENTER_FRAME, child.enterFrameHandler);
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.system.*;
import flash.utils.*;

class TestObject extends Sprite {
    private var bgColor: uint = 0xFFCC00;
    private var pos: uint     = 10;
    private var size: uint    = 80;

    /*
      Install event listeners for testing events, construct and add child
      objects, do all other initialization for this test.
    */
    public function TestObject() {
    }

    /*
      Set and get properties that have a UI affect to test both screen
      capture and property values.
    */

    private var initialTotalMemory;
    private var initialTotalMemoryNumber;
    private var byteArray;

    private var frameCount = 0;
    function enterFrameHandler(event:Event):void {
        frameCount++;
        var target = event.target;
        var loader = target.loader;
        switch (frameCount) {
        case 1:
            (function () {
                trace("currentDomain=" + SecurityDomain.currentDomain);
                var result = !!SecurityDomain.currentDomain ? "PASS" : "FAIL";
                trace(result + ": flash.system::SecurityDomain/get currentDomain ()");
            })();
            break;
        default:
            parent.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
            break;
        }
    }
}
