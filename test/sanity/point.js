unitTests.push(function runInspectorSanityTests(avm2) {
  function log(message) {
    console.info(message);
  }

  var Point = flash.geom.Point;
  var Rectangle = flash.geom.Rectangle;

  var l = 0;

  var s = Date.now();
  for (var i = 0; i < 1000000; i++) {
    var p = new Point(1, 2);
    l += p.x + p.y;
  }
  console.info(Date.now() - s);


  function point(x, y) {
    this.x = x;
    this.y = y;
  }

  s = Date.now();
  for (var i = 0; i < 1000000; i++) {
    var p = new point(1, 2);
    l += p.x + p.y;
  }
  console.info(Date.now() - s);

  var r = new Rectangle(10, 20);
  console.info(r);

});