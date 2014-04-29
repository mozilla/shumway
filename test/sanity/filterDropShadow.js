(function filterDropShadow() {
  unitTests.push(function testDropShadowFilter() {

    var o = new flash.filters.DropShadowFilter();
    eq(o.distance, 4);
    eq(o.angle, 45);
    eq(o.color, 0);
    eq(o.alpha, 1);
    eq(o.blurX, 4);
    eq(o.blurY, 4);
    eq(o.strength, 1);
    eq(o.quality, 1);
    eq(o.inner, false);
    eq(o.knockout, false);
    eq(o.hideObject, false);

    var o = new flash.filters.DropShadowFilter(-100000, -100000, 0xff0000, -100000, -100000, -100000, -100000, -100000);
    eq(o.distance, -100000);
    eq(o.angle, -280);
    eq(o.color, 0xff0000);
    eq(o.alpha, 0);
    eq(o.blurX, 0);
    eq(o.blurY, 0);
    eq(o.strength, 0);
    eq(o.quality, 0);

    var o = new flash.filters.DropShadowFilter(100000, 100000, 0xff0000, 100000, 100000, 100000, 100000, 100000);
    eq(o.distance, 100000);
    eq(o.angle, 280);
    eq(o.color, 0xff0000);
    eq(o.alpha, 1);
    eq(o.blurX, 255);
    eq(o.blurY, 255);
    eq(o.strength, 255);
    eq(o.quality, 15);

    var o1 = new flash.filters.DropShadowFilter(2, 180, 0xff0000, 0.5, 8, 8, 2, 2, true, true, true);
    var o2 = o1.clone();
    eq(o2.distance, 2);
    eq(o2.angle, 180);
    eq(o2.color, 0xff0000);
    eq(o2.alpha, 0.5);
    eq(o2.blurX, 8);
    eq(o2.blurY, 8);
    eq(o2.strength, 2);
    eq(o2.quality, 2);
    eq(o2.inner, true);
    eq(o2.knockout, true);
    eq(o2.hideObject, true);

  });
})();
