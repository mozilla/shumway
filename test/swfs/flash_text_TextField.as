/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
 Compiled with: (assuming the internal playerglobal.abc in the shumway checkout's parent dir)
 java -jar utils/asc.jar -import ../playerglobal.abc -in test/printers.as -swf TextFieldTest,600,600 test/swfs/flash_text_TextField.as
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

    printEquals(text, '', "flash.text::TextField/get text() // default value");
    var testText = "hello, world!";
    text = testText;
    printEquals(text, testText, "flash.text::TextField/{get|set} text()");

    printEquals(textHeight, 12, "flash.text::TextField/get textHeight()");

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

    printEquals(htmlText, '<P ALIGN="LEFT"><FONT FACE="Times Roman" SIZE="12" COLOR="#000000" LETTERSPACING="0" KERNING="0">hello, world!</FONT></P>',
                "flash.text::TextField/get htmlText() // default value");
    htmlText = "<b>foo</b>";
    printEquals(htmlText, '<P ALIGN="LEFT"><FONT FACE="Times Roman" SIZE="12" COLOR="#000000" LETTERSPACING="0" KERNING="0"><B>foo</B></FONT></P>',
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

    setTextFormat(new TextFormat("Verdana", 20));
    var format = getTextFormat();
    printEquals(format ? format.size : undefined, 20, "flash.text::TextField/{get|set}TextFormat()");

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
