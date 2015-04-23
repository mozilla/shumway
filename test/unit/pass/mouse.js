(function mouseTests() {

  var Random = Shumway.Random;

  function createMouseDispatcher() {
    var s = new flash.display.Stage();
    var m = new Shumway.AVMX.AS.flash.ui.MouseEventDispatcher();
    s.setStageWidth(550);
    s.setStageHeight(400);
    m.stage = s;
    return m;
  }

  unitTests.push(function () {
    Random.seed(0x12343);

    var m = createMouseDispatcher();
    var r = '';

    var addMouseEventListeners = function (o, p) {
      o.addEventListener("rollOver", function (e) { r += p + 'RV' + (e.target === o ? 't' : 'f') });
      o.addEventListener("rollOut", function (e) { r += p + 'RU' + (e.target === o ? 't' : 'f') });
      o.addEventListener("mouseOver", function (e) { r += p + 'MV' + (e.target === o ? 't' : 'f') });
      o.addEventListener("mouseOut", function (e) { r += p + 'MU' + (e.target === o ? 't' : 'f') });
      o.addEventListener("mouseMove", function (e) { r += p + 'MM' + (e.target === o ? 't' : 'f') });
      o.addEventListener("mouseDown", function (e) { r += p + 'MD' + (e.target === o ? 't' : 'f') });
      o.addEventListener("mouseUp", function (e) { r += p + 'MU' + (e.target === o ? 't' : 'f') });
      o.addEventListener("click", function (e) { r += p + 'C' + (e.target === o ? 't' : 'f') });
      o.addEventListener("doubleClick", function (e) { r += p + 'DC' + (e.target === o ? 't' : 'f') });
      o.addEventListener("mouseLeave", function (e) { r += p + 'ML' + (e.target === o ? 't' : 'f') });
    };
    var fireMouseEvent = function (type, x, y) {
      r = '';
      m.handleMouseEvent({ type: type, point: new flash.geom.Point(x, y) });
    };

    var c1 = new flash.display.Sprite();
    c1.graphics.beginFill(0xff0000);
    c1.graphics.drawRect(0, 0, 100, 100);
    c1.name = 'c1';
    var c2 = new flash.display.Sprite();
    c2.graphics.beginFill(0x00ff00);
    c2.graphics.drawRect(0, 0, 100, 100);
    c2.name = 'c2';
    c2.doubleClickEnabled = true;
    c2.y = 100;
    var c3 = new flash.display.Sprite();
    c3.x = 225;
    c3.y = 100;
    c3.addChild(c1);
    c3.addChild(c2);
    m.stage.addChild(c3);

    addMouseEventListeners(m.stage, 's');
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

  unitTests.push(function () {
    Random.seed(0x12343);

    var m = createMouseDispatcher();
    var r = '';

    var fireClickEvent = function (x, y) {
      r = '';
      m.handleMouseEvent({ type: 'click', point: new flash.geom.Point(x, y) });
    };

    var s = new flash.display.Shape();
    s.graphics.beginFill(0xff0000);
    s.graphics.drawRect(0, 0, 100, 300);
    s.addEventListener('click', function () {
      r = 'A';
    });
    m.stage.addChildAt(s, 0);
    fireClickEvent(50, 50);
    eq(r, '');

    var c1 = new flash.display.Sprite();
    c1.graphics.beginFill(0x00ff00);
    c1.graphics.drawRect(0, 0, 100, 200);
    c1.x = 100;
    c1.addEventListener('click', function () {
      r = 'B';
    });
    m.stage.addChildAt(c1, 0);
    fireClickEvent(150, 50);
    eq(r, 'B');

    var c2 = new flash.display.Sprite();
    c2.graphics.beginFill(0x000000ff);
    c2.graphics.drawRect(0, 0, 100, 100);
    c2.x = 200;
    var c3 = new flash.display.Sprite();
    c3.graphics.beginFill(0xff0000);
    c3.graphics.drawRect(0, 0, 50, 50);
    c3.x = 25;
    c3.y = 25;
    c3.addEventListener('click', function () {
      r = 'C';
    });
    c2.addChild(c3);
    m.stage.addChild(c2);
    fireClickEvent(250, 50);
    eq(r, 'C');

    var c4 = new flash.display.Sprite();
    c4.graphics.beginFill(0x0000ff);
    c4.graphics.drawRect(0, 0, 100, 100);
    c4.x = 300;
    c4.mouseChildren = false;
    var c5 = new flash.display.Sprite();
    c5.graphics.beginFill(0xff0000);
    c5.graphics.drawRect(0, 0, 50, 50);
    c5.x = 25;
    c5.y = 25;
    var b = new flash.display.SimpleButton();
    b.addEventListener('click', function () {
      r = 'D';
    });
    b.upState = c5;
    b.hitTestState = c5;
    c4.addChild(b);
    m.stage.addChild(c4);
    fireClickEvent(50, 50);
    eq(r, '');

    var s1 = new flash.display.Shape();
    s1.graphics.beginFill(0xff0000);
    s1.graphics.drawRect(0, 100, 100, 100);
    s1.addEventListener('click', function () {
      r = 'E';
    });
    var c6 = new flash.display.Sprite();
    c6.x = 300;
    c6.y = 100;
    c6.addChild(s1);
    c6.addEventListener('click', function () {
      r = 'F';
    });
    m.stage.addChild(c6);
    fireClickEvent(350, 250);
    eq(r, 'F');
  });

  unitTests.push(function () {
    Random.seed(0x12343);

    var m = createMouseDispatcher();
    var r = '';

    var fireClickEvent = function (x, y) {
      r = '';
      m.handleMouseEvent({ type: 'click', point: new flash.geom.Point(x, y) });
    };

    var c1 = new flash.display.Sprite();
    c1.graphics.beginFill(0x0000ff);
    c1.graphics.drawRect(0, 0, 100, 100);
    c1.addEventListener('click', function () {
      r = 'A';
    });
    var c2 = new flash.display.Sprite();
    c2.graphics.beginFill(0xff0000);
    c2.graphics.drawRect(0, 0, 50, 50);
    c2.x = 25;
    c2.y = 25;
    c2.addEventListener('click', function () {
      r = 'B';
    });
    m.stage.addChild(c1);
    m.stage.addChild(c2);
    fireClickEvent(50, 50);
    eq(r, 'B');
    c2.mouseEnabled = false;
    fireClickEvent(50, 50);
    eq(r, 'A');
    c2.mouseEnabled = true;
    c2.name = 'B';
    c2.x = 150;
    c1.hitArea = c2;
    fireClickEvent(50, 50);
    eq(r, '');
    fireClickEvent(175, 50);
    eq(r, 'B');
    c2.mouseEnabled = false;

    fireClickEvent(175, 50);
    eq(r, 'A');
    var c3 = new flash.display.Sprite();
    c3.graphics.beginFill(0x00ff00);
    c3.graphics.drawRect(0, 0, 100, 100);
    c3.x = 400;
    var c4 = new flash.display.Sprite();
    c4.graphics.beginFill(0xff0000);
    c4.graphics.drawRect(0, 0, 50, 50);
    c4.x = 425;
    c4.y = 25;
    var b = new flash.display.SimpleButton();
    b.upState = c3;
    b.addEventListener('click', function () {
      r = 'C';
    });
    m.stage.addChild(b);
    fireClickEvent(450, 50);
    eq(r, '');
    b.hitTestState = c4;
    fireClickEvent(450, 50);
    // eq(r, 'C'); TODO: Fails
  });

  unitTests.push(function () {
    Random.seed(0x12343);

    var c = new flash.display.Sprite();
    c.graphics.beginFill(0xff0000);
    c.graphics.drawRect(0, 0, 100, 100);
    c.x = 100;
    c.y = 50;
    var evt = new flash.events.MouseEvent('mouseMove', true, false, 50, 25);

    c.dispatchEvent(evt);
    eq(evt.target, null);
    eq(evt.stageX, 0);
    eq(evt.stageY, 0);
    eq(evt.movementX, 0);
    eq(evt.movementY, 0);

    var eventWasTriggered = false;
    c.addEventListener('mouseMove', function (e) {
      eventWasTriggered = true;
      eq(e.localX, 50);
      eq(e.localY, 25);
      eq(e.stageX, 150);
      eq(e.stageY, 75);
      e.localX = 0;
      e.localY = 0;
      eq(e.localX, 0);
      eq(e.localY, 0);
      eq(e.stageX, 100);
      eq(e.stageY, 50);
    });
    c.dispatchEvent(evt);
    check(eventWasTriggered);
  });

})();
