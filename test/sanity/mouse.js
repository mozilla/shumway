(function mouseTests() {

  var Random = Shumway.Random;
  var Stage = flash.display.Stage;
  var Shape = flash.display.Shape;
  var Sprite = flash.display.Sprite;
  var MouseEventDispatcher = flash.ui.MouseEventDispatcher;
  var MouseEvent = flash.events.MouseEvent;
  var Point = flash.geom.Point;

  unitTests.push(function () {
    Random.seed(0x12343);

    var stage = new Stage();
    var c1 = new Sprite;
    var c2 = new Sprite;
    var c3 = new Sprite;
    var m = new MouseEventDispatcher();
    var r = '';

    var addMouseEventListeners = function (o, p) {
      o.addEventListener(MouseEvent.ROLL_OVER, function (e) { r += p + 'RV' + (e.target === o ? 't' : 'f') });
      o.addEventListener(MouseEvent.ROLL_OUT, function (e) { r += p + 'RU' + (e.target === o ? 't' : 'f') });
      o.addEventListener(MouseEvent.MOUSE_OVER, function (e) { r += p + 'MV' + (e.target === o ? 't' : 'f') });
      o.addEventListener(MouseEvent.MOUSE_OUT, function (e) { r += p + 'MU' + (e.target === o ? 't' : 'f') });
      o.addEventListener(MouseEvent.MOUSE_MOVE, function (e) { r += p + 'MM' + (e.target === o ? 't' : 'f') });
      o.addEventListener(MouseEvent.MOUSE_DOWN, function (e) { r += p + 'MD' + (e.target === o ? 't' : 'f') });
      o.addEventListener(MouseEvent.MOUSE_UP, function (e) { r += p + 'MU' + (e.target === o ? 't' : 'f') });
      o.addEventListener(MouseEvent.CLICK, function (e) { r += p + 'C' + (e.target === o ? 't' : 'f') });
      o.addEventListener(MouseEvent.DOUBLE_CLICK, function (e) { r += p + 'DC' + (e.target === o ? 't' : 'f') });
      o.addEventListener(MouseEvent.MOUSE_LEAVE, function (e) { r += p + 'ML' + (e.target === o ? 't' : 'f') });
    };
    var fireMouseEvent = function (type, x, y) {
      r = '';
      m.handleMouseEvent({ type: type, point: new Point(x, y) });
    };

    stage.stageWidth = 550;
    stage.stageHeight = 400;

    c1.graphics.beginFill(0xff0000);
    c1.graphics.drawRect(0, 0, 100, 100);
    c1.name = 'c1';
    c2.graphics.beginFill(0x00ff00);
    c2.graphics.drawRect(0, 0, 100, 100);
    c2.name = 'c2';
    c2.doubleClickEnabled = true;
    c2.y = 100;
    c3.x = 225;
    c3.y = 100;
    c3.addChild(c1);
    c3.addChild(c2);
    stage.addChild(c3);

    m.stage = stage;

    addMouseEventListeners(stage, 's');
    addMouseEventListeners(c1, '1');
    addMouseEventListeners(c2, '2');
    addMouseEventListeners(c3, '3');

    fireMouseEvent('mousemove', 50, 50);
    eq(r, 'sMMt');

    fireMouseEvent('mousemove', 275, 150);
    eq(r, '1RVt3RVt1MVt3MVfsMVf');
    fireMouseEvent('mousedown', 275, 150);
    eq(r, '1MDt3MDfsMDf');
    fireMouseEvent('mouseup', 275, 150);
    eq(r, '1MUt3MUfsMUf');
    fireMouseEvent('dblclick', 275, 150);
    eq(r, '');

    fireMouseEvent('mousemove', 275, 250);
    eq(r, '1MUt3MUfsMUf1RUt2RVt2MVt3MVfsMVf');
    fireMouseEvent('click', 275, 250);
    eq(r, '2Ct3CfsCf');
    fireMouseEvent('dblclick', 275, 250);
    eq(r, '2DCt3DCfsDCf');

    fireMouseEvent('mousemove', 375, 250);
    eq(r, '2MUt3MUfsMUf2RUt3RUtsMMt');

    fireMouseEvent('mousemove', 600, 50);
    eq(r, 'sMLt');
    fireMouseEvent('mousemove', -50, 50);
    eq(r, '');
  });

})();
