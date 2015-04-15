package {

  trace("Vector.<int>");
  (function () {
    var v = new Vector.<int>();
    v[0] = "12";      trace(v[0] + " " + typeof (v[0]));
    v[0] = null;      trace(v[0] + " " + typeof (v[0]));
    v[0] = 1.23;      trace(v[0] + " " + typeof (v[0]));
  })();

  trace("Vector.<uint>");
  (function () {
    var v = new Vector.<uint>();
    v[0] = "-12";     trace(v[0] + " " + typeof (v[0]));
    v[0] = null;      trace(v[0] + " " + typeof (v[0]));
    v[0] = -1.23;     trace(v[0] + " " + typeof (v[0]));
  })();

  trace("Vector.<String>");
  (function () {
    var v = new Vector.<String>();
    v[0] = 123;       trace(v[0] + " " + typeof (v[0]));
    v[0] = null;      trace(v[0] + " " + typeof (v[0]));
    v[0] = undefined; trace(v[0] + " " + typeof (v[0]));
  }); // TODO: Automatic coercions to specific types are not working yet.

  trace("DONE");
}