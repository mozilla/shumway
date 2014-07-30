unitTests.push(function runInspectorSanityTests(avm2) {
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

});


unitTests.push(function runInspectorAsyncTest(avm2) {
  console.info('Testing async test');
  return new Promise(function (resolve) {
    setTimeout(resolve);
  });
});
