(function filters() {

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

  unitTests.push(function testColorMatrixFilter() {

    var o = new flash.filters.ColorMatrixFilter();
    eqArray(o.matrix, [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]);

    var o = new flash.filters.ColorMatrixFilter([]);
    eqArray(o.matrix, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    var o = new flash.filters.ColorMatrixFilter([2, 2, 2, 2, 2]);
    eqArray(o.matrix, [2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    var o = new flash.filters.ColorMatrixFilter([2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3]);
    eqArray(o.matrix, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);

    var m = [
        1, 2, 3, 4, 5,
        "6",
        [7],
        { valueOf: function() { return 8; } },
        { toString: function() { return "9"; } },
        "hello"
    ];
    var o = new flash.filters.ColorMatrixFilter(m);
    eqArray(o.matrix, [1, 2, 3, 4, 5, 6, 7, 8, 9, NaN, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    var o = new flash.filters.ColorMatrixFilter([1]);
    neq(o.matrix, o.matrix);
    o.matrix[0] = 123;
    eq(o.matrix[0], 1);

    var o1 = new flash.filters.ColorMatrixFilter();
    var o2 = o1.clone();
    neq(o1.matrix, o2.matrix);
    eqArray(o1.matrix, o2.matrix);

  });

  unitTests.push(function testConvolutionFilter() {

    var o = new flash.filters.ConvolutionFilter();
    eq(o.matrixX, 0);
    eq(o.matrixY, 0);
    eqArray(o.matrix, []);
    eq(o.divisor, 1);
    eq(o.bias, 0);
    eq(o.preserveAlpha, true);
    eq(o.clamp, true);
    eq(o.color, 0);
    eq(o.alpha, 0);

    var o = new flash.filters.ConvolutionFilter(-100000, -100000, [], -100000, -100000, true, true, 0xff0000, -100000);
    eq(o.matrixX, 0);
    eq(o.matrixY, 0);
    eqArray(o.matrix, []);
    eq(o.divisor, -100000);
    eq(o.bias, -100000);
    eq(o.preserveAlpha, true);
    eq(o.clamp, true);
    eq(o.color, 0xff0000);
    eq(o.alpha, 0);

    var o = new flash.filters.ConvolutionFilter(100000, 100000, [], 100000, 100000, true, true, 0xff0000, 100000);
    eq(o.matrixX, 15);
    eq(o.matrixY, 15);
    eq(o.matrix.length, 225);
    eq(o.divisor, 100000);
    eq(o.bias, 100000);
    eq(o.preserveAlpha, true);
    eq(o.clamp, true);
    eq(o.color, 0xff0000);
    eq(o.alpha, 1);

    var o = new flash.filters.ConvolutionFilter(2, 2);
    eq(o.matrixX, 2);
    eq(o.matrixY, 2);
    eqArray(o.matrix, [0, 0, 0, 0]);

    var o = new flash.filters.ConvolutionFilter(2, 2, []);
    eq(o.matrixX, 2);
    eq(o.matrixY, 2);
    eqArray(o.matrix, [0, 0, 0, 0]);

    var o = new flash.filters.ConvolutionFilter(2, 2, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    eq(o.matrixX, 2);
    eq(o.matrixY, 2);
    eqArray(o.matrix, [1, 2, 3, 4]);

    var o = new flash.filters.ConvolutionFilter(4, 4, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    eq(o.matrixX, 4);
    eq(o.matrixY, 4);
    eqArray(o.matrix, [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0, 0]);

    var o = new flash.filters.ConvolutionFilter(2, 2, [1, 2, 3, 4]);
    o.matrixX = 3;
    o.matrixY = 3;
    o.matrix = [11, 12, 13, 14, 15, 16, 17, 18, 19];
    eq(o.matrixX, 3);
    eq(o.matrixY, 3);
    eqArray(o.matrix, [11, 12, 13, 14, 15, 16, 17, 18, 19]);

    var o = new flash.filters.ConvolutionFilter(2, 2, [1, 2, 3, 4]);
    o.matrix = [11, 12, 13, 14, 15, 16, 17, 18, 19];
    o.matrixX = 3;
    o.matrixY = 3;
    eq(o.matrixX, 3);
    eq(o.matrixY, 3);
    eqArray(o.matrix, [11, 12, 13, 14, 0, 0, 0, 0, 0]);

    var o = new flash.filters.ConvolutionFilter(3, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    o.matrixX = 2;
    o.matrixY = 2;
    eqArray(o.matrix, [1, 2, 3, 4]);
    o.matrixX = 3;
    o.matrixY = 3;
    eqArray(o.matrix, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    o.matrixX = 4;
    o.matrixY = 4;
    eqArray(o.matrix, [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0, 0, 0, 0]);

    var o = new flash.filters.ConvolutionFilter(2, 2, [1, 2, 3, 4]);
    neq(o.matrix, o.matrix);
    o.matrix[3] = 123;
    eq(o.matrix[3], 4);

    var o1 = new flash.filters.ConvolutionFilter(2, 2, [1, 2, 3, 4]);
    var o2 = o1.clone();
    neq(o1.matrix, o2.matrix);
    eqArray(o1.matrix, o2.matrix);

  });

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
