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

  unitTests.push(0, function () {
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
    var c = new DisplayObjectContainer();
    var r = "";
    var addedToStageEventWasTriggered = false;
    s.addEventListener(Event.ADDED_TO_STAGE, function () {
      r += "A";
    });
    s.addEventListener(Event.REMOVED_FROM_STAGE, function () {
      r += "R";
    });
    c.addChild(s);
    stage.addChild(c); // += "A"
    c.removeChild(s); // += "R"
    c.addChild(s); // += "A"
    c.removeChild(s); // += "R"
    c.addChild(s); // += "A"
    eq(r, "ARARA");
  });

  unitTests.push(function () {
    Random.seed(0x12343);
    var stage = new Stage();
    var s = new Shape();
    var r = "";
    s.addEventListener(Event.ADDED_TO_STAGE, function () {
      r += "A";
    });
    s.addEventListener(Event.REMOVED_FROM_STAGE, function () {
      r += "R";
    });
    var c = new DisplayObjectContainer();
    c.addChild(s);
    for (var i = 0; i < 1024; i++) {
      var p = new DisplayObjectContainer();
      p.addChild(c);
      c = p;
    }
    stage.addChild(p);
    s.parent.removeChild(s);
    eq(r, "AR");
  });

  unitTests.push(function () {
    Random.seed(0x12343);
    var stage = new Stage();
    var s = new Shape();
    var r = "";
    s.addEventListener(Event.ADDED_TO_STAGE, function () {
      r += "A";
    });
    s.addEventListener(Event.REMOVED_FROM_STAGE, function () {
      r += "R";
    });
    var c = new DisplayObjectContainer();
    c.addChild(s);
    stage.addChild(c);
    eq(r, "A");
  });
})();
