createEasel();

(function displayTests() {
  var Grid = Shumway.GFX.Layers.Grid;
  var Shape = Shumway.GFX.Layers.Shape;
  var shapeSource = Shumway.getRandomShape();
  var frame = new Shape(shapeSource);

  easel.world.addChild(new Shape(new Grid()));

  easel.world.addChild(frame);

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

  var testNumber = 0;

  function eqFloat(a, b, test) {
    test = test ? ": " + test : " #" + testNumber;
    if (Math.abs(a -b) < 0.1) {
      console.info("PASS" + test)
    } else {
      console.error("FAIL" + test)
    }
    testNumber ++;
  }

  function check(condition, test) {
    test = test ? ": " + test : " #" + testNumber;
    if (condition) {
      console.info("PASS" + test)
    } else {
      console.error("FAIL" + test)
    }
    testNumber ++;
  }


  var Random = Shumway.Random;
  var Matrix = flash.geom.Matrix;
  var Rectangle = flash.geom.Rectangle;
  var DisplayObject = flash.display.DisplayObject;
  var DisplayObjectFlags = flash.display.DisplayObjectFlags;
  var InteractiveObject = flash.display.InteractiveObject;
  var DisplayObjectContainer = flash.display.DisplayObjectContainer;
  var Shape = flash.display.Shape;
  var Sprite = flash.display.Sprite;

  var identity = new Matrix();
  var scaleBy5 = new Matrix(); scaleBy5.scale(5, 5);


  sanityTests.push(function runInspectorSanityTests(console) {
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

  function createDisplayObjectTree(depth, width, height) {
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
        parent.addChild(new DisplayObject());
      }
    }

    var container = new DisplayObjectContainer();
    make(container, 2, depth);
    return container;
  }

  sanityTests.push(function runInspectorSanityTests(console) {
    var VisitorFlags = Shumway.AVM2.AS.flash.display.VisitorFlags;
    var r = createDisplayObjectTree(10, 1024, 1024);
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

  sanityTests.push(function runInspectorSanityTests(console) {
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

  sanityTests.push(function runInspectorSanityTests(console) {
    // var folder = GUI.addFolder("TEST");

    // ctx.strokeStyle = "green";
    // ctx.fillStyle = "red";

    var s = new Shape();
    var c = new DisplayObjectContainer();
    c.addChild(s);
    s.x = 200;
    s.y = 200;
    s._getContentBounds = function () {
      return new Rectangle(0, 0, 100 * 20, 100 * 20);
    }

    var options = ["x", "y", "rotation", "scaleX", "scaleY", "width"];
//    options.forEach(function (n) {
//      var p = folder.add(s, n);
//      p.onChange(function() {
//        ctx.save();
//        ctx.clearRect(0, 0, canvas.width, canvas.height);
//        var t = s.transform.concatenatedMatrix;
//        ctx.save();
//        ctx.setTransform(t.a, t.b, t.c, t.d, t.tx, t.ty);
//        ctx.scale(1/20, 1/20);
//        var b = s.getBounds(null);
//        ctx.fillRect(b.x, b.y, b.width, b.height);
//        ctx.restore();
//        ctx.strokeRect(b.x, b.y, b.width, b.height);
//        ctx.restore();
//      });
//    })
  });


  sanityTests.push(function runInspectorSanityTests(console) {

//    var folder = GUI.addFolder("TEST2");

    // ctx.fillStyle = "red";
    // ctx.fillRect(0, 0, 10, 10);
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
    log(s.getBounds(null));
    log(s.getBounds(s.parent));
    s.rotation = 45;
    log("After Rotation: " + s.getBounds(s.parent));
    log(s.transform.matrix);
    check(s.x === 200, "Position should not change.");
    eqFloat(s.width, 141.4, "Should also affect the width: " + s.width);
    eqFloat(s.height, 141.4, "Should also affect the height: " + s.height);

    s.width = 50;
    log(s.transform.matrix);

    eqFloat(s.width, 95.7, "Setting width: " + s.width);
    eqFloat(s.scaleX, 0.353, "ScaleX is also set: " + s.scaleX);
    eqFloat(s.scaleY, 1, "ScaleY is also set: " + s.scaleY);

    s.width = 10;
    log(s.transform.matrix);
    log("After Second Set: " + s.getBounds(s.parent));
    eqFloat(s.width, 72.85, "Setting width again: " + s.width);
  });
})();
