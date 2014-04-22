(function displayTests() {

  var EventDispatcher = flash.events.EventDispatcher;
  var DisplayObject = flash.display.DisplayObject;
  var DisplayObjectFlags = flash.display.DisplayObjectFlags;
  var InteractiveObject = flash.display.InteractiveObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;

  function timeIt(f) {
    var s = Date.now();
    f();
    console.info("Took: " + (Date.now() - s));
  }

  unitTests.push(function runInspectorSanityTests() {
    var d = new DisplayObjectContainer();
    timeIt(function () {
      for (var i = 0; i < 1000000; i++) {
        EventDispatcher.isType(d);
      }
    })
  });
})();
