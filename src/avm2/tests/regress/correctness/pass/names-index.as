package {
  function foo(o: Array) {
    trace("--- Weird Property Names ---");
    o[12356712387125673512] = "Hello";
    o[-0] = "Minus Zero";
    o[1/0] = "INFINITY AND BEYOND";
    o[-1/0] = "NEG INFINITY AND BELOW";
    o["00"] = "DOUBLE ZERO";
    o[NaN] = "NANANANANA";
    o[123.456] = "FLOAT";
    o[123.456e+123] = "HUGE";
    o[123.456789e+123] = "HUGE 2";
    o[123] = "123";
    o["123"] = "XYZ";
    o["12356712387125673512"] = "XYZ";
    o["12356712387125673512"] += " Hello";
    o["-0"] += " Minus Zero";
    o["00"] += " DOUBLE ZERO";
    o["NaN"] += " NANANANANA";
    o["123.456"] += " FLOAT";
    o["123.456e+123"] += " HUGE";
    o["123.456789e+123"] += " HUGE 2";
    o[" "] = "SPACE";

    trace(o[12356712387125673512]);
    trace(o["12356712387125673512"]);
    trace(o[0]);
    trace(o[Infinity]);
    trace(o[-Infinity]);
    trace(o["00"]);
    trace(o[NaN]);
    trace(o[123.456]);
    trace(o[123.456e+123]);
    trace(o[123.456789e+123]);
    trace(o[123.456789e+123567]);
    trace(o[" "]);
    trace("for");
    var s = 0;
    for (var k in o) {
      s += String(k).length;
    }
    trace(s);
  }

  (function () {
    foo([]);
    trace("--- Done ---");
  })();
}
