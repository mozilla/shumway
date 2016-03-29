// Derived from tamarin test e4x/Expression/e11_1_3.as
var x1 =
<alpha>
    <bravo>one</bravo>
    <charlie>two</charlie>
</alpha>

var correct = new XMLList("<bravo>one</bravo><charlie>two</charlie>");
trace("x1.* " + (correct.toXMLString() === x1.*.toXMLString()));

var xml1 = "<p><a>1</a><a>2</a><a>3</a></p>";
var xml2 = "<a>1</a><a>2</a><a>3</a>";
var xml3 = "<a><e f='a'>hey</e><e f='b'> </e><e f='c'>there</e></a><a>2</a><a>3</a>";
var xml4 = "<p><a hi='a' he='v' ho='m'>hello</a></p>";

var ns1 = new Namespace('foobar', 'http://boo.org');
var ns2 = new Namespace('fooboo', 'http://foo.org');
var ns3 = new Namespace('booboo', 'http://goo.org');

trace("x.a.* " + ("123" === (x1 = new XML(xml1), x1.a.*.toString())));
trace("xl.a.* " + ("123" === (x1 = new XMLList(xml1), x1.a.*.toString())));
trace("xmllist.* " + ("123" === (x1 = new XMLList(xml2), x1.*.toString())));
trace("xmllist[0].* " + ("1" === (x1 = new XMLList(xml2), x1[0].*.toString())));
trace("xml.a.@* " + ("avm" === (x1 = new XML(xml4), x1.a.@*.toString())));
