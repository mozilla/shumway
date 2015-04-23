(function displayLoaderTests() {
  var Event = flash.events.Event;
  var Stage = flash.display.Stage;
  var Loader = flash.display.Loader;
  var URLRequest = flash.net.URLRequest;
  var DisplayObject = flash.display.DisplayObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;

  function log(message) {
    info(message);
  }

  for (var i = 0; i < 75; i++) {
    unitTests.push(function runInspectorSanityTests() {
      return new Promise(function (resolve, reject) {
        var s = new Stage();
        var l = Loader.getRootLoader();
        var r = new URLRequest("../as3_tiger/tiger.swf");

        var initEventCalled = false;
        var completeEventCalled = false;
        var initEventPromise = new Promise(function (resolve) {
          l.contentLoaderInfo.addEventListener(Event.INIT, function (event) {
            initEventCalled = true;
            resolve();
          });
        });

        var completeEventPromise = new Promise(function (resolve) {
          l.contentLoaderInfo.addEventListener(Event.COMPLETE, function (event) {
            completeEventCalled = true;
            resolve();
          });
        });

        l.load(r);

        var checkEvents = function () {
          check(initEventCalled, "Check contentLoaderInfo initEventCalled");
          check(completeEventCalled, "Check contentLoaderInfo completeEventCalled");
        };

        var timeout = setTimeout(function () {
          reject('timeout');
        }, 1000);

        Promise.all([initEventPromise, completeEventPromise]).then(function () {
          clearTimeout(timeout);
          checkEvents();
        }).then(resolve, reject);
      });
    });
  }

  unitTests.push(function runInspectorSanityTests() {
    var s = new Stage();
    var l = Loader.getRootLoader();
    var r = new URLRequest("../as3_tiger/tiger.swf");

    l.contentLoaderInfo.addEventListener(Event.INIT, function (event) {
      check(l.content, "We should have some content here.");
      check(l.content.root === l.content, "This should be the root.");
      check(DisplayObject.axIsType(l.content));
      s.setStageWidth(l.contentLoaderInfo.width);
      s.setStageHeight(l.contentLoaderInfo.height);
      s.frameRate = l.contentLoaderInfo.frameRate;
      s.addChild(l.content);
      check(s.frameRate);
    });

    l.load(r);

  });

})();
