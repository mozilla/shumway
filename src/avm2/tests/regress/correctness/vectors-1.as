package {

  (function () {
    trace(new Vector.<int>(null).length);
    trace(new Vector.<int>(undefined).length);
    trace(new Vector.<int>("3").length);
    trace(new Vector.<int>(false).length);
    trace(new Vector.<int>(true).length);
  })();

  (function () {
    var v = new Vector.<int>();
    v.push();
    v.push("1");
    v.push(2);
    v.push(true);
    trace(v.toString());
  })();

  (function () {
    var v = new Vector.<int>();
    for (var i = 0; i < 3; i++) {
      v[i] = i;
    }
    trace(v.toString());
    trace(v.length);
  })();

  (function () {
    var v = new Vector.<int>();
    for (var i = 0; i < 3; i++) {
      v[i] = i;
    }
    v.push(3, 4, 5);
    trace(v.toString());
    trace(v.length);
  })();

  (function () {
    var v = new Vector.<int>(3, true);
    for (var i = 0; i < 3; i++) {
      v[i] = i;
    }
    try {
      v.push(3, 4, 5);
    } catch (e) {
      trace(e.toString());
    }
    trace(v.toString());
    trace(v.length);
  })();


  (function () {
    var v = new Vector.<*>();
    for (var i = 0; i < 3; i++) {
      v[i] = i;
    }
    v.push(3, '4', 5.123, {number: 6});
    v.push(undefined);
    trace(v.toString());
    trace(v.length);
  })();

  (function () {
    var v = new Vector.<Object>();
    for (var i = 0; i < 3; i++) {
      v[i] = i;
    }
    v.push(3, '4', 5.123, {number: 6});
    v.push(undefined);
    trace(v.toString());
    trace(v.length);
  })();

  (function () {
    trace("A: " + new Vector.<int>().pop());
    trace(new Vector.<uint>().pop());
    trace(new Vector.<Object>().pop());
    trace(new Vector.<String>().pop());
    trace(new Vector.<Object>(1).push("A"));
    trace(new Vector.<Object>(10)[0]);
  })();

  trace("-");
}