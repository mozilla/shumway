(function displayTests() {

  var Random = Shumway.Random;
  var Point = flash.geom.Point;
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

  unitTests.push(function () {
    Random.seed(0x12343);
    var s1 = new Shape();
    var s2 = new Shape();
    var s3 = new Shape();
    var c = new DisplayObjectContainer();

    c.addChildAtDepth(s2, 2);
    c.addChildAtDepth(s3, 3);
    c.addChildAtDepth(s1, 1);
    eq(c.getChildIndex(s1), 0);
  });

  unitTests.push(function getObjectsUnderPoint() {
    Random.seed(0x12343);

    var container = new Sprite();

    var square1 = new Sprite();
    square1.graphics.beginFill(0xFFCC00);
    square1.graphics.drawRect(0, 0, 40, 40);

    var square2 = new Sprite();
    square2.graphics.beginFill(0x00CCFF);
    square2.graphics.drawRect(20, 0, 30, 40);

    container.addChild(square1);
    container.addChild(square2);

    var pt = new Point(10, 20);
    var objects = container.getObjectsUnderPoint(pt);
    eq(objects.length, 1);

    pt = new Point(35, 20);
    objects = container.getObjectsUnderPoint(pt);
    eq(objects.length, 2);

    eq(objects[0], square1);
    eq(objects[1], square2);

    container.swapChildrenAt(0, 1);
    objects = container.getObjectsUnderPoint(pt);
    eq(objects.length, 2);

    eq(objects[0], square2);
    eq(objects[1], square1);
  });

})();
