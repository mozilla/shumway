// misc test for refactoring
(function () {
  print('Clone')
  var items = [
    <t attr1="r"/>,
    <t xmlns="http://foo">bar</t>,
    new XMLList('<s:simple xmlns:s="http://uri1"><s:t/></s:simple><t/>')
  ];
  for (var i = 0; i < items.length; i++) {
    var clone = items[i].copy();
    print(i + '. ' + (clone.toXMLString()));
  }
})();
	
(function () {
  print('Parse and toXMLString');
  var soap = new Namespace("http://schemas.xmlsoap.org/soap/envelope/");
  var stock = new Namespace("http://mycompany.com/stocks");

  var x1 =
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
      soap:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
      <soap:Body>
          <m:getLastTradePrice xmlns:m="http://mycompany.com/stocks">
              <symbol>DIS</symbol>
          </m:getLastTradePrice>
      </soap:Body>
  </soap:Envelope>;

  var body = x1.soap::Body;
  print(body.toXMLString());

  body = x1.soap::["Body"];
  print(body.toXMLString());

  var q = new QName(soap, "Body");
  var body = x1[q];
  print(body.toXMLString());

  x1.soap::Body.stock::getLastTradePrice.symbol = "MYCO";
  print(x1.soap::Body.stock::getLastTradePrice.symbol.toXMLString());
})();

(function () {
  print('Default namespace');
  default xml namespace = 'http://boo';
  var x = new XML("<test>a</test>");
  print(x.toXMLString());
  var xl = new XMLList("a<test>b</test>");
  print(xl.toXMLString());
  default xml namespace = '';
})();


(function () {
  print('Basic entity parsing');
  print(new XML('<t a="&quot;&lt;&gt;&#10;&#x0D;" />').toXMLString());
  print(new XML('<t>&quot;&lt;&gt;&#65;&#x42;"</t>').toXMLString());
})();
