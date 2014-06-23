unitTests.push(function runInspectorSanityTests(avm2) {
  function log(message) {
    console.info(message);
  }

  (function checkRectangle() {
    log("--- flash.geom.Rectangle ---");
    var start = new Date();
    for (var i = 0; i < 1000000; i++) {
      new flash.geom.Rectangle(10, 20, 30, 40);
    }
    log("--- Dome --- in " + (new Date() - start));
  })();
});