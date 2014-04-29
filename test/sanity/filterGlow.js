(function filterGLow() {
  unitTests.push(function testGlowFilter() {

    var o = new flash.filters.GlowFilter();
    eq(o.color, 0xff0000);
    eq(o.alpha, 1);
    eq(o.blurX, 6);
    eq(o.blurY, 6);
    eq(o.strength, 2);
    eq(o.quality, 1);
    eq(o.inner, false);
    eq(o.knockout, false);

    var o = new flash.filters.GlowFilter(0xffff00, -100000, -100000, -100000, -100000, -100000);
    eq(o.color, 0xffff00);
    eq(o.alpha, 0);
    eq(o.blurX, 0);
    eq(o.blurY, 0);
    eq(o.strength, 0);
    eq(o.quality, 0);

    var o = new flash.filters.GlowFilter(0xffff00, 100000, 100000, 100000, 100000, 100000);
    eq(o.color, 0xffff00);
    eq(o.alpha, 1);
    eq(o.blurX, 255);
    eq(o.blurY, 255);
    eq(o.strength, 255);
    eq(o.quality, 15);

    var o1 = new flash.filters.GlowFilter(0xff00ff, 0.5, 8, 8, 2, 2, true, true);
    var o2 = o1.clone();
    eq(o2.color, 0xff00ff);
    eq(o2.alpha, 0.5);
    eq(o2.blurX, 8);
    eq(o2.blurY, 8);
    eq(o2.strength, 2);
    eq(o2.quality, 2);
    eq(o2.inner, true);
    eq(o2.knockout, true);

  });
})();
