(function textTests() {

  var Random = Shumway.Random;
  var TextField = flash.text.TextField;

  unitTests.push(function getObjectsUnderPoint() {
    Random.seed(0x12343);

    var t = new TextField();
    t.htmlText = '<p><span>foo</span></p><br/><span>bar</span>';
    eq(t.text, 'foobar');
  });

})();
