/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
 Compiled with: (from shumway tld, assuming the internal playerglobal.abc in the shumway checkout's parent dir)
 java -jar utils/asc.jar -AS3 -strict -import ../playerglobal.abc -in test/printers.as -swf TextFieldTest,600,600 test/swfs/flash_text_TextField.as
 */

package {
import flash.display.Sprite;
import flash.events.Event;

public class TextFieldTest extends Sprite {
  public function TextFieldTest() {
    stage.frameRate = 20;
    child = new TextFieldObject();
    addChild(child);
    child.runSyncTests();
    child.runAsyncTests();
  }

  public var child;
}
}

import flash.display.*;
import flash.events.*;
import flash.text.*;

import shunit.*;

class TextFieldObject extends TextField {
  public function TextFieldObject() {
    addEventListener(MouseEvent.CLICK, clickHandler);
    addEventListener(MouseEvent.MOUSE_UP, mouseUpHandler);
  }

  function clickHandler(e) {
    trace("click");
  }

  function mouseUpHandler(e) {
    trace("mouseUp");
  }

  public function runSyncTests() {
    shunit.printSuccess = false;
    printEquals(autoSize, TextFieldAutoSize.NONE, "flash.text::TextField/get autoSize() // default value");
    autoSize = TextFieldAutoSize.CENTER;
    printEquals(autoSize, TextFieldAutoSize.CENTER, "flash.text::TextField/{get|set} autoSize()");
    autoSize = TextFieldAutoSize.LEFT;
    printEquals(autoSize, TextFieldAutoSize.LEFT, "flash.text::TextField/{get|set} autoSize()");
    autoSize = TextFieldAutoSize.RIGHT;
    printEquals(autoSize, TextFieldAutoSize.RIGHT, "flash.text::TextField/{get|set} autoSize()");
    autoSize = TextFieldAutoSize.NONE;
    printEquals(autoSize, TextFieldAutoSize.NONE, "flash.text::TextField/{get|set} autoSize()");

    printEquals(defaultTextFormat ? defaultTextFormat.size : undefined, 12, "flash.text::TextField/{get|set} defaultTextFormat()");

    printEquals(text, '', "flash.text::TextField/get text() // default value");
    printEquals(htmlText, '', "flash.text::TextField/get htmlText() // default value");
    printEquals(textHeight, 0, "flash.text::TextField/get textHeight()");
    var testText = "hello, world!";
    text = testText;
    printEquals(text, testText, "flash.text::TextField/{get|set} text()");
    printEquals(htmlText, '<P ALIGN="LEFT"><FONT FACE="Times Roman" SIZE="12" COLOR="#000000" LETTERSPACING="0" KERNING="0">hello, world!</FONT></P>',
                "flash.text::TextField/{set text(), get htmlText()");
    printEquals(textHeight, 12, "flash.text::TextField/get textHeight()");
    htmlText = '<FONT FACE="Times Roman" SIZE="120px" COLOR="#00ff00" LETTERSPACING="2" KERNING="0"><B><invalid>foo</invalid></B></FONT></P';
    printEquals(text, "foo", "flash.text::TextField/set htmlText(), get text()");
    printEquals(htmlText, '<P ALIGN="LEFT"><FONT FACE="Times Roman" SIZE="120" COLOR="#00FF00" LETTERSPACING="2" KERNING="0"><B>foo</B></FONT></P>',
                "flash.text::TextField/{get|set} htmlText()");

    printEquals(selectable, true, "flash.text::TextField/get selectable() // default value");
    selectable = false;
    printEquals(selectable, false, "flash.text::TextField/{get|set} selectable()");
    selectable = true;
    printEquals(selectable, true, "flash.text::TextField/{get|set} selectable()");

    printEquals(wordWrap, false, "flash.text::TextField/get wordWrap() // default value");
    wordWrap = true;
    printEquals(wordWrap, true, "flash.text::TextField/{get|set} wordWrap()");
    wordWrap = false;
    printEquals(wordWrap, false, "flash.text::TextField/{get|set} wordWrap()");

    var originalFormat = new TextFormat("Verdana", 20);
    setTextFormat(originalFormat);
    originalFormat.size = 10;
    var format = getTextFormat() || {};
    printTruthy(format.size != originalFormat.size, "flash.text::TextField/set TextFormat() copies result");
    printTruthy(format != originalFormat, "flash.text::TextField/get TextFormat() copies result");
    printEquals(format.size, 20, "flash.text::TextField/{get|set}TextFormat()");

    printEquals(background, false, "flash.text::TextField/get background() // default value");
    background = true;
    printEquals(background, true, "flash.text::TextField/{get|set} background()");
    background = false;
    printEquals(background, false, "flash.text::TextField/{get|set} background()");

    printEquals(backgroundColor, 0xFFFFFF, "flash.text::TextField/get backgroundColor() // default value");
    backgroundColor = 0x00FF00;
    printEquals(backgroundColor, 0x00FF00, "flash.text::TextField/{get|set} backgroundColor()");
    backgroundColor = 0x00FFFF;
    printEquals(backgroundColor, 0x00FFFF, "flash.text::TextField/{get|set} backgroundColor()");

    printEquals(border, false, "flash.text::TextField/get border() // default value");
    border = true;
    printEquals(border, true, "flash.text::TextField/{get|set} border()");
    border = false;
    printEquals(border, false, "flash.text::TextField/{get|set} border()");

    printEquals(borderColor, 0x000000, "flash.text::TextField/get borderColor() // default value");
    borderColor = 0x00FF00;
    printEquals(borderColor, 0x00FF00, "flash.text::TextField/{get|set} borderColor()");
    borderColor = 0x00FFFF;
    printEquals(borderColor, 0x00FFFF, "flash.text::TextField/{get|set} borderColor()");

    printEquals(condenseWhite, false, "flash.text::TextField/get condenseWhite() // default value");
    condenseWhite = true;
    printEquals(condenseWhite, true, "flash.text::TextField/{get|set} condenseWhite()");
    condenseWhite = false;
    printEquals(condenseWhite, false, "flash.text::TextField/{get|set} condenseWhite()");

    printEquals(multiline, false, "flash.text::TextField/get multiline() // default value");
    multiline = true;
    printEquals(multiline, true, "flash.text::TextField/{get|set} multiline()");
    multiline = false;
    printEquals(multiline, false, "flash.text::TextField/{get|set} multiline()");

    frameCount = 10;
  }

  public function runAsyncTests() {
    addEventListener(Event.ENTER_FRAME, enterFrameHandler);
  }

  private var frameCount = 0;

  function enterFrameHandler(event:Event):void {
    frameCount++;
    var target = event.target;
    switch (frameCount) {
      default:
        removeEventListener("enterFrame", enterFrameHandler);
        break;
    }
  }
}
