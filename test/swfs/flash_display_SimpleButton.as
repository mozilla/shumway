/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   java -jar utils/asc.jar -import playerglobal.abc -swf SimpleButtonTest,400,400,2 test/swfs/flash_display_SimpleButton.as
*/

package {
    import flash.display.Sprite;
    import flash.events.*;

    public class SimpleButtonTest extends Sprite {
        public function SimpleButtonTest() {
            var child:SimpleButtonObject = new SimpleButtonObject();
            addChild(child);
            addEventListener(Event.ENTER_FRAME, child.enterFrameHandler);
        }
    }
}

import flash.display.*;
import flash.events.*;

dynamic class SimpleButtonObject extends SimpleButton {

    var downShape, upShape, hitTestShape, overShape;

    public function SimpleButtonObject() {
        this.hitTestState = new Shape;
        this.hitTestState.graphics.drawRect(10, 10, 100, 100);
        this.downState = new Shape;
        this.downState.graphics.beginFill(0xFF0000);
        this.downState.graphics.drawRect(10, 10, 80, 80);
        this.upState = new Shape;
        this.upState.graphics.beginFill(0x00FF00);
        this.upState.graphics.drawRect(10, 10, 80, 80);
        this.overState = new Shape;
        this.overState.graphics.beginFill(0x0000FF);
        this.overState.graphics.drawRect(10, 10, 80, 80);
    }

    private function set_downState():void {
        trace("FAIL set_downState");
    }

    private function set_hitTestState():void {
        trace("FAIL set_hitTestState");
    }

    private function set_overState():void {
        trace("FAIL set_overState");
    }

    private function set_upState():void {
        trace("FAIL set_upState");
    }

    private function set_useHandCursor():void {
        trace("FAIL set_useHandCursor");
    }

    private var frameCount = 0;

    function enterFrameHandler(event:Event):void {
        frameCount++;
        var target = event.target;
        switch (frameCount) {
        case 1:
            set_downState();
            break;
        case 2:
            set_hitTestState();
            break;
        case 3:
            set_overState();
            break;
        case 4:
            set_upState();
            break;
        case 5:
            set_useHandCursor();
            break;
        default:
            parent.removeEventListener("enterFrame", enterFrameHandler);
            break;
        }
    }
}
