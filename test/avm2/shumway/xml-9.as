// misc test for static print and parse flags
(function () {
  var x = <a><b>test</b></a>;
  print('default prettyPrinting ' + XML.prettyPrinting);
  XML.prettyPrinting = false;
  print('prettyPrinting=' + XML.prettyPrinting);
  print(x.toXMLString());
  XML.prettyPrinting = true;
  print('prettyPrinting=' + XML.prettyPrinting);
  print(x.toXMLString());
})();

(function () {
  var x = <a><b>test<c /></b></a>;
  print('default prettyIndent ' + XML.prettyIndent);
  XML.prettyIndent = 0;
  print('prettyPrinting=' + XML.prettyIndent);
  print(x.toXMLString());
  XML.prettyIndent = 1;
  print('prettyPrinting=' + XML.prettyIndent);
  print(x.toXMLString());
  XML.prettyIndent = 15;
  print('prettyPrinting=' + XML.prettyIndent);
  print(x.toXMLString());
  XML.prettyIndent = 2;
  print('prettyPrinting=' + XML.prettyIndent);
  print(x.toXMLString());
})();

(function () {
  var t = '<a><!--test--><?test t?>test</a>';
  print('default ignoreComments ' + XML.ignoreComments);
  XML.ignoreComments = false;
  print('ignoreComments=' + XML.ignoreComments);
  var x = new XML(t);
  print(x.toXMLString());
  XML.ignoreComments = true;
  print('ignoreComments=' + XML.ignoreComments);
  var x = new XML(t);
  print(x.toXMLString());
})();

(function () {
  var t = '<a><!--test--><?test t?>test</a>';
  print('default ignoreProcessingInstructions ' + XML.ignoreProcessingInstructions);
  XML.ignoreProcessingInstructions = false;
  print('ignoreComments=' + XML.ignoreProcessingInstructions);
  var x = new XML(t);
  print(x.toXMLString());
  XML.ignoreProcessingInstructions = true;
  print('ignoreComments=' + XML.ignoreProcessingInstructions);
  var x = new XML(t);
  print(x.toXMLString());
})();

(function () {
  var t = '<a><b>    \r\n</b><c>  t</c><d>\r\n\t</d><e>test  </e></a>';
  print('default ignoreComments ' + XML.ignoreWhitespace);
  XML.ignoreWhitespace = false;
  print('ignoreWhitespace=' + XML.ignoreWhitespace);
  var x = new XML(t);
  print(x.toXMLString());
  XML.ignoreWhitespace = true;
  print('ignoreWhitespace=' + XML.ignoreWhitespace);
  var x = new XML(t);
  print(x.toXMLString());
})();
