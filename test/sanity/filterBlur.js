(function filterBlur() {
  unitTests.push(function testBlurFilter() {

    var o = new flash.filters.BlurFilter();
    eq(o.blurX, 4);
    eq(o.blurY, 4);
    eq(o.quality, 1);

    var o = new flash.filters.BlurFilter(-100000, -100000, -100000);
    eq(o.blurX, 0);
    eq(o.blurY, 0);
    eq(o.quality, 0);

    var o = new flash.filters.BlurFilter(100000, 100000, 100000);
    eq(o.blurX, 255);
    eq(o.blurY, 255);
    eq(o.quality, 15);

    var o1 = new flash.filters.BlurFilter(1, 2, 3);
    var o2 = o1.clone();
    eq(o2.blurX, 1);
    eq(o2.blurY, 2);
    eq(o2.quality, 3);

  });
})();
