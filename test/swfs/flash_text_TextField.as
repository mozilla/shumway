/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   java -jar utils/asc.jar -import playerglobal.abc -swf TextFieldTest,600,600 test/swfs/flash_text_TextField.as
*/

package {
    import flash.display.Sprite;
    import flash.events.Event;

    public class TextFieldTest extends Sprite {
        public var child;
        public function TextFieldTest() {
            stage.frameRate = 20;
            child = new TextFieldObject();
            addChild(child);
            addEventListener(Event.ENTER_FRAME, child.enterFrameHandler);
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.text.*;

class TextFieldObject extends TextField {
    private var color:uint = 0xFFCC00;
    private var size:uint  = 80;

    public function TextFieldObject() {
        this.text = "This is a test";
        this.autoSize = TextFieldAutoSize.LEFT;
        this.background = true;
        this.border = true;
        this.multiline = true;
        var font = "Verdana";
        var color = 0xFF0000;
        var size = 10;
        var format:TextFormat = new TextFormat(font, size, color);
        defaultTextFormat = format;
        addEventListener(MouseEvent.CLICK, clickHandler);
        addEventListener(MouseEvent.MOUSE_UP, mouseUpHandler);
    }

    function clickHandler(e) {
        trace("click");
    }

    function mouseUpHandler(e) {
        trace("mouseUp");
    }

    private var frameCount = 0;

    function enterFrameHandler(event:Event):void {
        frameCount++;
        var target = event.target.child;
        switch (frameCount) {
        case 1:
            (function () {
                target.text = "hello, world!";
                var result = target.text === "hello, world!" ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/set text ()");
                trace(result + ": flash.text::TextField/get text ()");
            })();
            break;
        case 2:
            (function () {
                var result = Number(target.textHeight) === 10 ? "PASS" : "FAIL expected 10";
                trace(result + ": flash.text::TextField/get textHeight ()");
            })();
            break;
        case 3:
            (function () {
                target.autoSize = TextFieldAutoSize.NONE;
                var result = target.autoSize === TextFieldAutoSize.NONE ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/set autoSize ()");
                trace(result + ": flash.text::TextField/get autoSize ()");
            })();
            break;
        case 4:
            (function () {
                var result = Number(target.defaultTextFormat.size) === 10 ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/set defaultTextFormat ()");
                trace(result + ": flash.text::TextField/get defaultTextFormat ()");
            })();
            break;
        case 5:
            (function () {
                target.htmlText = "<b>foo</b>";
                var result = target.htmlText === "<b>foo</b>" ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/set htmlText ()");
                trace(result + ": flash.text::TextField/get htmlText ()");
            })();
            break;
        case 6:
            (function () {
                target.selectable = true;
                var result = target.selectable === true ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/set selectable ()");
                trace(result + ": flash.text::TextField/get selectable ()");
            })();
            break;
        case 7:
            (function () {
                target.wordWrap = true;
                var result = target.wordWrap === true ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/set wordWrap ()");
                trace(result + ": flash.text::TextField/get wordWrap ()");
            })();
            break;
        case 8:
            (function () {
                //target.setTextFormat(new TextFormat("Verdana", 20));
                var result = "FAIL"; //Number(target.getTextFormat().size) === 10 ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/setTextFormat ()");
                trace(result + ": flash.text::TextField/getTextFormat ()");
            })();
            break;
        case 9:
            (function () {
                target.background = true;
                var result = target.background === true ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/set background ()");
                trace(result + ": flash.text::TextField/get background ()");
            })();
            break;
        case 10:
            (function () {
                target.backgroundColor = 0x00FF00;
                var result = target.backgroundColor === 0x00FF00 ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/set backgroundColor ()");
                trace(result + ": flash.text::TextField/get backgroundColor ()");
            })();
            break;
        case 11:
            (function () {
                target.border = true;
                var result = target.border === true ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/set border ()");
                trace(result + ": flash.text::TextField/get border ()");
            })();
            break;
        case 12:
            (function () {
                target.borderColor = 0x0000FF;
                var result = target.borderColor === 0x0000FF ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/set borderColor ()");
                trace(result + ": flash.text::TextField/get borderColor ()");
            })();
            break;
        case 13:
            (function () {
                target.condenseWhite = true;
                var result = target.condenseWhite === true ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/set condenseWhite ()");
                trace(result + ": flash.text::TextField/get condenseWhite ()");
            })();
            break;
        case 14:
            (function () {
                var result = target.multiline === true ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/get multiline ()");
                target.multiline = false;
                var result = target.multiline === false ? "PASS" : "FAIL";
                trace(result + ": flash.text::TextField/set multiline ()");
                trace(result + ": flash.text::TextField/get multiline ()");
            })();
            break;
        default:
            parent.removeEventListener("enterFrame", enterFrameHandler);
            break;
        }
    }
}
