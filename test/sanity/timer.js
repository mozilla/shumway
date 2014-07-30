(function displayTests() {
  function timeAllocation(C) {
    var s = Date.now();
    for (var i = 0; i < 10000; i++) {
      var o = new C();
    }
    console.info("Took: " + (Date.now() - s) + " " + C);
  }

  function log(message) {
    console.info(message);
  }

  var Random = Shumway.Random;
  var Timer = flash.utils.Timer;

  unitTests.push(function runInspectorSanityTests() {
    var t = new Timer(1000,1); // 1 second
    t.start();
    //check(t.running() === true);
  });

})();
