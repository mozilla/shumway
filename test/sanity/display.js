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

var Matrix = flash.geom.Matrix;
var DisplayObject = flash.display.DisplayObject;
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