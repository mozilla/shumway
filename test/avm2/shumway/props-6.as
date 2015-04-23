package {
  (function () {
    trace("--- array ---");
    var o = {};
//    o[1] = "HELLO"; trace(o["1"]);
//    o["1"] = "HELLO 2"; trace(o["1"]);
//    o["1.0"] = "HELLO 3"; trace(o["1"]);
//    o["1"] = "HELLO 4"; trace(o["1.0"]);
    o[3.14] = "PI"; trace(o["3.14"]); //trace(o["+3.14"]);
//    o[2] = "TWO"; trace(o["02"]);
  })();
}
