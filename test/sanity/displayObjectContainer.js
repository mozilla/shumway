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
  var Stage = flash.display.Stage;

  unitTests.push(function () {
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

  unitTests.push(function () {
    Random.seed(0x12343);

    var stage = new Stage();
    var s = new Shape();
    var c = new DisplayObjectContainer();

    var addedToStageEventWasTriggered = false;
    s.addEventListener(Event.ADDED_TO_STAGE, function () {
      addedToStageEventWasTriggered = true;
    });
    c.addChild(s);
    stage.addChild(c);
    check(addedToStageEventWasTriggered);
  });

  unitTests.push(function () {
    Random.seed(0x12343);

    var stage = new Stage();
    var s = new Shape();
    var c = new DisplayObjectContainer();
    var r = "";

    var addedToStageEventWasTriggered = false;
    s.addEventListener(Event.ADDED_TO_STAGE, function () {
      r += "A";
    });
    c.addChild(s);
    stage.addChild(c);
    stage.addChild(c);
    eq(r, "A");
  });

  unitTests.push(function () {
    Random.seed(0x12343);

    var stage = new Stage();
    var s = new Shape();
    var c1 = new DisplayObjectContainer();
    var c2 = new DisplayObjectContainer();
    var r = "";

    s.addEventListener(Event.ADDED, function () {
      c2.addChild(s);
    });
    s.addEventListener(Event.ADDED_TO_STAGE, function () {
      r += "A";
    });

    stage.addChild(c1);
    c1.addChild(s);
    eq(r, "");

    c2.removeChild(s);
    stage.addChild(c2);
    c1.addChild(s);
    eq(r, "AA");
  });

})();
