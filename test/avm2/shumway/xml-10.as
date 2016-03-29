// misc XML test

(function xml_hasOwnProperty() {
  var x = new XML('<t b="1"><a/></t>');
  print('XML::hasOwnProperty');
  print('x.a ' + x.hasOwnProperty('a'));
  print('x.b ' + x.hasOwnProperty('b'));
  print('x.a as name ' + x.hasOwnProperty(<a/>.name()));
  print('x.b as name ' + x.hasOwnProperty(<a b="2"/>.@b.name()));
  print('x.length ' + x.hasOwnProperty('length'));
})();

(function xml_propertyIsEnumerable() {
  var x = new XML('<t/>');
  print('XML::propertyIsEnumerable');
  print('x[0] ' + x.propertyIsEnumerable(0));
  print('x["0"] ' + x.propertyIsEnumerable("0"));
  print('x[<t>0</t>] ' + x.propertyIsEnumerable(<t>0</t>));
  print('x[1] ' + x.propertyIsEnumerable(1));
  print('x["a"] ' + x.propertyIsEnumerable("a"));
})();

(function xml_addNamespace() {
  print('XML::addNamespace');
  var x = new XML('<t/>');
  x.addNamespace(new Namespace('r', 'http://uri1'));
  print(x.toXMLString());
})();

(function xml_childIndex() {
  print('XML::childIndex');
  var x = new XML('<t><a/><b/></t>');
  var y = new XML('<c z="1"/>');
  var z = y.@z;
  print('not child ' + y.childIndex());
  print('attribute ' + z[0].childIndex());
  x.appendChild(y);
  print('child ' + y.childIndex());
})();

(function xml_elements() {
  print('XML::elements');
  var x = new XML('<t><a/><b/></t>');
  print('b ' + x.elements('b').toXMLString());
  print('* ' + x.elements().toXMLString());
})();

(function xml_hasContent() {
  print('XML::xml_hasContent');
  var x = new XML('<t><a/><b/></t>');
  var y = new XML('<t>test</t>');
  print("x.hasSimpleContent " + x.hasSimpleContent());
  print("y.hasSimpleContent " + y.hasSimpleContent());
  print("x.hasComplexContent " + x.hasComplexContent());
  print("y.hasComplexContent " + y.hasComplexContent());
})();

(function xml_nodeKind() {
  print('XML::nodeKind');
  print("element " + XML('<t/>').nodeKind());
  print("attribute " + XML('<t a="2"/>').@a[0].nodeKind());
  print("text " + XML('text').nodeKind());
  print("cdata " + XML('<![CDATA[text]]>').nodeKind());
})();

