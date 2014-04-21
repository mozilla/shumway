(function displayTests() {
  var GFXShape = Shumway.GFX.Layers.Shape;
  var Renderable = Shumway.GFX.Layers.Renderable;
  var FrameContainer = Shumway.GFX.Layers.FrameContainer;
  var Geometry = Shumway.Geometry;

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
  var Rectangle = flash.geom.Rectangle;
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


  unitTests.push(function runInspectorSanityTests(console) {
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
          return new Rectangle(- w / 2, - h / 2, w, h);
        }
        parent.addChild(o);
      }
    }
    var container = new DisplayObjectContainer();
    make(container, branch, depth);
    return container;
  }

  unitTests.push(function runInspectorSanityTests(console) {
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

    console.info("Made: " + containers.length);
  });

  unitTests.push(function runInspectorSanityTests(console) {
    Random.seed(0x12343);
    var o = new DisplayObject();
    var p = ["x", "y"];
    for (var i = 0; i < p.length; i++) {
      var v = Random.next() * 100;
      o[p[i]] = v;
      check(o[p[i]] === ((v * 20) | 0) / 20,
        "Should have converted to twips and back to pixels: " + p[i]);
    }

    var p = ["scaleX", "scaleY"];
    for (var i = 0; i < p.length; i++) {
      var v = Random.next() * 100;
      o[p[i]] = v;
      check(o[p[i]] === v,
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

  unitTests.push(function runInspectorSanityTests(console) {
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new Rectangle(0, 0, 100 * 20, 100 * 20);
    }

    var options = ["x", "y", "rotation", "scaleX", "scaleY", "width"];
  });


  unitTests.push(function runInspectorSanityTests(console) {
    Random.seed(0x12343);
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new Rectangle(0, 0, 100 * 20, 100 * 20);
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

  unitTests.push(function runInspectorSanityTests(console) {
    Random.seed(0x12343);
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new Rectangle(0, 0, 100 * 20, 100 * 20);
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


  unitTests.push(function runInspectorSanityTests(console) {
    Random.seed(0x12343);
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new Rectangle(0, 0, 100 * 20, 100 * 20);
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

  unitTests.push(function runInspectorSanityTests(console) {
    Random.seed(0x12343);
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new Rectangle(0, 0, 100 * 20, 100 * 20);
    }

    check(s.getBounds().width === 100 && s.getBounds().height === 100);
    s.rotation = 45;
    for (var i = 0; i < 100; i ++) {
      s.width = 10;
    }
    eqFloat(s.width, 10, "Width should eventually become 10: " + s.width);
    eqFloat(s.height, 10, "Height should eventually become 10: " + s.height);
  });

  unitTests.push(function runInspectorSanityTests(console) {
    Random.seed(0x12343);
    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new Rectangle(0, 0, 100 * 20, 100 * 20);
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

  unitTests.push(function runInspectorSanityTests(console) {
    Random.seed(0x12343);
    var c = new DisplayObjectContainer();

    var a = new Shape();
    a._getContentBounds = function () {
      return new Rectangle(0, 0, 100 * 20, 100 * 20);
    }

    var b = new Shape();
    b._getContentBounds = function () {
      return new Rectangle(0, 0, 100 * 20, 100 * 20);
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


  var frameMap = {};

  function makeFrameTree(easel, root) {
    function makeFrame(node) {
      var frame = null
      if (DisplayObjectContainer.isType(node)) {
        frame = new FrameContainer();
        var children = node._children;
        for (var i = 0; i < children.length; i++) {
          frame.addChild(makeFrame(children[i]));
        }
        var r = new Renderable(Geometry.Rectangle.createSquare(1024), function (context) {
          context.save();
          var m = node._getConcatenatedMatrix();
          context.transform(m.a, m.b, m.c, m.d, m.tx / 20, m.ty / 20);
          context.beginPath();
          context.lineWidth = 2;
          context.strokeStyle = Shumway.ColorStyle.Red;
          if (m.ty > 1000) {
            m = node._getConcatenatedMatrix();
          }
          var b = node.getBounds(null);
          if (node.style) {
            context.strokeStyle = node.style;
          } else {
            context.strokeStyle = Shumway.ColorStyle.LightOrange;
          }
          context.strokeRect(b.x, b.y, b.width, b.height);
          context.closePath();
          context.restore();
        });
        easel.worldOverlay.addChild(new GFXShape(r));
      } else {
        var b = node.getBounds(null);
        var bounds = new Geometry.Rectangle(b.x, b.y, b.width, b.height);
        var renderable = new Renderable(bounds, function (context) {
          context.save();
          context.beginPath();
          context.lineWidth = 2;
          context.strokeStyle = Shumway.ColorStyle.BlueGrey;
          context.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
          context.restore();
        });
        frame = new GFXShape(renderable);
      }
      var m = node.transform.matrix;
      frame.matrix = new Geometry.Matrix(m.a, m.b, m.c, m.d, m.tx, m.ty);
      frameMap[node._id] = frame;
      return frame;
    }

    easel.world.addChild(makeFrame(root));
  }


  unitTests.push(function runInspectorSanityTests(console) {
    return;
    var c0 = new DisplayObjectContainer(); c0.x = 200;
    var c1 = new DisplayObjectContainer(); c1.x = 200;
    var s = new Shape();
    s._getContentBounds = function () {
      var w = 100 * 20;
      var h = 50 * 20;
      return new Rectangle(- w / 2, - h / 2, w, h);
    }
    c0.addChild(c1);
    c1.addChild(s);
    var easel = createEasel();
    makeFrameTree(easel, c0);

    setInterval(function tick() {
      s.rotation += 1;
      c1.rotation += 1;

      c0.visit(function (node) {
        var f = frameMap[node._id];
        var m = node._getMatrix();
        f.matrix = new Geometry.Matrix(m.a, m.b, m.c, m.d, m.tx / 20, m.ty / 20);
        return VisitorFlags.Continue;
      });

      easel.render();
    }, 33);
  });

  unitTests.push(function runInspectorSanityTests(console) {
    Random.seed(0x12343);

    var r = createDisplayObjectTree(3, 4, 128, 128);

    var x = 100;
    r.visit(function (node) {
      if (r === node) {
        return VisitorFlags.Continue;
      }
      node.speed = Math.random();
      node.x = (Math.random()) * 128;
      node.y = (Math.random()) * 128;
      return VisitorFlags.Continue;
    });

    var easel = createEasel();
    makeFrameTree(easel, r);

    var k = 0;
    setInterval(function tick() {

      r.visit(function (node) {
        node._invalidatePosition();

        if (r === node) {
          return VisitorFlags.Continue;
        }
        if (node.speed) {
          node.rotation += node.speed;
        }
        return VisitorFlags.Continue;
      });

      r.visit(function (node) {
        var f = frameMap[node._id];
        var m = node.transform.matrix;
        f.matrix = new Geometry.Matrix(m.a, m.b, m.c, m.d, m.tx, m.ty);
        return VisitorFlags.Continue;
      });

      k ++;
      easel.render();
    }, 16);
  });

})();
