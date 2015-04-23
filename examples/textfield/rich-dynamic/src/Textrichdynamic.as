package {

import flash.display.Sprite;
import flash.text.TextField;
import flash.text.TextFieldAutoSize;
import flash.text.TextFormat;

public class Textrichdynamic extends Sprite {
  public function Textrichdynamic() {
    var textField:TextField = new TextField();
    textField.autoSize = TextFieldAutoSize.LEFT;
    textField.wordWrap = true;
    textField.width = 550;
    var format:TextFormat = new TextFormat('_sans', 14, 0x999999);
    textField.defaultTextFormat = format;
    textField.text = "14px, sans, light-grey; gr ";
    format.bold = true;
    format.color = 0x333333;
    format.size = 16;
    textField.defaultTextFormat = format;
    var insertPoint : int = textField.length-1;
    textField.setSelection(insertPoint, insertPoint + 1);
    textField.replaceSelectedText('een 16px, sans, dark-grey, red, bold; ');
    format = new TextFormat();
    format.color = 0xaa0000;
    textField.setTextFormat(format, insertPoint + 27, insertPoint + 30);
    format.color = 0x00aa00;
    textField.setTextFormat(format, insertPoint - 2, insertPoint + 3);
    textField.appendText('\n' + textField.htmlText);
    addChild(textField);
  }
}
}
