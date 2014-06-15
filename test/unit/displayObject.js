(function displayTests() {
  function log(message) {
    console.info(message);
  }

  var Random = Shumway.Random;
  var Matrix = flash.geom.Matrix;
  var Bounds = Shumway.Bounds;
  var Point = flash.geom.Point;
  var DisplayObject = flash.display.DisplayObject;
  var VisitorFlags = flash.display.VisitorFlags;

  var DisplayObjectFlags = flash.display.DisplayObjectFlags;
  var InteractiveObject = flash.display.InteractiveObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;
  var Shape = flash.display.Shape;
  var Sprite = flash.display.Sprite;

  var identity = new Matrix();
  var scaleBy5 = new Matrix();
  scaleBy5.scale(5, 5);


  unitTests.push(function transform() {
    var o = new DisplayObject();
    check(o.transform.matrix.equals(identity), "Should be the identity.");
    check(o.transform.concatenatedMatrix.equals(scaleBy5), "Should be the scaleBy5.");
    o.x = 10;
    eq(o.x, 10, "`x` is applied");
    eq(o.transform.matrix.tx, 10);

    o.y = 10.002;
    eq(o.y, 10, "Coordinates are rounded to twips");
    eq(o.transform.matrix.ty, 10, "Translation parameters are rounded to twips");
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
          return new Bounds(x, y, x + width, y + width);
        }
        parent.addChild(o);
      }
    }
    var container = new DisplayObjectContainer();
    make(container, branch, depth);
    return container;
  }

  unitTests.push(function transformPropagation() {
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
    eq(leafs[0].x, 0);
    eq(r.transform.concatenatedMatrix.tx, 50);

    var p = ["x", "y", "scaleX", "scaleY"];

    // Test concatenatedMatrix propagation.
    for (var i = 0; i < p.length; i++) {
      r[p[i]] += 0.1;
      check(leafs[0]._hasFlags(DisplayObjectFlags.InvalidConcatenatedMatrix),
        "Should invalidate concatenatedMatrix when setting: " + p[i]);
      leafs[0]._getConcatenatedMatrix();
      check(!leafs[0]._hasFlags(DisplayObjectFlags.InvalidConcatenatedMatrix),
        "Should have cached concatenatedMatrix when setting: " + p[i]);
      eq(leafs[0]._getConcatenatedMatrix(), leafs[0]._getConcatenatedMatrix(),
         "Repeatedly getting internal matrix gives same object.")
      neq(leafs[0].transform.concatenatedMatrix, leafs[0].transform.concatenatedMatrix,
         "Repeatedly getting external matrix gives different objects.")
    }

    log("Made: " + containers.length);
  });

  unitTests.push(function twipsRounding() {
    Random.seed(0x12343);
    var o = new DisplayObject();

    for (var i = 0; i < 10; i++) {
      var v = Random.next() * 100;
      var vTwipsRounded = (v * 20 | 0) / 20;
      o.x = v;
      eqFloat(o.x, vTwipsRounded, "x is rounded to twips");
      o.y = v;
      eqFloat(o.y, vTwipsRounded, "y is rounded to twips");
    }

    for (var i = 0; i < 10; i++) {
      var v = Random.next() * 100;
      o.scaleX = v;
      eqFloat(o.scaleX, v, "scaleX is stored without precision loss");
      o.scaleY = v;
      eqFloat(o.scaleY, v, "scaleY is stored without precision loss");
    }
  });

  unitTests.push(function rotation() {
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new Bounds(0, 0, 100 * 20, 100 * 20);
    }

    var rotationIn = [0.0001, 10, -10, 1000, -193, -553, 1256.5, -180, -181];
    var rotationOut = [0.0001, 10, -10, -80,  167,  167, 176.5, -180, 179];
    for (var i = 0; i < rotationIn.length; i++) {
      s.rotation = rotationIn[i];
      eq(s.rotation, rotationOut[i], "Rotation is mapped to [-180,180]");
    }

    s.rotation = 45;
    eq(s.x, 200, "Position should not change.");
    eqFloat(s.width, 141.4, "Should also affect the width: " + s.width);
    eqFloat(s.height, 141.4, "Should also affect the height: " + s.height);
  });

  unitTests.push(function widthAppliedToRotatedObject() {
    var s = new Shape();
    s.x = 200;
    s.y = 200;
    s.rotation = 45;
    s._getContentBounds = function () {
      return new Bounds(0, 0, 100 * 20, 100 * 20);
    }

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

  unitTests.push(function heightAppliedToRotatedObject() {
    var s = new Shape();
    s.x = 200;
    s.y = 200;
    s.rotation = 45;
    s._getContentBounds = function () {
      return new Bounds(0, 0, 100 * 20, 100 * 20);
    }

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


  unitTests.push(function transformMatrixAssignment() {
    var s = new Shape();
    s.x = 200;
    s.y = 200;
    s.rotation = 45;
    s._getContentBounds = function () {
      return new Bounds(0, 0, 100 * 20, 100 * 20);
    }

    var m = s.transform.matrix;
    m.b = 2;
    s.transform.matrix = m;
    eqFloat(s.transform.matrix.b, 2, "matrix.b: " + s.transform.matrix.b);
    eqFloat(s.rotation, 70.52, "rotation: " + s.rotation);
    eqFloat(s.width, 141.4, "Width: " + s.width);

    s.transform.matrix = new Matrix(-1, 0, 0, -1, 0, 0);
    eq(s.rotation, 180);
  });

  unitTests.push(function dimensionsConvergence() {
    var s = new Shape();
    s.x = 200;
    s.y = 200;
    s.rotation = 45;
    s._getContentBounds = function () {
      return new Bounds(0, 0, 100 * 20, 100 * 20);
    }

    for (var i = 0; i < 100; i ++) {
      s.width = 10;
    }
    eqFloat(s.width, 10, "Width should converge on 10");
    eqFloat(s.height, 10, "Height should converge on 10");
  });

  unitTests.push(function globalToLocalAndBack() {
    Random.seed(0x12343);
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new Bounds(0, 0, 100 * 20, 100 * 20);
    }

    eqFloat(s.globalToLocal(new Point(300, 0)).x, 100);
    eqFloat(s.localToGlobal(new Point(100, 0)).x, 300);

    // Some random points.
    for (var i = 0; i < 10; i++) {
      var p = new Point(Random.next() * 10, Random.next() * 10);
      s.rotation = i;
      var q = s.globalToLocal(p);
      var r = s.localToGlobal(q);
      eqFloat(p.x, r.x);
      eqFloat(p.y, r.y);
    }
  });

  unitTests.push(function hitTestObject() {
    var c = new DisplayObjectContainer();

    var a = new Shape();
    a._getContentBounds = function () {
      return new Bounds(0, 0, 100 * 20, 100 * 20);
    }

    var b = new Shape();
    b._getContentBounds = function () {
      return new Bounds(0, 0, 100 * 20, 100 * 20);
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
    neq(o.filters, o.filters);
    var D = new flash.filters.DropShadowFilter ();
    o.filters = [D];
    D.distance = 10;
    eq(o.filters[0].distance, 4);
    o.filters[0].distance = 19;
    eq(o.filters[0].distance, 4);
    neq(o.filters[0], o.filters[0]);
    o.filters = null;
    eq(o.filters.length, 0);
  });

  unitTests.push(function runInspectorSanityTests() {
    var s = new Shape();
    neq(s.transform.matrix, null, "Make sure matrix is not null when no Z value is set.");
    eq(s.transform.matrix3D, null, "Matrix 3D should be null by default.");
    // s.z = 1;
    // eq(s.transform.matrix, null, "Make sure matrix is not null when no Z value is set.");
  });

  unitTests.push(function () {
    var s = new Shape();
    s._getContentBounds = function () {
      return new Bounds(0, 0, 100 * 20, 100 * 20);
    }
    s.width = 50;
    eq(s.width, 50, "Setting the width when the object is not added to a parent.");
  });

})();
