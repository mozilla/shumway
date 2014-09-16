(function displayTests() {

  var Matrix = flash.geom.Matrix;

  function matrixToString(m) {
    return "a=" + m.a.toFixed(5) +
      ", b=" + m.b.toFixed(5) +
      ", c=" + m.c.toFixed(5) +
      ", d=" + m.d.toFixed(5) +
      ", tx=" + m.tx.toFixed(5) +
      ", ty=" + m.ty.toFixed(5);
  }

  unitTests.push(function () {
    var m = new Matrix();

    m.createGradientBox(10, 10, 10, 10, 10);
    eq(matrixToString(m), "a=-0.00512, b=-0.00332, c=0.00332, d=-0.00512, tx=15.00000, ty=15.00000");

    m.createGradientBox(-12310, 10, 10, 10, 10);
    eq(matrixToString(m), "a=6.30430, b=-0.00332, c=-4.08746, d=-0.00512, tx=-6145.00000, ty=15.00000");

    m.createGradientBox(-12310, 10, 102, 10, -10);
    eq(matrixToString(m), "a=-0.76326, b=0.00607, c=7.47456, d=0.00062, tx=-6145.00000, ty=-5.00000");

  });
})();
