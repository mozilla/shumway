(function () {

  var Random = Shumway.Random;
  var Point = flash.geom.Point;
  var Rectangle = flash.geom.Rectangle;
  var BitmapData = flash.display.BitmapData;

  /**
   * Try to adjust the timing threshold for tests based on the CPU frequency of the machine they
   * are running on.
   */
  var scale = (function () {
    var c = 1024 * 1024 * 128;
    var s = 0;
    var start = Date.now();
    // Spin for a while, if you change |c| also change the constant below.
    for (var i = 0; i < c; i++) {
      if (s & 0x3 === 0) { // Try to prevent unrolling.
        s = s + 1 | i;
      } else {
        s = s + 3 | i;
      }
    }
    var elapsed = Date.now() - start;
    var scale = elapsed / 156; // On my MacBook Pro 2.6 GHz, this runs for about 156ms.
    return scale;
  })();

  console.info("Scale: " + scale.toFixed(2));

  unitTests.push(function () {
    checkTime(function () {
      var data = new BitmapData(1024, 1024);
    }, "new BitmapData(1024, 1024)", 10, 32)
  });

  unitTests.push(function () {
    var A = new Rectangle(1.1, 2.2, 3.3, 4.4);
    var C = 1024 * 512;
    checkTime(function () {
      for (var i = 0; i < C; i++) {
        A.roundInPlace();
      }
    }, "Rectangle::roundInPlace", 10 * scale, 32);
  });

  unitTests.push(function () {
    var A = new Rectangle(0.1, 0.1, 4.1, 4.1);
    var B = new Rectangle(1.1, 1.1, 2.1, 2.1);
    var C = 1024 * 512;
    checkTime(function () {
      for (var i = 0; i < C; i++) {
        A.intersectInPlace(B);
      }
    }, "Rectangle::intersectInPlace", 15 * scale, 32);
  });

  unitTests.push(function () {
    var a = new BitmapData(2048, 2048, true, 0xAABBCCDD);
    var b = new BitmapData(2048, 2048, true, 0xBBCCDDEE);
    var w = 32, h = 32;
    checkTime(function () {
      var s = new Rectangle(0, 0, 0, 0);
      var p = new Point(0, 0);
      for (var y = 0; y < 2048; y += h) {
        for (var x = 0; x < 2048; x += w) {
          s.setTo(x, y, w, h);
          p.setTo(x, y);
          a.copyPixels(b, s, p);
        }
      }
    }, "BitmapData::copyPixels", 30 * scale, 32)
  });

  unitTests.push(function () {
    var a = new BitmapData(1024, 1024, true, 0xAABBCCDD);
    var b = new BitmapData(1024, 1024, true, 0xBBCCDDEE);
    checkTime(function () {
      var s = new Rectangle(0, 0, 0, 0);
      var p = new Point(0, 0);
      for (var i = 0; i < 5; i += 1) {
        a.copyPixels(b, b.rect, new Point(0, 0), null, null, true);
      }
    }, "BitmapData::copyPixels(mergeAlpha = true)", 30 * scale, 8)
  });

  unitTests.push(function () {
    var a = new BitmapData(640, 480, true, 0xAABBCCDD);
    var b = new BitmapData(640, 480, true, 0xAABBCCDD);
    var r = new Rectangle(0, 0, 640, 480);
    checkTime(function () {
      var p = new Point(0, 0);
      for (var i = 0; i < 1024; i ++) {
        b.fillRect(r, 0xAABBCCDD);
        a.copyPixels(b, r, p, null, null, true);
      }
    }, "BitmapData::copyPixels() w/ same fill should be really fast.", 1 * scale, 8, false);
  });


})();

