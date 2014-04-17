(function displayTests() {
  var Stage = flash.display.Stage;
  function log(message) {
    console.info(message);
  }

  sanityTests.push(function runInspectorSanityTests(console) {
    var s = new Stage();
    check(s.stage === s);
  });

})();
