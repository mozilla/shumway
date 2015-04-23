// Derived from tamarin-redux/test/acceptance/e4x/Expressions/e11_1_2.as

var x1 =
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
    soap:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
    <soap:Body>
        <m:getLastTradePrice xmlns:m="http://mycompany.com/stocks">
            <symbol>DIS</symbol>
        </m:getLastTradePrice>
    </soap:Body>
</soap:Envelope>;

var soap = new Namespace("http://schemas.xmlsoap.org/soap/envelope/");
var stock = new Namespace("http://mycompany.com/stocks");

var encodingStyle = x1.@soap::encodingStyle;

trace(typeof encodingStyle);
trace("1", "http://schemas.xmlsoap.org/soap/encoding/" === encodingStyle.toXMLString());

var correct =
<soap:Body xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <m:getLastTradePrice xmlns:m="http://mycompany.com/stocks">
        <symbol>DIS</symbol>
    </m:getLastTradePrice>
</soap:Body>;

var body = x1.soap::Body;
trace(2, correct.toXMLString() === body.toXMLString());

body = x1.soap::["Body"];
trace(3, (correct.toXMLString() === body.toXMLString()));

var q = new QName(soap, "Body");
var body = x1[q];
trace(4, (correct.toXMLString() === body.toXMLString()));

var correct =
<symbol xmlns:m="http://mycompany.com/stocks" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">MYCO</symbol>;

x1.soap::Body.stock::getLastTradePrice.symbol = "MYCO";

trace(5, (correct.toXMLString() === x1.soap::Body.stock::getLastTradePrice.symbol.toXMLString()));

// SOAP messages
var msg1 = <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"
        s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
    <s:Body>
        <m:GetLastTradePrice xmlns:m="http://mycompany.com/stocks/">
            <symbol>DIS</symbol>
        </m:GetLastTradePrice>
    </s:Body>
</s:Envelope>

var msg2 = <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"
        s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
    <s:Body>
        <m:GetLastTradePrice xmlns:m="http://mycompany.com/stocks/">
            <symbol>MACR</symbol>
        </m:GetLastTradePrice>
    </s:Body>
</s:Envelope>

var msg3 = <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"
        s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
    <s:Body>
        <m:GetLastTradePrice xmlns:m="http://mycompany.com/stocks/"
         m:blah="http://www.hooping.org">
            <symbol>MACR</symbol>
        </m:GetLastTradePrice>
    </s:Body>
</s:Envelope>

var msg4 = <soap>
    <bakery>
        <m:g xmlns:m="http://macromedia.com/software/central/"
        pea="soup"
        pill="box"
        neck="lace"
        m:blah="http://www.hooping.org">
            <pill>box</pill>
            <neck>lace</neck>
            <pea>soup</pea>
        </m:g>
    </bakery>
</soap>

var msg5 = "soupboxlacehttp://www.hooping.org";

// declare namespaces
var ns1 = new Namespace("http://schemas.xmlsoap.org/soap/envelope/");
var ns2= new Namespace ("http://mycompany.com/stocks/");
var ns3= new Namespace ("http://macromedia.com/software/central/");

// extract the soap encoding style and body from the soap msg1
var encodingStyle = msg1.@ns1::encodingStyle;
var stockURL = msg1.ns1::Body.ns2::GetLastTradePrice.@ns2::blah;

var body = msg1.ns1::Body;

body.ns2::GetLastTradePrice.symbol = "MACR";
trace("body.ns2::GetLastTradePrice.symbol = \"MACR\"", "MACR" === body.ns2::GetLastTradePrice.symbol.toString());

var bodyQ = msg1[QName(ns1, "Body")];
trace("ms1.ns1::Body == msg1[QName(ns1, \"Body\")]", bodyQ.toXMLString() == body.toXMLString());

trace("msg1 == msg2", msg1.toXMLString() == msg2.toXMLString());

trace("msg1.@ns1::encodingStyle", "http://schemas.xmlsoap.org/soap/encoding/" === msg1.@ns1::encodingStyle.toString());

trace("msg3.ns1::Body.ns2::GetLastTradePrice.@ns2", "http://www.hooping.org" === msg3.ns1::Body.ns2::GetLastTradePrice.@ns2::blah.toString());

trace("msg4.bakery.ns3::g.@*", msg5 === msg4.bakery.ns3::g.@*.toString());

var x1 = <x xmlns:ns="foo" ns:v='55'><ns:a>10</ns:a><b/><ns:c/></x>;
var ns = new Namespace("foo");
trace("x1.ns::*", new XMLList("<ns:a xmlns:ns=\"foo\">10</ns:a><ns:c xmlns:ns=\"foo\"/>").toString() === x1.ns::*.toString());

trace("x1.ns::a", "10" === x1.ns::a.toString());

trace("x1.ns::a", "20" === (x1.ns::a = 20, x1.ns::a.toString()));

trace("x1.@ns::['v']", "55" === x1.@ns::['v'].toString());

var y1 = <y xmlns:ns="foo" a="10" b="20" ns:c="30" ns:d="40"/>
trace("y1.@ns::*.length()", 2 === y1.@ns::*.length());

var z = new XMLList("<b xmlns:ns=\"foo\"/><ns:c xmlns:ns=\"foo\"/>");


//trace("x1.*::a", "10" === x1.*::a.toString());
//trace("x1.@ns::['v']", "555" === (x1.@ns::['v'] = '555', x1.@ns::['v'].toString()));
//trace("x1.*", z.toString() === (delete x1.ns::a, x1.*.toString()));

