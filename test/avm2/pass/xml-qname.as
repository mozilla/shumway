// Test getProperty by QName
(function () {
  x1 =
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
    soap:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
    <soap:Body>
        <m:getLastTradePrice xmlns:m="http://mycompany.com/stocks">
            <symbol>DIS</symbol>
        </m:getLastTradePrice>
    </soap:Body>
  </soap:Envelope>;
  soap = new Namespace("http://schemas.xmlsoap.org/soap/envelope/");
  correct =
   <soap:Body xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <m:getLastTradePrice xmlns:m="http://mycompany.com/stocks">
        <symbol>DIS</symbol>
    </m:getLastTradePrice>
   </soap:Body>;

  body = x1.soap::Body;
  body = x1.soap::["Body"];
  q = new QName(soap, "Body");
  body = x1[q];
  namespace m = "http://mycompany.com/stocks";
  trace(body.m::getLastTradePrice.toXMLString() === correct.m::getLastTradePrice.toXMLString() ? "PASS" : "FAIL");
})();

