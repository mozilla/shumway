package {
  function normalizeString(str) {
    return str.split("").sort().join("");
  }

  (function() {
    trace("Parsing: " + '{ "test": 1, "arr": [1, 2, 3] }');
    var obj:Object = JSON.parse('{ "test": 1, "arr": [1, 2, 3] }');
    trace(obj, obj.test, obj.arr);
  })();

  (function() {
    trace(JSON.parse(1).toString());
  })();

  (function () {
    var values = [
      true, false, "true", "false",
      -1, 0, 1, 3.5, -0, "0", "8", "1", '"A"'
    ];
    values.map(function (x) {
      return "" + x;
    }).forEach(function (x) {
      trace("Parsing: " + x);
      trace(JSON.parse(x));
    });
  })();

  (function () {
    trace(JSON.parse(0));
    trace(JSON.parse("1121"));
  })();

  (function () {
    var str = '[1, 2, 3]';
    trace(JSON.stringify(JSON.parse(str)));
  })();

  (function () {
    var str = '{"glossary":{"title":"example glossary","GlossDiv":{"title":"S","GlossList":{"GlossEntry":{"ID":"SGML","SortAs":"SGML","GlossTerm":"Standard Generalized Markup Language","Acronym":"SGML","Abbrev":"ISO 8879:1986","GlossDef":{"para":"A meta-markup language, used to create markup languages such as DocBook.","GlossSeeAlso":["GML","XML"]},"GlossSee":"markup"}}}}}';
    trace(normalizeString(JSON.stringify(JSON.parse(str))));
  })();

  (function () {
    var o = {A: "B", C: {D: "E"}, "1.4": "HELLO"};
    trace(normalizeString(JSON.stringify(o)));
    trace(normalizeString(JSON.stringify(o)));
  })();

  dynamic class Foo {
    public var x = 1;
    var y = 2;
  }

  Foo.prototype.z = 123;

  (function () {
    trace(JSON.stringify(Foo));
    trace(JSON.stringify(new Foo()));
    var f = new Foo();
    f.w = 4;
    trace(JSON.stringify(f));
  }) // ();

trace("==");
}