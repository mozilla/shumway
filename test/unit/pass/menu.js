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

  var ContextMenuItem = flash.ui.ContextMenuItem;

  unitTests.push(function () {
    var menu = new ContextMenuItem(null);
    eq(menu.caption, "");
    eq(menu.separatorBefore, false);
    eq(menu.visible, true);
  });
})();
