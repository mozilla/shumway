(function displayTests() {

  var Random = Shumway.Random;
  var Vector3D = flash.geom.Vector3D;

  unitTests.push(function () {
    Random.seed(0x12343);
    eq(new Vector3D(2, 3, 5, 4).length, 6.164414002968976);
    eq(new Vector3D(2, 3, 5, 0).length, 6.164414002968976);
    eq(new Vector3D(2, 3, 5, 4).lengthSquared, 38);
    eq(new Vector3D(2, 3, 5, 4).clone().lengthSquared, 38);

    eqFloat(Vector3D.axClass.angleBetween(new Vector3D(2, 3, 5, 4), new Vector3D(5, -3, 5, 2)), 0.9895031360282126, null, 1e-7);
    eqFloat(Vector3D.axClass.distance(new Vector3D(2, 3, 5, 4), new Vector3D(5, -3, 5, 2)), 6.708203932499369, null, 1e-7);
    eq(new Vector3D(2, 3, 5, 4).dotProduct(new Vector3D(5, -3, 5, 2)), 26);
    eq(new Vector3D(2, 3, 5, 4).crossProduct(new Vector3D(5, -3, 5, 2)).lengthSquared, 1566);
    var v = new Vector3D(2, 3, 5, 4); v.normalize();
    eq(v.length, 1);
    v.scaleBy(4);
    eq(v.length, 4);
    v.incrementBy(v);
    eq(v.length, 8);
    v.decrementBy(v);
    eq(v.length, 0);
    var q = v.add(new Vector3D(1, 2, 3, 4));
    eq(v.length, 0);
    eq(q.length, 3.7416573867739413);
    q = v.subtract(new Vector3D(1, 2, 3, 4));
    eq(v.length, 0);
    eq(q.length, 3.7416573867739413);
    q.negate();
    eq(q.length, 3.7416573867739413);
    v = new Vector3D(1, 2, 3, 4);
    q = new Vector3D(1, 2, 3);
    eq(v.equals(q), true);
    eq(v.equals(q, true), false);
    v = new Vector3D(1, 2, 3, 4);
    q = new Vector3D(1.2, 1.8, 3);
    eq(v.nearEquals(q, 0.1), false);
    eq(v.nearEquals(q, 0.2), true);
    eq(v.nearEquals(q, 0.3), true);
    v.project();
    eq(v.length, 0.9354143466934853);
    eq(v.w, 4);
    eq(v.toString(), "Vector3D(0.25, 0.5, 0.75)");
  });

})();
