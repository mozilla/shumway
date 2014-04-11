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
var DisplayObject = flash.display.DisplayObject;
var DisplayObjectFlags = flash.display.DisplayObjectFlags;
var InteractiveObject = flash.display.InteractiveObject;
var DisplayObjectContainer = flash.display.DisplayObjectContainer;

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