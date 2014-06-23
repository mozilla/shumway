(function textTests() {

  var Random = Shumway.Random;
  var TextField = flash.text.TextField;

  unitTests.push(0, function () {
    Random.seed(0x12343);

    var t = new TextField();
    var c = t._getTextContent();

    eq(c.backgroundColor, 0);
    eq(c.borderColor, 0);
    eq(c.autoSize, false);
    eq(c.wordWrap, false);

    t.backgroundColor = 0xff0000;
    eq(c.backgroundColor, 0);
    t.background = true;
    eq(c.backgroundColor, 0xff0000ff);
    t.backgroundColor = 0x00ff00;
    eq(c.backgroundColor, 0x00ff00ff);
    t.background = false;
    eq(c.backgroundColor, 0);

    t.borderColor = 0xff0000;
    eq(c.borderColor, 0);
    t.border = true;
    eq(c.borderColor, 0xff0000ff);
    t.borderColor = 0x00ff00;
    eq(c.borderColor, 0x00ff00ff);
    t.border = false;
    eq(c.borderColor, 0);

    t.wordWrap = true;
    eq(c.wordWrap, true);
    t.wordWrap = false;
    eq(c.wordWrap, false);

    t.autoSize = flash.text.TextFieldAutoSize.CENTER;
    eq(c.autoSize, true);
    t.autoSize = flash.text.TextFieldAutoSize.NONE;
    eq(c.autoSize, false);
  });

  unitTests.push(function () {
    Random.seed(0x12343);

    var t = new TextField();
    t.multiline = true;

    t.htmlText = '<p align="left"><font size="20">foo</font><font size="20">bar</font></p>';
    //eq(t.getTextRuns().length, 1);

    t.htmlText = '<p align="left"><font size="20">foo</font><font size="30">bar</font></p>';
    //eq(t.getTextRuns().length, 2);

    t.htmlText = '<p align="left"><font size="20">foo</font>bar</p>';
    //eq(t.getTextRuns().length, 3);

    t.htmlText = '<p align="left"><li>foo</li>bar</p>';
    eq(t.getTextRuns().length, 2);
  });

  unitTests.push(function () {
    Random.seed(0x12343);

    var t = new TextField();
    t.multiline = true;
    t.htmlText = '<p align="left"><font face="_sans" size="20" color="#003366" letterSpacing="0.00" kerning="0">left</font></p><p align="center"><font face="_sans" size="20" color="#003366" letterSpacing="0.00" kerning="0">center</font></p><p align="right"><font face="_sans" size="20" color="#003366" letterSpacing="0.00" kerning="0">right</font></p>';
    var textRuns = t.getTextRuns();
    //eq(textRuns.length, 3);
  });

  unitTests.push(function () {
    Random.seed(0x12343);

    var t = new TextField();
    t.multiline = true;
    t.htmlText = '<p align="left"><font face="_sans" size="14" color="#999999" letterSpacing="0.00" kerning="1">14px, sans, light-grey; <font color="#00aa00">gre<font size="16">en<font color="#333333"> 16px, sans, dark-grey, <font color="#aa0000">red</font>, bold; </font></font></font></font></p>';
    eq(t.text, '14px, sans, light-grey; green 16px, sans, dark-grey, red, bold; \r');
    eq(t.text.length, 65);
    //eq(t.htmlText, '<P ALIGN="LEFT"><FONT FACE="_sans" SIZE="14" COLOR="#999999" LETTERSPACING="0" KERNING="1">14px, sans, light-grey; <FONT COLOR="#00AA00">gre<FONT SIZE="16">en<FONT COLOR="#333333"> 16px, sans, dark-grey, <FONT COLOR="#AA0000">red</FONT>, bold; </FONT></FONT></FONT></FONT></P>');
    var textRuns = t.getTextRuns();
    eq(textRuns.length, 7);
    if (textRuns.length === 7) {
      eq(textRuns[0].beginIndex, 0);
      eq(textRuns[0].endIndex, 24);
      eq(textRuns[1].beginIndex, 24);
      eq(textRuns[1].endIndex, 27);
      eq(textRuns[2].beginIndex, 27);
      eq(textRuns[2].endIndex, 29);
      eq(textRuns[3].beginIndex, 29);
      eq(textRuns[3].endIndex, 53);
      eq(textRuns[4].beginIndex, 53);
      eq(textRuns[4].endIndex, 56);
      eq(textRuns[5].beginIndex, 56);
      eq(textRuns[5].endIndex, 64);
      eq(textRuns[6].beginIndex, 64);
      eq(textRuns[6].endIndex, 65);
    }
  });

})();
