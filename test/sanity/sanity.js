unitTests.push(function runInspectorSanityTests(console, avm2) {
  function log(message) {
    console.info(message);
  }

  check (flash.events.Event.ADDED === "added", "Static Class Property");

  (function checkRectangle() {
    log("--- flash.geom.Rectangle ---");
    var o = new flash.geom.Rectangle(10, 20, 30, 40);
    check (o.x === 10 && o.y === 20 && o.width === 30 && o.height === 40, "Properties");
    o.left = 5;
    check (o.x === 5 && o.width === 35, "Setters");
    check (o.equals(new flash.geom.Rectangle(5, 20, 35, 40)), "Equals");
    check (!o.equals(new flash.geom.Rectangle(5, 20, 35, 45)), "Equals");
  })();

  (function URLVariables() {
    log("--- flash.net.URLVariables ---");
    var f = new flash.net.URLVariables("fn=Gordon&ln=Shumway");
    check (f.toString() === "fn=Gordon&ln=Shumway");
    f.decode("fn=Mozilla&ln=Firefox");
    log(f.toString());
    check (f.toString() === "fn=Gordon&fn=Mozilla&ln=Shumway&ln=Firefox");
    f = new flash.net.URLVariables();
    f[Multiname.getPublicQualifiedName("x")] = 123;
    check (f.toString() === "x=123");
  })();
});


unitTests.push(function runInspectorAsyncTest(console) {
  console.info('Testing async test');
  return new Promise(function (resolve) {
    setTimeout(resolve);
  });
});
