(function displayBitmapTests() {

  var BitmapData = flash.display.BitmapData;
  var Rectangle = flash.geom.Rectangle;

  unitTests.push(function () {
    var bd = new BitmapData(10, 10, true, 0xFFAABBCC);
    eq(bd.getPixel(0, 0), 0xAABBCC);
    eq(bd.getPixel32(0, 0), 0xFFAABBCC, "Filled");
  });

  unitTests.push(function () {
    var bd = new BitmapData(100, 100, true, 0x11000000);
    bd.setPixel(0, 0, 0xff0000);
    eq(bd.getPixel(0, 0), 0xff0000);
    eq(bd.getPixel32(0, 0), 0x11ff0000);
    bd.setPixel32(0, 0, 0x22ff0000);
    eq(bd.getPixel32(0, 0), 0x22ff0000);
    bd.setPixel(0, 0, 0xff0000);
    eq(bd.getPixel32(0, 0), 0x22ff0000);
  });

  unitTests.push(function () {
    var bd = new BitmapData(100, 100, true, 0xff000000);
    bd.fillRect(new Rectangle(25, 25, 50, 50), 0xffff0000);
    eq(bd.getPixel32(24, 24), 0xff000000);
    eq(bd.getPixel32(25, 25), 0xffff0000);
    eq(bd.getPixel32(74, 25), 0xffff0000);
    eq(bd.getPixel32(74, 74), 0xffff0000);
    eq(bd.getPixel32(25, 74), 0xffff0000);
    eq(bd.getPixel32(75, 75), 0xff000000);
  });

  unitTests.push(function () {
    var bd = new BitmapData(100, 100, false, 0xff0033);
    eq(bd.getPixel32(0, 0), 0xffff0033);
    bd.setPixel32(0, 0, 0x11ff0033);
    eq(bd.getPixel32(0, 0), 0xffff0033);
  });

})();
