(function displayTests() {
  var Event = flash.events.Event;
  var EventDispatcher = flash.events.EventDispatcher;
  var ProgressEvent = flash.events.ProgressEvent;

  var Stage = flash.display.Stage;
  var Loader = flash.display.Loader;
  var URLRequest = flash.net.URLRequest;
  var DisplayObject = flash.display.DisplayObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;

  function log(message) {
    console.info(message);
  }

  unitTests.push(function () {
    DisplayObject.broadcastEventDispatchQueue.reset();
    var a = new DisplayObjectContainer();
    var b = new DisplayObjectContainer();
    var c = new DisplayObjectContainer();

    a.addChild(b);
    b.addChild(c);

    var s = "";
    a.addEventListener(Event.ENTER_FRAME, function () {
      s += "a";
    });
    a.addEventListener(Event.ENTER_FRAME, function () {
      s += "A";
    }, true);


    b.addEventListener(Event.ENTER_FRAME, function () {
      s += "b";
    });
    b.addEventListener(Event.ENTER_FRAME, function () {
      s += "B";
    }, true);


    c.addEventListener(Event.ENTER_FRAME, function () {
      s += "c";
    });
    c.addEventListener(Event.ENTER_FRAME, function () {
      s += "C";
    }, true);

    // Broadcast events don't bubble or capture.
    DisplayObject.broadcastEventDispatchQueue.dispatchEvent(Event.getBroadcastInstance(Event.ENTER_FRAME));
    check(s === "abc"); s = "";

    // You can make your own custom events with the same name and they don't behave like the internals ones.
    c.dispatchEvent(new Event(Event.ENTER_FRAME));
    check(s === "ABc"); s = "";

    // They can bubble too.
    c.dispatchEvent(new Event(Event.ENTER_FRAME, true));
    check(s === "ABcba"); s = "";
  });
})();
