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

  unitTests.push(function () {
    DisplayObject.broadcastEventDispatchQueue.reset();
    var s = "";
    var a = new DisplayObjectContainer();
    a.addEventListener(Event.ENTER_FRAME, function () {
      s += "x";
    });
    var b = new DisplayObjectContainer();
    b.addEventListener(Event.ENTER_FRAME, function () {
      s += "b";
    });
    a.addEventListener(Event.ENTER_FRAME, function () {
      s += "y";
    });
    DisplayObject.broadcastEventDispatchQueue.dispatchEvent(Event.getBroadcastInstance(Event.ENTER_FRAME));
    check(s === "xyb", "Check enter frame order.");
  });

  unitTests.push(function () {
    DisplayObject.broadcastEventDispatchQueue.reset();
    var list = [];
    var handlers = [];
    var s = 0;
    for (var i = 0; i < 100; i++) {
      var o = new DisplayObjectContainer();
      var h = function () {
        s ++;
      };
      o.addEventListener(Event.ENTER_FRAME, h);
      list.push(o);
      handlers.push(h);
    }
    for (var i = 0; i < 10; i++) {
      DisplayObject.broadcastEventDispatchQueue.dispatchEvent(Event.getBroadcastInstance(Event.ENTER_FRAME));
    }
    check(s === 1000, "Called a bunch of enter frame events"); s = 0;
    for (var i = 0; i < 100; i++) {
      list[i].removeEventListener(Event.ENTER_FRAME, handlers[i]);
    }
    for (var i = 0; i < 10; i++) {
      DisplayObject.broadcastEventDispatchQueue.dispatchEvent(Event.getBroadcastInstance(Event.ENTER_FRAME));
    }
    check(s === 0, "Should not dispatch enter frame events"); s = 0;
    check(DisplayObject.broadcastEventDispatchQueue.getQueueLength(Event.ENTER_FRAME) < 1000, "We should have compacted the dispatch list.");
  });
})();
