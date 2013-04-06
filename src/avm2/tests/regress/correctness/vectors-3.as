package {

  (function () {
    var v = new Vector.<int>();
    v[0] = "12";      trace(v[0] + " " + typeof (v[0]));
    v[0] = null;      trace(v[0] + " " + typeof (v[0]));
    v[0] = 1.23;      trace(v[0] + " " + typeof (v[0]));
  })();

  (function () {
    var v = new Vector.<uint>();
    v[0] = "-12";     trace(v[0] + " " + typeof (v[0]));
    v[0] = null;      trace(v[0] + " " + typeof (v[0]));
    v[0] = -1.23;     trace(v[0] + " " + typeof (v[0]));
  })();

  (function () {
    var v = new Vector.<String>();
    v[0] = 123;       trace(v[0] + " " + typeof (v[0]));
    v[0] = null;      trace(v[0] + " " + typeof (v[0]));
    v[0] = undefined; trace(v[0] + " " + typeof (v[0]));
  })();

  trace("DONE");
}