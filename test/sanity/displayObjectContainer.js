(function displayTests() {

  var Random = Shumway.Random;
  var Rectangle = flash.geom.Rectangle;
  var Event = flash.events.Event;
  var DisplayObject = flash.display.DisplayObject;
  var DisplayObjectFlags = flash.display.DisplayObjectFlags;
  var InteractiveObject = flash.display.InteractiveObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;
  var Shape = flash.display.Shape;
  var Sprite = flash.display.Sprite;

  unitTests.push(function (console) {
    Random.seed(0x12343);

    var s = new Shape();
    var c = new DisplayObjectContainer();

    var addedEventWasTriggered = false;
    s.addEventListener(Event.ADDED, function () {
      addedEventWasTriggered = true;
    });
    c.addChild(s);
    check(addedEventWasTriggered);
  });

})();
