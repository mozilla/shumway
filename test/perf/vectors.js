(function () {
  var Random = Shumway.Random;
  var Vector3D = flash.geom.Vector3D;
  var Float64Vector = Shumway.AVM2.AS.Float64Vector;
  unitTests.push(function () {
    var v = new Float64Vector();
    for (var i = 0; i < 1000000; i++) {
      v.push(i);
    }
  });
})();
