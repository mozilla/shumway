package {
  use namespace AS3;

  (function () {
    var a = new Vector.<int>();
    var b = new Vector.<uint>();
    var c = new Vector.<Number>();
    var d = new Vector.<Object>();

    for each (var v in [a, d]) {
      try { v.push(); } catch (e) { trace (e.toString()); }
      try { v.push(0, 1); } catch (e) { trace (e.toString()); }
      try { v.unshift(); } catch (e) { trace (e.toString()); }
      try { v[-4] = 1;  } catch (e) { trace (e.toString()); }
      try { v[5] = 1;  } catch (e) { trace (e.toString()); }
      trace("--");
    }
  }); // ();

  (function () {
    var a = new Vector.<int>(5, true);
    var b = new Vector.<uint>(5, true);
    var c = new Vector.<Number>(5, true);
    var d = new Vector.<Object>(5, true);

    for each (var v in [a, d]) {
      try { v.push(); } catch (e) { trace (e.toString()); }
      try { v.pop(); } catch (e) { trace (e.toString()); }
      try { v.push(0, 1); } catch (e) { trace (e.toString()); }
      try { v.shift(); } catch (e) { trace (e.toString()); }
      try { v.unshift(); } catch (e) { trace (e.toString()); }
      try { v[-4] = 1;  } catch (e) { trace (e.toString()); }
      try { v[5] = 1;  } catch (e) { trace (e.toString()); }
      trace("--");
    }
  }); // ();

  (function () {
    var a = Vector.<int>([1, 2, 3, 4, 5]);
    var b = Vector.<uint>([1, 2, 3, 4, 5]);
    var c = Vector.<Number>([1, 2, 3, 4, 5]);
    var d = Vector.<Object>([1, 2, 3, 4, 5]);

    trace(a.toString());
    trace(b.toString());
    trace(c.toString());
    trace(d.toString());

  })();

  (function () {
    var v = new Vector.<uint>(10, true);
    var a = 10;
    try {
      v[a] = "!";
    } catch (e) {
      trace(e.toString());
    }
  })();

  trace("DONE");
}