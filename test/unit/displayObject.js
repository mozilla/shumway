(function displayTests() {
  var GFXShape = Shumway.GFX.Shape;
  var Renderable = Shumway.GFX.Renderable;
  var FrameContainer = Shumway.GFX.FrameContainer;
  var Geometry = Shumway.GFX.Geometry;

  function timeAllocation(C) {
    var s = Date.now();
    for (var i = 0; i < 10000; i++) {
      var o = new C();
    }
    console.info("Took: " + (Date.now() - s) + " " + C);
  }

  function log(message) {
    console.info(message);
  }

  var Random = Shumway.Random;
  var Matrix = flash.geom.Matrix;
  var BoundingBox = Shumway.GFX.Geometry.BoundingBox;
  var Point = flash.geom.Point;
  var DisplayObject = flash.display.DisplayObject;
  var VisitorFlags = flash.display.VisitorFlags;

  var DisplayObjectFlags = flash.display.DisplayObjectFlags;
  var InteractiveObject = flash.display.InteractiveObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;
  var Shape = flash.display.Shape;
  var Sprite = flash.display.Sprite;

  var identity = new Matrix();
  var scaleBy5 = new Matrix(); scaleBy5.scale(5, 5);


  unitTests.push(function runInspectorSanityTests() {
    var o = new DisplayObject();
    check(o.transform.matrix.equals(identity), "Should be the identity.");
    check(o.transform.concatenatedMatrix.equals(scaleBy5), "Should be the scaleBy5.");
    o.x = 10;
    check(o.x === 10);
    check(o.transform.matrix.tx === 10);

    o.y = 10.002;
    check(o.y === 10);
    check(o.transform.matrix.ty === 10);
  });

  function createDisplayObjectTree(depth, branch, width, height) {
    var nodes = [];
    Random.seed(0x12343);
    function make(parent, count, depth) {
      if (depth > 0) {
        for (var i = 0; i < count; i++) {
          var o = new DisplayObjectContainer();
          nodes.push(o);
          parent.addChild(o);
          make(o, count, depth - 1);
        }
      } else {
        var o = new Shape();
        o._getContentBounds = function () {
          var w = width * 20;
          var h = height * 20;
          var x = -w / 2;
          var y = -h / 2;
          return new BoundingBox(x, y, x + width, y + width);
        }
        parent.addChild(o);
      }
    }
    var container = new DisplayObjectContainer();
    make(container, branch, depth);
    return container;
  }

  unitTests.push(function runInspectorSanityTests() {
    var VisitorFlags = Shumway.AVM2.AS.flash.display.VisitorFlags;
    var r = createDisplayObjectTree(10, 2, 64, 64);
    var containers = [];
    var leafs = [];
    r.visit(function (o) {
      if (o instanceof DisplayObjectContainer) {
        containers.push(o);
      } else {
        leafs.push(o)
      }
      return VisitorFlags.Continue;
    });

    r.x = 10;
    check(leafs[0].x === 0);
    check(r.transform.concatenatedMatrix.tx === 50);

    var p = ["x", "y", "scaleX", "scaleY"];

    // Test concatenatedMatrix propagation.
    for (var i = 0; i < p.length; i++) {
      r[p[i]] += 0.1;
      check(leafs[0]._hasFlags(DisplayObjectFlags.InvalidConcatenatedMatrix),
        "Should invalidate concatenatedMatrix when setting: " + p[i]);
      leafs[0]._getConcatenatedMatrix();
      check(!leafs[0]._hasFlags(DisplayObjectFlags.InvalidConcatenatedMatrix),
        "Should have cached concatenatedMatrix when setting: " + p[i]);
    }

    log("Made: " + containers.length);
  });

  unitTests.push(function runInspectorSanityTests() {
    Random.seed(0x12343);
    var o = new DisplayObject();
    var p = ["x", "y"];
    for (var i = 0; i < p.length; i++) {
      var v = Random.next() * 100;
      o[p[i]] = v;
      eqFloat(o[p[i]], ((v * 20) | 0) / 20,
        "Should have converted to twips and back to pixels: " + p[i]);
    }

    var p = ["scaleX", "scaleY"];
    for (var i = 0; i < p.length; i++) {
      var v = Random.next() * 100;
      o[p[i]] = v;
      eqFloat(o[p[i]], v,
        "No loss of precision when writing / reading: " + p[i]);
    }

    var v = [0.0001, 10, -10, 1000, -193, -193 - 360, 1256.5, -180, -181];
    var x = [0.0001, 10, -10, -80,   167, 167, 176.5, -180, 179];
    for (var i = 0; i < v.length; i++) {
      o.rotation = v[i];
      if (o.rotation !== x[i]) {
        check(false, "Should read back rotation: " + x[i] + " got " + o.rotation);
      }
    }
  });

  unitTests.push(function runInspectorSanityTests() {
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new BoundingBox(0, 0, 100 * 20, 100 * 20);
    }

    var options = ["x", "y", "rotation", "scaleX", "scaleY", "width"];
  });


  unitTests.push(function runInspectorSanityTests() {
    Random.seed(0x12343);
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new BoundingBox(0, 0, 100 * 20, 100 * 20);
    }

    check(s.getBounds().width === 100 && s.getBounds().height === 100);

    s.rotation = 45;
    check(s.x === 200, "Position should not change.");
    eqFloat(s.width, 141.4, "Should also affect the width: " + s.width);
    eqFloat(s.height, 141.4, "Should also affect the height: " + s.height);

    s.width = 50;
    eqFloat(s.width, 95.7, "Width: " + s.width);
    eqFloat(s.height, 95.7, "Height: " + s.height);
    eqFloat(s.scaleX, 0.353, "ScaleX: " + s.scaleX);
    eqFloat(s.scaleY, 1, "ScaleY: " + s.scaleY);

    s.width = 10;
    eqFloat(s.width, 52.85, "Width: " + s.width);
    eqFloat(s.height, 52.85, "Height: " + s.height);
    eqFloat(s.scaleX, 0.070, "ScaleX: " + s.scaleX);
    eqFloat(s.scaleY, 0.676, "ScaleY: " + s.scaleY);

    s.width = 10;
    eqFloat(s.width, 31.45, "Width: " + s.width);
    eqFloat(s.height, 31.45, "Height: " + s.height);
    eqFloat(s.scaleX, 0.070, "ScaleX: " + s.scaleX);
    eqFloat(s.scaleY, 0.373, "ScaleY: " + s.scaleY);

    s.rotation = 0;
    eqFloat(s.width, 7.05, "Width: " + s.width);
    eqFloat(s.height, 37.35, "Height: " + s.height);
    eqFloat(s.scaleX, 0.070, "ScaleX: " + s.scaleX);
    eqFloat(s.scaleY, 0.373, "ScaleY: " + s.scaleY);
  });

  unitTests.push(function runInspectorSanityTests() {
    Random.seed(0x12343);
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new BoundingBox(0, 0, 100 * 20, 100 * 20);
    }

    check(s.getBounds().width === 100 && s.getBounds().height === 100);

    s.rotation = 45;
    check(s.x === 200, "Position should not change.");
    eqFloat(s.width, 141.4, "Should also affect the width: " + s.width);
    eqFloat(s.height, 141.4, "Should also affect the height: " + s.height);

    s.height = 50;
    eqFloat(s.width, 95.7, "Width: " + s.width);
    eqFloat(s.height, 95.7, "Height: " + s.height);
    eqFloat(s.scaleX, 1, "ScaleX: " + s.scaleX);
    eqFloat(s.scaleY, 0.353, "ScaleY: " + s.scaleY);

    s.height = 10;
    eqFloat(s.width, 52.85, "Width: " + s.width);
    eqFloat(s.height, 52.85, "Height: " + s.height);
    eqFloat(s.scaleX, 0.676, "ScaleX: " + s.scaleX);
    eqFloat(s.scaleY, 0.070, "ScaleY: " + s.scaleY);

    s.height = 10;
    eqFloat(s.width, 31.45, "Width: " + s.width);
    eqFloat(s.height, 31.45, "Height: " + s.height);
    eqFloat(s.scaleX, 0.373, "ScaleX: " + s.scaleX);
    eqFloat(s.scaleY, 0.070, "ScaleY: " + s.scaleY);

    s.rotation = 0;
    eqFloat(s.width, 37.35, "Width: " + s.width);
    eqFloat(s.height, 7.05, "Height: " + s.height);
    eqFloat(s.scaleX, 0.373, "ScaleX: " + s.scaleX);
    eqFloat(s.scaleY, 0.070, "ScaleY: " + s.scaleY);
  });


  unitTests.push(function runInspectorSanityTests() {
    Random.seed(0x12343);
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new BoundingBox(0, 0, 100 * 20, 100 * 20);
    }

    check(s.getBounds().width === 100 && s.getBounds().height === 100);

    s.rotation = 45;
    var m = s.transform.matrix;
    m.b = 2;
    s.transform.matrix = m;
    eqFloat(s.transform.matrix.b, 2, "matrix.b: " + s.transform.matrix.b);
    eqFloat(s.rotation, 70.52, "rotation: " + s.rotation);
    eqFloat(s.width, 141.4, "Width: " + s.width);
  });

  unitTests.push(function runInspectorSanityTests() {
    Random.seed(0x12343);
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new BoundingBox(0, 0, 100 * 20, 100 * 20);
    }

    check(s.getBounds().width === 100 && s.getBounds().height === 100);
    s.rotation = 45;
    for (var i = 0; i < 100; i ++) {
      s.width = 10;
    }
    eqFloat(s.width, 10, "Width should eventually become 10: " + s.width);
    eqFloat(s.height, 10, "Height should eventually become 10: " + s.height);
  });

  unitTests.push(function runInspectorSanityTests() {
    Random.seed(0x12343);
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new BoundingBox(0, 0, 100 * 20, 100 * 20);
    }

    eqFloat(s.globalToLocal(new Point(300, 0)).x, 100);
    eqFloat(s.localToGlobal(new Point(100, 0)).x, 300);

    // Some random points.
    for (var i = 0; i < 10; i++) {
      var p = new Point(Math.random() * 10, Math.random() * 10);
      s.rotation = i;
      var q = s.globalToLocal(p);
      var r = s.localToGlobal(q);
      eqFloat(p.x, r.x);
      eqFloat(p.y, r.y);
    }
  });

  unitTests.push(function runInspectorSanityTests() {
    Random.seed(0x12343);
    var c = new DisplayObjectContainer();

    var a = new Shape();
    a._getContentBounds = function () {
      return new BoundingBox(0, 0, 100 * 20, 100 * 20);
    }

    var b = new Shape();
    b._getContentBounds = function () {
      return new BoundingBox(0, 0, 100 * 20, 100 * 20);
    }

    check(a.hitTestObject(b));
    b.x = 90;
    check(a.hitTestObject(b));
    b.x = 110;
    check(!a.hitTestObject(b));
    b.rotation = 45;
    check(a.hitTestObject(b));
    b.rotation = 0;
    b.x = 0;
    check(a.hitTestObject(b));
    c.addChild(a);
    c.x = -200;
    check(!a.hitTestObject(b));
  });

  unitTests.push(function checkFiltersGetterAndSetter() {
    var o = new DisplayObject();
    eq(o.filters.length, 0);
    var a = [];
    o.filters = a;
    neq(o.filters, a);
    var D = new flash.filters.DropShadowFilter ();
    o.filters = [D]
    D.distance = 10;
    eq(o.filters[0].distance, 4);
    o.filters[0].distance = 19;
    eq(o.filters[0].distance, 4);
    neq(o.filters[0], o.filters[0]);
    o.filters = null;
    eq(o.filters.length, 0);
  });

  unitTests.push(function runInspectorSanityTests() {
    Random.seed(0x12343);
    var s = new Shape();
    s.transform.matrix = new Matrix(-1, 0, 0, -1, 0, 0);
    eq(s.rotation, 180);
  });

})();
