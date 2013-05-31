/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   java -jar utils/asc.jar -import playerglobal.abc -swf SystemTest,100,100,2 test/swfs/package_System.as
*/

package {

    import flash.display.Sprite;
    import flash.events.Event;

    public class SystemTest extends Sprite {
        public var loader;
        public function SystemTest() {
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
                initialTotalMemory = System.totalMemory;
                initialTotalMemoryNumber = System.totalMemoryNumber;
                byteArray = new ByteArray();
                byteArray.length = 1000000
            })();
            break;
        case 2:
            (function () {
                var result = System.totalMemory > initialTotalMemory ? "PASS" : "FAIL";
                trace(result + ": flash.system::System/get totalMemory ()");
                var result = System.totalMemoryNumber > initialTotalMemoryNumber ? "PASS" : "FAIL";
                trace(result + ": flash.system::System/get totalMemoryNumber ()");
            })();
            break;
        case 3:
            (function () {
            })();
            break;
        default:
            parent.removeEventListener(Event.ENTER_FRAME, enterFrameHandler);
            break;
        }
    }
}
