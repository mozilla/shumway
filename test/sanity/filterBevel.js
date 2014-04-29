(function filterBevel() {
  unitTests.push(function testBevelFilter() {

    var o = new flash.filters.BevelFilter();
    eq(o.distance, 4);
    eq(o.angle, 45);
    eq(o.highlightColor, 0xffffff);
    eq(o.highlightAlpha, 1);
    eq(o.shadowColor, 0);
    eq(o.shadowAlpha, 1);
    eq(o.blurX, 4);
    eq(o.blurY, 4);
    eq(o.strength, 1);
    eq(o.quality, 1);
    eq(o.type, "inner");
    eq(o.knockout, false);

    var o = new flash.filters.BevelFilter(-100000, -100000, 0xff0000, -100000, 0xffff00, -100000, -100000, -100000, -100000, -100000);
    eq(o.distance, -100000);
    eq(o.angle, -280);
    eq(o.highlightColor, 0xff0000);
    eq(o.highlightAlpha, 0);
    eq(o.shadowColor, 0xffff00);
    eq(o.shadowAlpha, 0);
    eq(o.blurX, 0);
    eq(o.blurY, 0);
    eq(o.strength, 0);
    eq(o.quality, 0);

    var o = new flash.filters.BevelFilter(100000, 100000, 0xff0000, 100000, 0xffff00, 100000, 100000, 100000, 100000, 100000);
    eq(o.distance, 100000);
    eq(o.angle, 280);
    eq(o.highlightColor, 0xff0000);
    eq(o.highlightAlpha, 1);
    eq(o.shadowColor, 0xffff00);
    eq(o.shadowAlpha, 1);
    eq(o.blurX, 255);
    eq(o.blurY, 255);
    eq(o.strength, 255);
    eq(o.quality, 15);

    var o = new flash.filters.BevelFilter();
    o.type = flash.filters.BitmapFilterType.FULL;
    eq(o.type, "full");
    o.type = flash.filters.BitmapFilterType.INNER;
    eq(o.type, "inner");
    o.type = flash.filters.BitmapFilterType.OUTER;
    eq(o.type, "outer");
    o.type = "IllegalBitmapFilterType";
    eq(o.type, "full");
    try {
        o.type = null;
        check(false);
    }
    catch(e) {
        eq(o.type, "full");
    }
    try {
        o.type = undefined;
        check(false);
    }
    catch(e) {
        eq(o.type, "full");
    }

    var o1 = new flash.filters.BevelFilter(2, 180, 0xff0000, 0.5, 0xffff00, 0.25, 8, 8, 2, 2, flash.filters.BitmapFilterType.OUTER, true);
    var o2 = o1.clone();
    eq(o2.distance, 2);
    eq(o2.angle, 180);
    eq(o2.highlightColor, 0xff0000);
    eq(o2.highlightAlpha, 0.5);
    eq(o2.shadowColor, 0xffff00);
    eq(o2.shadowAlpha, 0.25);
    eq(o2.blurX, 8);
    eq(o2.blurY, 8);
    eq(o2.strength, 2);
    eq(o2.quality, 2);
    eq(o2.type, "outer");
    eq(o2.knockout, true);

  });
})();
