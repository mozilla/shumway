(function () {

  var Random = Shumway.Random;
  var Vector3D = flash.geom.Vector3D;
  var Float64Vector = Shumway.AVM2.AS.Float64Vector;
  var BitmapData = flash.display.BitmapData;

  unitTests.push(function () {
    checkTime(function () {
      var data = new BitmapData(1024, 1024);
    }, "new BitmapData(1024, 1024)", 10, 32)
  });

})();

