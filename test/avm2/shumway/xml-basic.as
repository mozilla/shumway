(function () {
  trace('--- new Namespace("prefix", "uri") ---');
  var x = new Namespace("prefix", "uri");
  trace("toString(): " + x.toString());
  trace("prefix: " + x.prefix);
  trace("uri: " + x.uri);

  trace('--- new Namespace("uri") ---');
  x = new Namespace("uri");
  trace("toString(): " + x.toString());
  trace("prefix: " + x.prefix);
  trace("uri: " + x.uri);

  trace('--- new Namespace() ---');
  x = new Namespace();
  trace("prefix: " + x.prefix);
  trace("uri: " + x.uri);
})();


(function () {
  trace("--- new QName() ---");
  var x = new QName();
  trace("uri: " + x.uri);
  trace("localName: " + x.localName);

  trace('--- new QName("A") ---');
  x = new QName("A");
  trace("uri: " + x.uri);
  trace("localName: " + x.localName);

  trace('--- new QName("A", "B") ---');
  x = new QName("A", "B");
  trace("uri: " + x.uri);
  trace("localName: " + x.localName);

  trace('--- new QName(null, "X") ---');
  x = new QName(null, "X");
  trace("uri: " + x.uri);
  trace("localName: " + x.localName);

  trace('--- new QName(null, null) ---');
  x = new QName(null, null);
  trace("uri: " + x.uri);
  trace("localName: " + x.localName);
})();


(function () {
  trace("--- E4X 13.2.1 ---");
  var n, m;

  n = Namespace();
  m = new Namespace();

  trace(typeof n + " " + typeof m);
  trace(n.prefix + " " + m.prefix);
  trace(n.uri + " " + m.uri);

  n = Namespace("http://foobar/");
  m = new Namespace("http://foobar/");

  trace(typeof n + " " + typeof m);
  trace(n.prefix + " " + m.prefix);
  trace(n.uri + " " + m.uri);

  n = Namespace("foobar", "http://foobar/");
  m = new Namespace("foobar", "http://foobar/");

  trace(typeof n + " " + typeof m);
  trace(n.prefix + " " + m.prefix);
  trace(n.uri + " " + m.uri);

  n = Namespace(m);
  trace(n.toString() + " " + m.toString());

  trace("Namespace() : " + Namespace().toString());
  trace("typeof Namespace() : " + typeof Namespace() );

  trace("Namespace('pfx').toString() : " + Namespace('pfx').toString());
  trace("typeof Namespace('pfx') : " + (typeof Namespace('pfx')) );

  var ns = new Namespace('http://foo.bar');
  trace("Namespace(nsObj).toString() : " + Namespace(ns).toString());

  trace((new Namespace('pfx', 'http://www.w3.org/TR/html4/')).toString());
  trace("typeof Namespace('pfx','http://www.w3.org/TR/html4/')  : " + typeof Namespace('pfx','http://www.w3.org/TR/html4/') );

  ns = new Namespace('pfx', 'http://foo.bar');
  trace("Namespace(nsObj).toString() : " + Namespace(ns).toString());

})();

(function () {
  trace("--- E4X 13.2.2 ---");
  var n, m;

  n = new Namespace();
  trace(typeof(n));
  trace(n.prefix);
  trace(n.uri);

  n = new Namespace("");
  trace(typeof(n));
  trace(n.prefix);
  trace(n.uri);

  n = new Namespace("http://foobar/");
  trace(typeof(n));
  trace(typeof(n.prefix));
  trace(n.uri);

  // Check if the undefined prefix is getting set properly
  m = new Namespace(n);
  trace(typeof(n) + " : " + typeof(m));
  trace(n.prefix + " : " + m.prefix);
  trace(n.uri + " : " + m.uri);

  n = new Namespace("foobar", "http://foobar/");
  trace(typeof(n));
  trace(n.prefix);
  trace(n.uri);

  // Check if all the properties are getting copied
  m = new Namespace(n);
  trace(typeof(n) + " : " + typeof(m));
  trace(n.prefix + " : " + m.prefix);
  trace(n.uri + " : " + m.uri);

  try {
    n = new Namespace("ns", "");
  } catch(ex) {
    trace(ex.name);
  }

//  namespace foo = "bar";
//
//  trace(foo.toString());
//
//  x1 = new Namespace ("p", "y");
//
//  trace(x1.toString());

})();

(function () {
  trace("--- E4X 13.2.3.1 ---");
  trace(typeof Namespace.prototype);
  trace(Namespace.prototype instanceof Namespace);
})();

(function () {
  trace("--- E4X 13.2.4.1 ---");
  trace(Namespace.prototype.constructor === Namespace);
})();

(function () {
  trace("--- E4X 13.2.4.2 ---");
  var n1 = new Namespace('http://www.w3.org/TR/html4/');
  var n2 = new Namespace('pfx','http://www.w3.org/TR/html4/');
  var n3 = new Namespace();

  trace(n1.toString());
  trace(n2.toString());
  trace(n3.toString());
})();

(function () {
  trace("--- E4X 13.2.5 ---");
  trace("skipped");
  return; // TODO do we need testing for this?
  var n;
  n = new Namespace("ns", "http://someuri");
  trace(n.hasOwnProperty("prefix"));
  trace(n.hasOwnProperty("uri"));
  trace(n.propertyIsEnumerable("prefix"));
  trace(n.propertyIsEnumerable("uri"));
})();

(function () {
  trace("--- E4X 13.3.1 ---");

  q = QName("foobar");
  p = new QName("foobar");
  trace(typeof(p) + " : " + typeof(q));
  trace(p.localName + " : " + q.localName);
  trace(p.uri + " : " + q.uri);

  q = QName("http://foobar/", "foobar");
  p = new QName("http://foobar/", "foobar");
  trace(typeof(p) + " : " + typeof(q));
  trace(p.localName + " : " + q.localName);
  trace(p.uri + " : " + q.uri);

  p1 = QName(q);
  p2 = new QName(q);
  trace(typeof(p2) + " : " + typeof(p1));
  trace(p2.localName + " : " + p1.localName);
  trace(p2.uri + " : " + p1.uri);

  n = new Namespace("http://foobar/");
  q = QName(n, "foobar");
  p = QName(n, "foobar");
  trace(typeof(p) + " : " + typeof(q));
  trace(p.localName + " : " + q.localName);
  trace(p.uri + " : " + q.uri);

  p = QName(q);

  trace(p.toString())
  trace(q.toString())
  trace(QName('name').valueOf().toString() );
  trace(QName('name').valueOf() == 'name' );
  trace(typeof QName('name') );

  trace((foo = QName("foo"), bar = QName(foo), bar === foo));
  trace((foo = QName("foo"), bar = QName("", foo), bar === foo));

  trace((ns = new Namespace('duh'), QName(ns, 'name').toString()));
  trace((ns = new Namespace('duh'), typeof QName(ns, 'name')));
  trace((ns = new Namespace('duh'), QName(ns, 'name') instanceof QName));

})();


(function () {
  trace("--- E4X 13.3.2 ---");

  var q = new QName("*");
  trace(typeof(q));
  trace(q.localName);
  trace(q.uri);
  trace(q.toString());

  // Default namespace
  q = new QName("foobar");
  trace(typeof(q));
  trace(q.localName);
  trace(q.uri);
  trace(q.toString());

  q = new QName("http://foobar/", "foobar");
  trace(typeof(q));
  trace(q.localName);
  trace(q.uri);
  trace(q.toString());

  p = new QName(q);
  trace(typeof(p) + " : " + typeof(q));
  trace(q.localName + " : "+ p.localName);
  trace(q.uri + " : " + p.uri);

  n = new Namespace("http://foobar/");
  q = new QName(n, "foobar");
  trace(typeof(q));

  q = new QName(null);
  trace(typeof(q));
  trace(q.localName);
  trace(q.uri);
  trace(q.toString());

  q = new QName(null, null);
  trace(typeof(q));
  trace(q.localName);
  trace(q.uri);
  trace(q.toString());

  q = new QName("attr1");
  q2 = new QName(q, "attr1");
  q3 = QName(q);

  trace(q.toString());
  trace(q2.toString());
  trace(q3.toString());

  q = new QName(n, "attr1");
  q2 = new QName(q, "attr1");

  trace(q.toString());
  trace(q2.toString());

  // no value is supplied
  trace((ns = new QName(), ns.localName) );

  // one value is supplied
  trace(typeof new QName('name') );
  trace(new QName('name') instanceof QName);
  trace(new QName('name') == 'name');
  trace((ns = new QName('name'), ns.uri == '') );
  trace((ns = new QName('name'), ns.uri == null) );
  trace((ns = new QName('name'), ns.uri == undefined) );
  trace((ns = new QName('name'), typeof ns.uri) );
  trace((ns = new QName('name'), ns.localName == 'name') );
  trace((ns = new QName(undefined), ns.localName) );
  trace((ns = new QName(""), ns.localName) );
  trace((MYOB = new QName('nameofobj'), typeof new QName(MYOB)) );

  //two values are supplied
  trace((MYOB = new QName(null, 'nameofobj'), MYOB.toString() ));
  trace((MYOB = new QName(null, 'nameofobj'), MYOB.uri) );
  trace((MYOB = new QName(null, 'nameofobj'), MYOB.localName) );
  trace((MYOB = new QName('namespace', undefined), MYOB.localName) );
  trace((MYOB = new QName('namespace', ""), MYOB.localName) );

  x1 =
      <alpha>
        <bravo attr1="value1" ns:attr1="value3" xmlns:ns="http://someuri">
          <charlie attr1="value2" ns:attr1="value4"/>
        </bravo>
      </alpha>

  y = <ns:attr1 xmlns:ns="http://someuri"/>
  q3 = y.name();

  trace(q3.toString());
  trace((new XML("value3")).toString(), x1.bravo.@[q3].toString());

})();
trace("--- DONE ---");