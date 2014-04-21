(function displayTests() {
  var Event = flash.events.Event;
  var Stage = flash.display.Stage;
  var Loader = flash.display.Loader;
  var URLRequest = flash.net.URLRequest;
  var DisplayObject = flash.display.DisplayObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;

  function log(message) {
    console.info(message);
  }

  unitTests.push(function runInspectorSanityTests(console) {
    var r = new URLRequest("../as3_tiger/tiger.swf");
    var l = new Loader();
    var s = new Stage();

    var initEventCalled = false;
    var completeEventCalled = false;

    l.contentLoaderInfo.addEventListener(Event.INIT, function (event) {
      initEventCalled = true;
    });

    l.contentLoaderInfo.addEventListener(Event.COMPLETE, function (event) {
      completeEventCalled = true;
    });

    l.load(r);

    check(initEventCalled, "Check contentLoaderInfo initEventCalled");
    check(completeEventCalled, "Check contentLoaderInfo completeEventCalled");
  });

  unitTests.push(function runInspectorSanityTests(console) {
    var r = new URLRequest("../as3_tiger/tiger.swf");
    var l = new Loader();
    var s = new Stage();

    l.contentLoaderInfo.addEventListener(Event.INIT, function (event) {
      check(l.content, "We should have some content here.");
      check(l.content.root === l.content, "This should be the root.");
      check(DisplayObject.isType(l.content));
      s.stageWidth = l.contentLoaderInfo.width;
      s.stageHeight = l.contentLoaderInfo.height;
      s.frameRate = l.contentLoaderInfo.frameRate;
      s.addChild(l.content);
      check(s.frameRate);
    });

    l.load(r);

  });

})();
