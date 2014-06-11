(function textTests() {

  var Random = Shumway.Random;
  var TextField = flash.text.TextField;

  unitTests.push(function getObjectsUnderPoint() {
    Random.seed(0x12343);

    var t = new TextField();

    t.htmlText = '<p><span>foo</span></p><br/><span>bar</span>';
    eq(t.text, 'foobar');
    var textRuns = t.getTextRuns();
    eq(textRuns.length, 1);
    eq(textRuns[0].beginIndex, 0);
    eq(textRuns[0].endIndex, 6);

    t.multiline = true;
    t.htmlText = '<p><span>foo</span></p><br/><span>bar</span>';
    eq(t.text, 'foo\n\nbar');
    var textRuns = t.getTextRuns();
    eq(textRuns.length, 1);
    eq(textRuns[0].beginIndex, 0);
    eq(textRuns[0].endIndex, 8);
  });

})();
