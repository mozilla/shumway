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

})();
