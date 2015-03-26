(function displayTests() {
  var Event = flash.events.Event;
  var EventDispatcher = flash.events.EventDispatcher;
  var ProgressEvent = flash.events.ProgressEvent;

  var Stage = flash.display.Stage;
  var Loader = flash.display.Loader;
  var URLRequest = flash.net.URLRequest;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;

  function log(message) {
    info(message);
  }

  unitTests.push(function () {
    EventDispatcher.axClass.broadcastEventDispatchQueue.reset();
    var a = new DisplayObjectContainer();
    var b = new DisplayObjectContainer();
    var c = new DisplayObjectContainer();

    a.addChild(b);
    b.addChild(c);

    var s = "";
    a.addEventListener('enterFrame', function () {
      s += "a";
    });
    a.addEventListener('enterFrame', function () {
      s += "A";
    }, true);


    b.addEventListener('enterFrame', function () {
      s += "b";
    });
    b.addEventListener('enterFrame', function () {
      s += "B";
    }, true);


    c.addEventListener('enterFrame', function () {
      s += "c";
    });
    c.addEventListener('enterFrame', function () {
      s += "C";
    }, true);

    // Broadcast events don't bubble or capture.
    EventDispatcher.axClass.broadcastEventDispatchQueue.dispatchEvent(Event.axClass.getBroadcastInstance('enterFrame'));
    check(s === "abc"); s = "";

    // You can make your own custom events with the same name and they don't behave like the internals ones.
    c.dispatchEvent(new Event('enterFrame'));
    check(s === "ABc"); s = "";

    // They can bubble too.
    c.dispatchEvent(new Event('enterFrame', true));
    check(s === "ABcba"); s = "";
  });

  unitTests.push(function () {
    EventDispatcher.axClass.broadcastEventDispatchQueue.reset();
    var s = "";
    var a = new DisplayObjectContainer();
    a.addEventListener('enterFrame', function () {
      s += "x";
    });
    var b = new DisplayObjectContainer();
    b.addEventListener('enterFrame', function () {
      s += "b";
    });
    a.addEventListener('enterFrame', function () {
      s += "y";
    });
    EventDispatcher.axClass.broadcastEventDispatchQueue.dispatchEvent(Event.axClass.getBroadcastInstance('enterFrame'));
    check(s === "xyb", "Check enter frame order.");
  });

  unitTests.push(function () {
    EventDispatcher.axClass.broadcastEventDispatchQueue.reset();
    var list = [];
    var handlers = [];
    var s = 0;
    for (var i = 0; i < 100; i++) {
      var o = new DisplayObjectContainer();
      var h = function () {
        s ++;
      };
      o.addEventListener('enterFrame', h);
      list.push(o);
      handlers.push(h);
    }
    for (var i = 0; i < 10; i++) {
      EventDispatcher.axClass.broadcastEventDispatchQueue.dispatchEvent(Event.axClass.getBroadcastInstance('enterFrame'));
    }
    check(s === 1000, "Called a bunch of enter frame events"); s = 0;
    for (var i = 0; i < 100; i++) {
      list[i].removeEventListener('enterFrame', handlers[i]);
    }
    for (var i = 0; i < 10; i++) {
      EventDispatcher.axClass.broadcastEventDispatchQueue.dispatchEvent(Event.axClass.getBroadcastInstance('enterFrame'));
    }
    check(s === 0, "Should not dispatch enter frame events"); s = 0;
    check(EventDispatcher.axClass.broadcastEventDispatchQueue.getQueueLength('enterFrame') < 1000, "We should have compacted the dispatch list.");
  });
})();
