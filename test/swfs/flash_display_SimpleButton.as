/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   node utils/compileabc.js --swf SimpleButtonTest,400,400,10 -p test/swfs/flash_display_SimpleButton.as
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

    private var downShape:Shape;
    private var upShape:Shape;
    private var hitTestShape:Shape;
    private var overShape:Shape;

    public function SimpleButtonObject() {
        this.hitTestState = hitTestShape = new Shape;
        hitTestShape.graphics.drawRect(10, 10, 100, 100);
        this.downState = downShape = new Shape;
        downShape.graphics.beginFill(0xFF0000);
        downShape.graphics.drawRect(10, 10, 80, 80);
        this.upState = upShape = new Shape;
        upShape.graphics.beginFill(0x00FF00);
        upShape.graphics.drawRect(10, 10, 80, 80);
        this.overState = overShape = new Shape;
        overShape.graphics.beginFill(0x0000FF);
        overShape.graphics.drawRect(10, 10, 80, 80);
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
