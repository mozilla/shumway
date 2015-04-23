(function displayTests() {

  var Random = Shumway.Random;
  var Point = flash.geom.Point;
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
    s.addEventListener('added', function () {
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
    s.addEventListener('addedToStage', function () {
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
    s.addEventListener('addedToStage', function () {
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
    s.addEventListener('addedToStage', function () {
      r += "A";
    });
    s.addEventListener('removedFromStage', function () {
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
    s.addEventListener('addedToStage', function () {
      r += "A";
    });
    s.addEventListener('removedFromStage', function () {
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
    s.addEventListener('addedToStage', function () {
      r += "A";
    });
    s.addEventListener('removedFromStage', function () {
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

    s.addEventListener('added', function () {
      c2.addChild(s);
    });
    s.addEventListener('addedToStage', function () {
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

  unitTests.push(function addAndGetAndRemoveChildAt() {
    var s1 = new Shape();
    var s2 = new Shape();
    var s3 = new Shape();
    var c = new DisplayObjectContainer();
    var exceptionMessage = null;
    try {
      c.addChildAt(s1, 10);
    } catch (e) {
      exceptionMessage = e.toString();
    }
    eq(exceptionMessage, 'RangeError: Error #2006: The supplied index is out of bounds.');

    exceptionMessage = null;
    try {
      c.getChildAt(10);
    } catch (e) {
      exceptionMessage = e.toString();
    }
    eq(exceptionMessage, 'RangeError: Error #2006: The supplied index is out of bounds.');

    exceptionMessage = null;
    try {
      c.removeChildAt(10);
    } catch (e) {
      exceptionMessage = e.toString();
    }
    eq(exceptionMessage, 'RangeError: Error #2006: The supplied index is out of bounds.');

    c.addChildAt(s1, 0);
    eq(c.getChildAt(0), s1);
    c.addChildAt(s2, 1);
    eq(c.getChildAt(1), s2);
    c.addChildAt(s3, 0);
    eq(c.getChildAt(0), s3);
    eq(c.getChildAt(1), s1);
    eq(c.getChildAt(2), s2);
    c.removeChildAt(0);
    eq(c.getChildAt(0), s1);
    eq(c.getChildAt(1), s2);
    c.removeChildAt(1);
    eq(c.getChildAt(0), s1);
  });

  unitTests.push(function timelineObjectHandling() {
    var s1 = new Shape();
    var s2 = new Shape();
    var s3 = new Shape();
    var c = new DisplayObjectContainer();
    c.addTimelineObjectAtDepth(s1, 1);
    c.addTimelineObjectAtDepth(s3, 3);
    c.addTimelineObjectAtDepth(s2, 2);
    eq(c.getChildIndex(s1), 0);
    eq(c.getTimelineObjectAtDepth(1), s1);
    eq(c.getTimelineObjectAtDepth(2), s2);
    eq(c.getTimelineObjectAtDepth(3), s3);
    eq(c.getTimelineObjectAtDepth(4), null);
    c.addChild(s1);
    eq(c.getTimelineObjectAtDepth(1), null);
    c.setChildIndex(s2, 1);
    eq(c.getTimelineObjectAtDepth(2), null);
  });

  unitTests.push(function getChildByName() {
    var s1 = new Shape();
    s1.name = 's1';
    var s2 = new Shape();
    s2.name = 's2';
    var s3 = new Shape();
    s3.name = 's3';
    var c = new DisplayObjectContainer();

    eq(c.getChildByName('foo'), null);

    c.addChild(s1);
    c.addChild(s2);
    c.addChild(s3);
    eq(c.getChildByName('s1'), s1);
    eq(c.getChildByName('s2'), s2);
    eq(c.getChildByName('s3'), s3);
  });

  unitTests.push(function getObjectsUnderPoint() {
    Random.seed(0x12343);

    var stage = new Stage();
    var container = new Sprite();
    stage.addChild(container);

    var square1 = new Sprite();
    square1.graphics.beginFill(0xFFCC00);
    square1.graphics.drawRect(0, 0, 40, 40);

    var square2 = new Sprite();
    square2.graphics.beginFill(0x00CCFF);
    square2.graphics.drawRect(20, 0, 30, 40);

    container.addChild(square1);
    container.addChild(square2);

    var pt = new Point(10, 20);
    var objects = container.getObjectsUnderPoint(pt).value;
    eq(objects.length, 1);

    pt = new Point(35, 20);
    objects = container.getObjectsUnderPoint(pt).value;
    eq(objects.length, 2);

    eq(objects[0], square1);
    eq(objects[1], square2);

    container.swapChildrenAt(0, 1);
    objects = container.getObjectsUnderPoint(pt).value;
    eq(objects.length, 2);

    eq(objects[0], square2);
    eq(objects[1], square1);

    var square3 = new Sprite();
    square3.graphics.beginFill(0x00CCFF);
    square3.graphics.drawRect(200, 0, 10, 10);
    container.addChild(square3);

    eq(container.hitTestPoint(80, 0), true);
    eq(container.hitTestPoint(80, 0, true), false);
  });

  unitTests.push(function setChildInex() {
    var exceptionMessage = null;
    var s = new Shape();
    var c = new DisplayObjectContainer();
    try {
      c.setChildIndex(s, 0);
    } catch (e) {
      exceptionMessage = e.toString();
    }
    eq(exceptionMessage, 'RangeError: Error #2006: The supplied index is out of bounds.');
  });

  unitTests.push(function setChildInex() {
    var exceptionMessage = null;
    var s0 = new Shape();
    var s1 = new Shape();
    var c = new DisplayObjectContainer();
    try {
      c.addChild(s0);
      c.setChildIndex(s1, 0);
    } catch (e) {
      exceptionMessage = e.toString();
    }
    eq(exceptionMessage, 'ArgumentError: Error #2025: The supplied DisplayObject must be a child of the caller.');
  });

  unitTests.push(function addChildWrongType() {
    var exceptionMessage = null;
    var s = "A";
    var c = new DisplayObjectContainer();
    try {
      c.addChild(s);
    } catch (e) {
      exceptionMessage = e.toString();
    }
    eq(exceptionMessage, 'TypeError: Error #1034: Type Coercion failed: cannot convert A to flash.display.DisplayObject.');
  });

  unitTests.push(function emptyChildBounds() {
    var c1 = new Sprite();
    var c2 = new Sprite();
    var s = new Sprite();
    s.graphics.beginFill(0x00CCFF);
    s.graphics.drawRect(0, 0, 100, 100);
    c2.addChild(s);
    var c3 = new Sprite();
    c1.addChild(c2);
    c1.addChild(c3);
    eq(c1.width, 100);
    eq(c1.height, 100);
  });

})();
