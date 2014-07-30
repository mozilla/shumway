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

  var gradientArraysExpectedResults = [                              // idx: colors, alphas, ratios
    [[], [], []],                                                    // 0:   null, null, null,
    [[], [], []],                                                    // 1:   null, null, [],
    [[], [], []],                                                    // 2:   null, null, [32],
    [[], [], []],                                                    // 3:   null, null, [32,64],
    [[], [], []],                                                    // 4:   null, null, [32,64,128],
    [[], [], []],                                                    // 5:   null, [], null,
    [[], [], []],                                                    // 6:   null, [], [],
    [[], [], []],                                                    // 7:   null, [], [32],
    [[], [], []],                                                    // 8:   null, [], [32,64],
    [[], [], []],                                                    // 9:   null, [], [32,64,128],
    [[], [], []],                                                    // 10:  null, [0.2], null,
    [[], [], []],                                                    // 11:  null, [0.2], [],
    [[], [], []],                                                    // 12:  null, [0.2], [32],
    [[], [], []],                                                    // 13:  null, [0.2], [32,64],
    [[], [], []],                                                    // 14:  null, [0.2], [32,64,128],
    [[], [], []],                                                    // 15:  null, [0.2,0.4], null,
    [[], [], []],                                                    // 16:  null, [0.2,0.4], [],
    [[], [], []],                                                    // 17:  null, [0.2,0.4], [32],
    [[], [], []],                                                    // 18:  null, [0.2,0.4], [32,64],
    [[], [], []],                                                    // 19:  null, [0.2,0.4], [32,64,128],
    [[], [], []],                                                    // 20:  null, [0.2,0.4,0.6], null,
    [[], [], []],                                                    // 21:  null, [0.2,0.4,0.6], [],
    [[], [], []],                                                    // 22:  null, [0.2,0.4,0.6], [32],
    [[], [], []],                                                    // 23:  null, [0.2,0.4,0.6], [32,64],
    [[], [], []],                                                    // 24:  null, [0.2,0.4,0.6], [32,64,128],
    [[], [], []],                                                    // 25:  [], null, null,
    [[], [], []],                                                    // 26:  [], null, [],
    [[], [], []],                                                    // 27:  [], null, [32],
    [[], [], []],                                                    // 28:  [], null, [32,64],
    [[], [], []],                                                    // 29:  [], null, [32,64,128],
    [[], [], []],                                                    // 30:  [], [], null,
    [[], [], []],                                                    // 31:  [], [], [],
    [[], [], []],                                                    // 32:  [], [], [32],
    [[], [], []],                                                    // 33:  [], [], [32,64],
    [[], [], []],                                                    // 34:  [], [], [32,64,128],
    [[], [], []],                                                    // 35:  [], [0.2], null,
    [[], [], []],                                                    // 36:  [], [0.2], [],
    [[], [], []],                                                    // 37:  [], [0.2], [32],
    [[], [], []],                                                    // 38:  [], [0.2], [32,64],
    [[], [], []],                                                    // 39:  [], [0.2], [32,64,128],
    [[], [], []],                                                    // 40:  [], [0.2,0.4], null,
    [[], [], []],                                                    // 41:  [], [0.2,0.4], [],
    [[], [], []],                                                    // 42:  [], [0.2,0.4], [32],
    [[], [], []],                                                    // 43:  [], [0.2,0.4], [32,64],
    [[], [], []],                                                    // 44:  [], [0.2,0.4], [32,64,128],
    [[], [], []],                                                    // 45:  [], [0.2,0.4,0.6], null,
    [[], [], []],                                                    // 46:  [], [0.2,0.4,0.6], [],
    [[], [], []],                                                    // 47:  [], [0.2,0.4,0.6], [32],
    [[], [], []],                                                    // 48:  [], [0.2,0.4,0.6], [32,64],
    [[], [], []],                                                    // 49:  [], [0.2,0.4,0.6], [32,64,128],
    [[16711680], [0], [0]],                                          // 50:  [16711680], null, null,
    [[], [], []],                                                    // 51:  [16711680], null, [],
    [[16711680], [0], [32]],                                         // 52:  [16711680], null, [32],
    [[16711680], [0], [32]],                                         // 53:  [16711680], null, [32,64],
    [[16711680], [0], [32]],                                         // 54:  [16711680], null, [32,64,128],
    [[16711680], [1], [0]],                                          // 55:  [16711680], [], null,
    [[], [], []],                                                    // 56:  [16711680], [], [],
    [[16711680], [1], [32]],                                         // 57:  [16711680], [], [32],
    [[16711680], [1], [32]],                                         // 58:  [16711680], [], [32,64],
    [[16711680], [1], [32]],                                         // 59:  [16711680], [], [32,64,128],
    [[16711680], [0.2], [0]],                                        // 60:  [16711680], [0.2], null,
    [[], [], []],                                                    // 61:  [16711680], [0.2], [],
    [[16711680], [0.2], [32]],                                       // 62:  [16711680], [0.2], [32],
    [[16711680], [0.2], [32]],                                       // 63:  [16711680], [0.2], [32,64],
    [[16711680], [0.2], [32]],                                       // 64:  [16711680], [0.2], [32,64,128],
    [[16711680], [0.2], [0]],                                        // 65:  [16711680], [0.2,0.4], null,
    [[], [], []],                                                    // 66:  [16711680], [0.2,0.4], [],
    [[16711680], [0.2], [32]],                                       // 67:  [16711680], [0.2,0.4], [32],
    [[16711680], [0.2], [32]],                                       // 68:  [16711680], [0.2,0.4], [32,64],
    [[16711680], [0.2], [32]],                                       // 69:  [16711680], [0.2,0.4], [32,64,128],
    [[16711680], [0.2], [0]],                                        // 70:  [16711680], [0.2,0.4,0.6], null,
    [[], [], []],                                                    // 71:  [16711680], [0.2,0.4,0.6], [],
    [[16711680], [0.2], [32]],                                       // 72:  [16711680], [0.2,0.4,0.6], [32],
    [[16711680], [0.2], [32]],                                       // 73:  [16711680], [0.2,0.4,0.6], [32,64],
    [[16711680], [0.2], [32]],                                       // 74:  [16711680], [0.2,0.4,0.6], [32,64,128],
    [[16711680, 16776960], [0, 0], [0, 0]],                          // 75:  [16711680,16776960], null, null,
    [[], [], []],                                                    // 76:  [16711680,16776960], null, [],
    [[16711680], [0], [32]],                                         // 77:  [16711680,16776960], null, [32],
    [[16711680, 16776960], [0, 0], [32, 64]],                        // 78:  [16711680,16776960], null, [32,64],
    [[16711680, 16776960], [0, 0], [32, 64]],                        // 79:  [16711680,16776960], null, [32,64,128],
    [[16711680, 16776960], [1, 1], [0, 0]],                          // 80:  [16711680,16776960], [], null,
    [[], [], []],                                                    // 81:  [16711680,16776960], [], [],
    [[16711680], [1], [32]],                                         // 82:  [16711680,16776960], [], [32],
    [[16711680, 16776960], [1, 1], [32, 64]],                        // 83:  [16711680,16776960], [], [32,64],
    [[16711680, 16776960], [1, 1], [32, 64]],                        // 84:  [16711680,16776960], [], [32,64,128],
    [[16711680, 16776960], [0.2, 1], [0, 0]],                        // 85:  [16711680,16776960], [0.2], null,
    [[], [], []],                                                    // 86:  [16711680,16776960], [0.2], [],
    [[16711680], [0.2], [32]],                                       // 87:  [16711680,16776960], [0.2], [32],
    [[16711680, 16776960], [0.2, 1], [32, 64]],                      // 88:  [16711680,16776960], [0.2], [32,64],
    [[16711680, 16776960], [0.2, 1], [32, 64]],                      // 89:  [16711680,16776960], [0.2], [32,64,128],
    [[16711680, 16776960], [0.2, 0.4], [0, 0]],                      // 90:  [16711680,16776960], [0.2,0.4], null,
    [[], [], []],                                                    // 91:  [16711680,16776960], [0.2,0.4], [],
    [[16711680], [0.2], [32]],                                       // 92:  [16711680,16776960], [0.2,0.4], [32],
    [[16711680, 16776960], [0.2, 0.4], [32, 64]],                    // 93:  [16711680,16776960], [0.2,0.4], [32,64],
    [[16711680, 16776960], [0.2, 0.4], [32, 64]],                    // 94:  [16711680,16776960], [0.2,0.4], [32,64,128],
    [[16711680, 16776960], [0.2, 0.4], [0, 0]],                      // 95:  [16711680,16776960], [0.2,0.4,0.6], null,
    [[], [], []],                                                    // 96:  [16711680,16776960], [0.2,0.4,0.6], [],
    [[16711680], [0.2], [32]],                                       // 97:  [16711680,16776960], [0.2,0.4,0.6], [32],
    [[16711680, 16776960], [0.2, 0.4], [32, 64]],                    // 98:  [16711680,16776960], [0.2,0.4,0.6], [32,64],
    [[16711680, 16776960], [0.2, 0.4], [32, 64]],                    // 99:  [16711680,16776960], [0.2,0.4,0.6], [32,64,128],
    [[16711680, 16776960, 16777215], [0, 0, 0], [0, 0, 0]],          // 100: [16711680,16776960,16777215], null, null,
    [[], [], []],                                                    // 101: [16711680,16776960,16777215], null, [],
    [[16711680], [0], [32]],                                         // 102: [16711680,16776960,16777215], null, [32],
    [[16711680, 16776960], [0, 0], [32, 64]],                        // 103: [16711680,16776960,16777215], null, [32,64],
    [[16711680, 16776960, 16777215], [0, 0, 0], [32, 64, 128]],      // 104: [16711680,16776960,16777215], null, [32,64,128],
    [[16711680, 16776960, 16777215], [1, 1, 1], [0, 0, 0]],          // 105: [16711680,16776960,16777215], [], null,
    [[], [], []],                                                    // 106: [16711680,16776960,16777215], [], [],
    [[16711680], [1], [32]],                                         // 107: [16711680,16776960,16777215], [], [32],
    [[16711680, 16776960], [1, 1], [32, 64]],                        // 108: [16711680,16776960,16777215], [], [32,64],
    [[16711680, 16776960, 16777215], [1, 1, 1], [32, 64, 128]],      // 109: [16711680,16776960,16777215], [], [32,64,128],
    [[16711680, 16776960, 16777215], [0.2, 1, 1], [0, 0, 0]],        // 110: [16711680,16776960,16777215], [0.2], null,
    [[], [], []],                                                    // 111: [16711680,16776960,16777215], [0.2], [],
    [[16711680], [0.2], [32]],                                       // 112: [16711680,16776960,16777215], [0.2], [32],
    [[16711680, 16776960], [0.2, 1], [32, 64]],                      // 113: [16711680,16776960,16777215], [0.2], [32,64],
    [[16711680, 16776960, 16777215], [0.2, 1, 1], [32, 64, 128]],    // 114: [16711680,16776960,16777215], [0.2], [32,64,128],
    [[16711680, 16776960, 16777215], [0.2, 0.4, 1], [0, 0, 0]],      // 115: [16711680,16776960,16777215], [0.2,0.4], null,
    [[], [], []],                                                    // 116: [16711680,16776960,16777215], [0.2,0.4], [],
    [[16711680], [0.2], [32]],                                       // 117: [16711680,16776960,16777215], [0.2,0.4], [32],
    [[16711680, 16776960], [0.2, 0.4], [32, 64]],                    // 118: [16711680,16776960,16777215], [0.2,0.4], [32,64],
    [[16711680, 16776960, 16777215], [0.2, 0.4, 1], [32, 64, 128]],  // 119: [16711680,16776960,16777215], [0.2,0.4], [32,64,128],
    [[16711680, 16776960, 16777215], [0.2, 0.4, 0.6], [0, 0, 0]],    // 120: [16711680,16776960,16777215], [0.2,0.4,0.6], null,
    [[], [], []],                                                    // 121: [16711680,16776960,16777215], [0.2,0.4,0.6], [],
    [[16711680], [0.2], [32]],                                       // 122: [16711680,16776960,16777215], [0.2,0.4,0.6], [32],
    [[16711680, 16776960], [0.2, 0.4], [32, 64]],                    // 123: [16711680,16776960,16777215], [0.2,0.4,0.6], [32,64],
    [[16711680, 16776960, 16777215], [0.2, 0.4, 0.6], [32, 64, 128]] // 124: [16711680,16776960,16777215], [0.2,0.4,0.6], [32,64,128],
  ];

  unitTests.push(function testGradientBevelFilter() {

    var o = new flash.filters.GradientBevelFilter();
    eq(o.distance, 4);
    eq(o.angle, 45);
    eq(o.blurX, 4);
    eq(o.blurY, 4);
    eq(o.strength, 1);
    eq(o.quality, 1);
    eq(o.type, "inner");
    eq(o.knockout, false);
    eqArray(o.colors, []);
    eqArray(o.alphas, []);
    eqArray(o.ratios, []);

    var o = new flash.filters.GradientBevelFilter(-100000, -100000, null, null, null, -100000, -100000, -100000, -100000);
    eq(o.distance, -100000);
    eq(o.angle, -280);
    eq(o.blurX, 0);
    eq(o.blurY, 0);
    eq(o.strength, 0);
    eq(o.quality, 0);

    var o = new flash.filters.GradientBevelFilter(100000, 100000, null, null, null, 100000, 100000, 100000, 100000);
    eq(o.distance, 100000);
    eq(o.angle, 280);
    eq(o.blurX, 255);
    eq(o.blurY, 255);
    eq(o.strength, 255);
    eq(o.quality, 15);

    var colors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
    var o = new flash.filters.GradientBevelFilter(4, 45, colors);
    eqArray(o.colors, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

    var colorsNull = null;
    var colors0 = [];
    var colors1 = [0xff0000];
    var colors2 = [0xff0000, 0xffff00];
    var colors3 = [0xff0000, 0xffff00, 0xffffff];
    var alphasNull = null;
    var alphas0 = [];
    var alphas1 = [0.2];
    var alphas2 = [0.2, 0.4];
    var alphas3 = [0.2, 0.4, 0.6];
    var ratiosNull = null;
    var ratios0 = [];
    var ratios1 = [32];
    var ratios2 = [32, 64];
    var ratios3 = [32, 64, 128];

    var colorsAll = [colorsNull, colors0, colors1, colors2, colors3];
    var alphasAll = [alphasNull, alphas0, alphas1, alphas2, alphas3];
    var ratiosAll = [ratiosNull, ratios0, ratios1, ratios2, ratios3];

    var expected = gradientArraysExpectedResults;

    var g, i = 0, d;
    for (var c = 0; c < colorsAll.length; c++) {
      for (var a = 0; a < alphasAll.length; a++) {
        for (var r = 0; r < ratiosAll.length; r++) {
          g = new flash.filters.GradientBevelFilter(4, 45, colorsAll[c], alphasAll[a], ratiosAll[r]);
          d = "c" + c + ":" + (colorsAll[c] ? "["+colorsAll[c]+"]" : "null") +
             ",a" + a + ":" + (alphasAll[a] ? "["+alphasAll[a]+"]" : "null") +
             ",r" + r + ":" + (ratiosAll[r] ? "["+ratiosAll[r]+"]" : "null") +
             ",i:" + i;
          eqArray(g.colors, expected[i][0], d + " COLORS, got: [" + g.colors + "], expected: [" + expected[i][0] + "]");
          eqArray(g.alphas, expected[i][1], d + " ALPHAS, got: [" + g.alphas + "], expected: [" + expected[i][1] + "]");
          eqArray(g.ratios, expected[i][2], d + " RATIOS, got: [" + g.ratios + "], expected: [" + expected[i][2] + "]");
          i++;
        }
      }
    }

    var o = new flash.filters.GradientBevelFilter();
    o.colors = [0xff0000, 0xffff00];
    eqArray(o.colors, [16711680, 16776960]);
    eqArray(o.alphas, [0, 0]);
    eqArray(o.ratios, [0, 0]);

    var o = new flash.filters.GradientBevelFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.colors = [];
    eqArray(o.colors, []);
    eqArray(o.alphas, []);
    eqArray(o.ratios, []);

    var o = new flash.filters.GradientBevelFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.colors = [0xff0000, 0xffff00];
    eqArray(o.colors, [16711680, 16776960]);
    eqArray(o.alphas, [0.2, 0.4]);
    eqArray(o.ratios, [1, 2]);

    var o = new flash.filters.GradientBevelFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.colors = [0xff0000, 0xffff00, 1, 2, 3, 4];
    eqArray(o.colors, [16711680, 16776960, 1, 2, 3, 4]);
    eqArray(o.alphas, [0.2, 0.4, 0.6, 0.8, 0, 0]);
    eqArray(o.ratios, [1, 2, 3, 4, 0, 0]);

    var o = new flash.filters.GradientBevelFilter();
    o.alphas = [0.2];
    eqArray(o.colors, []);
    eqArray(o.alphas, []);
    eqArray(o.ratios, []);

    var o = new flash.filters.GradientBevelFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.alphas = [];
    eqArray(o.colors, [1, 2, 3, 4]);
    eqArray(o.alphas, [1, 1, 1, 1]);
    eqArray(o.ratios, [1, 2, 3, 4]);

    var o = new flash.filters.GradientBevelFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.alphas = [0.4, 0.4, 0.4, 0.4, 0.4, 0.4];
    eqArray(o.colors, [1, 2, 3, 4]);
    eqArray(o.alphas, [0.4, 0.4, 0.4, 0.4]);
    eqArray(o.ratios, [1, 2, 3, 4]);

    var o = new flash.filters.GradientBevelFilter();
    o.ratios = [32, 64, 128];
    eqArray(o.colors, []);
    eqArray(o.alphas, []);
    eqArray(o.ratios, []);

    var o = new flash.filters.GradientBevelFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.ratios = [];
    eqArray(o.colors, []);
    eqArray(o.alphas, []);
    eqArray(o.ratios, []);

    var o = new flash.filters.GradientBevelFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.ratios = [32, 64];
    eqArray(o.colors, [1, 2]);
    eqArray(o.alphas, [0.2, 0.4]);
    eqArray(o.ratios, [32, 64]);

    var o = new flash.filters.GradientBevelFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.ratios = [32, 64, 128, 192, 255];
    eqArray(o.colors, [1, 2, 3, 4]);
    eqArray(o.alphas, [0.2, 0.4, 0.6, 0.8]);
    eqArray(o.ratios, [32, 64, 128, 192]);

    var o = new flash.filters.GradientBevelFilter();
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

    var o = new flash.filters.GradientBevelFilter(4, 45, [0xff0000, 0xffff00], [0.4, 0.6], [128, 255]);
    neq(o.colors, o.colors);
    neq(o.alphas, o.alphas);
    neq(o.ratios, o.ratios);
    o.colors[1] = 0xffffff;
    eq(o.colors[1], 0xffff00);
    o.alphas[1] = 0.8;
    eq(o.alphas[1], 0.6);
    o.ratios[1] = 192;
    eq(o.ratios[1], 255);

    var o = new flash.filters.GradientBevelFilter(4, 45, [-100, 0x1ffffff], [-100, 100], [-100, 10000]);
    eq(o.colors[0], 0xffff9c);
    eq(o.colors[1], 0xffffff);
    eq(o.alphas[0], 0);
    eq(o.alphas[1], 1);
    eq(o.ratios[0], 0);
    eq(o.ratios[1], 255);

    var o1 = new flash.filters.GradientBevelFilter(4, 45, [-100, 0x1ffffff], [-100, 100], [-100, 10000]);
    var o2 = o1.clone();
    eq(o2.distance, 4);
    eq(o2.angle, 45);
    eq(o2.colors[0], 0xffff9c);
    eq(o2.colors[1], 0xffffff);
    eq(o2.alphas[0], 0);
    eq(o2.alphas[1], 1);
    eq(o2.ratios[0], 0);
    eq(o2.ratios[1], 255);

  });

  unitTests.push(function testGradientGlowFilter() {

    var o = new flash.filters.GradientGlowFilter();
    eq(o.distance, 4);
    eq(o.angle, 45);
    eq(o.blurX, 4);
    eq(o.blurY, 4);
    eq(o.strength, 1);
    eq(o.quality, 1);
    eq(o.type, "inner");
    eq(o.knockout, false);
    eqArray(o.colors, []);
    eqArray(o.alphas, []);
    eqArray(o.ratios, []);

    var o = new flash.filters.GradientGlowFilter(-100000, -100000, null, null, null, -100000, -100000, -100000, -100000);
    eq(o.distance, -100000);
    eq(o.angle, -280);
    eq(o.blurX, 0);
    eq(o.blurY, 0);
    eq(o.strength, 0);
    eq(o.quality, 0);

    var o = new flash.filters.GradientGlowFilter(100000, 100000, null, null, null, 100000, 100000, 100000, 100000);
    eq(o.distance, 100000);
    eq(o.angle, 280);
    eq(o.blurX, 255);
    eq(o.blurY, 255);
    eq(o.strength, 255);
    eq(o.quality, 15);

    var colors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
    var o = new flash.filters.GradientGlowFilter(4, 45, colors);
    eqArray(o.colors, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

    var colorsNull = null;
    var colors0 = [];
    var colors1 = [0xff0000];
    var colors2 = [0xff0000, 0xffff00];
    var colors3 = [0xff0000, 0xffff00, 0xffffff];
    var alphasNull = null;
    var alphas0 = [];
    var alphas1 = [0.2];
    var alphas2 = [0.2, 0.4];
    var alphas3 = [0.2, 0.4, 0.6];
    var ratiosNull = null;
    var ratios0 = [];
    var ratios1 = [32];
    var ratios2 = [32, 64];
    var ratios3 = [32, 64, 128];

    var colorsAll = [colorsNull, colors0, colors1, colors2, colors3];
    var alphasAll = [alphasNull, alphas0, alphas1, alphas2, alphas3];
    var ratiosAll = [ratiosNull, ratios0, ratios1, ratios2, ratios3];

    var expected = gradientArraysExpectedResults;

    var g, i = 0, d;
    for (var c = 0; c < colorsAll.length; c++) {
      for (var a = 0; a < alphasAll.length; a++) {
        for (var r = 0; r < ratiosAll.length; r++) {
          g = new flash.filters.GradientGlowFilter(4, 45, colorsAll[c], alphasAll[a], ratiosAll[r]);
          d = "c" + c + ":" + (colorsAll[c] ? "["+colorsAll[c]+"]" : "null") +
             ",a" + a + ":" + (alphasAll[a] ? "["+alphasAll[a]+"]" : "null") +
             ",r" + r + ":" + (ratiosAll[r] ? "["+ratiosAll[r]+"]" : "null") +
             ",i:" + i;
          eqArray(g.colors, expected[i][0], d + " COLORS, got: [" + g.colors + "], expected: [" + expected[i][0] + "]");
          eqArray(g.alphas, expected[i][1], d + " ALPHAS, got: [" + g.alphas + "], expected: [" + expected[i][1] + "]");
          eqArray(g.ratios, expected[i][2], d + " RATIOS, got: [" + g.ratios + "], expected: [" + expected[i][2] + "]");
          i++;
        }
      }
    }

    var o = new flash.filters.GradientGlowFilter();
    o.colors = [0xff0000, 0xffff00];
    eqArray(o.colors, [16711680, 16776960]);
    eqArray(o.alphas, [0, 0]);
    eqArray(o.ratios, [0, 0]);

    var o = new flash.filters.GradientGlowFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.colors = [];
    eqArray(o.colors, []);
    eqArray(o.alphas, []);
    eqArray(o.ratios, []);

    var o = new flash.filters.GradientGlowFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.colors = [0xff0000, 0xffff00];
    eqArray(o.colors, [16711680, 16776960]);
    eqArray(o.alphas, [0.2, 0.4]);
    eqArray(o.ratios, [1, 2]);

    var o = new flash.filters.GradientGlowFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.colors = [0xff0000, 0xffff00, 1, 2, 3, 4];
    eqArray(o.colors, [16711680, 16776960, 1, 2, 3, 4]);
    eqArray(o.alphas, [0.2, 0.4, 0.6, 0.8, 0, 0]);
    eqArray(o.ratios, [1, 2, 3, 4, 0, 0]);

    var o = new flash.filters.GradientGlowFilter();
    o.alphas = [0.2];
    eqArray(o.colors, []);
    eqArray(o.alphas, []);
    eqArray(o.ratios, []);

    var o = new flash.filters.GradientGlowFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.alphas = [];
    eqArray(o.colors, [1, 2, 3, 4]);
    eqArray(o.alphas, [1, 1, 1, 1]);
    eqArray(o.ratios, [1, 2, 3, 4]);

    var o = new flash.filters.GradientGlowFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.alphas = [0.4, 0.4, 0.4, 0.4, 0.4, 0.4];
    eqArray(o.colors, [1, 2, 3, 4]);
    eqArray(o.alphas, [0.4, 0.4, 0.4, 0.4]);
    eqArray(o.ratios, [1, 2, 3, 4]);

    var o = new flash.filters.GradientGlowFilter();
    o.ratios = [32, 64, 128];
    eqArray(o.colors, []);
    eqArray(o.alphas, []);
    eqArray(o.ratios, []);

    var o = new flash.filters.GradientGlowFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.ratios = [];
    eqArray(o.colors, []);
    eqArray(o.alphas, []);
    eqArray(o.ratios, []);

    var o = new flash.filters.GradientGlowFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.ratios = [32, 64];
    eqArray(o.colors, [1, 2]);
    eqArray(o.alphas, [0.2, 0.4]);
    eqArray(o.ratios, [32, 64]);

    var o = new flash.filters.GradientGlowFilter(4, 45, [1, 2, 3, 4], [0.2, 0.4, 0.6, 0.8], [1, 2, 3, 4]);
    o.ratios = [32, 64, 128, 192, 255];
    eqArray(o.colors, [1, 2, 3, 4]);
    eqArray(o.alphas, [0.2, 0.4, 0.6, 0.8]);
    eqArray(o.ratios, [32, 64, 128, 192]);

    var o = new flash.filters.GradientGlowFilter();
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

    var o = new flash.filters.GradientGlowFilter(4, 45, [0xff0000, 0xffff00], [0.4, 0.6], [128, 255]);
    neq(o.colors, o.colors);
    neq(o.alphas, o.alphas);
    neq(o.ratios, o.ratios);
    o.colors[1] = 0xffffff;
    eq(o.colors[1], 0xffff00);
    o.alphas[1] = 0.8;
    eq(o.alphas[1], 0.6);
    o.ratios[1] = 192;
    eq(o.ratios[1], 255);

    var o = new flash.filters.GradientGlowFilter(4, 45, [-100, 0x1ffffff], [-100, 100], [-100, 10000]);
    eq(o.colors[0], 0xffff9c);
    eq(o.colors[1], 0xffffff);
    eq(o.alphas[0], 0);
    eq(o.alphas[1], 1);
    eq(o.ratios[0], 0);
    eq(o.ratios[1], 255);

    var o1 = new flash.filters.GradientGlowFilter(4, 45, [-100, 0x1ffffff], [-100, 100], [-100, 10000]);
    var o2 = o1.clone();
    eq(o2.distance, 4);
    eq(o2.angle, 45);
    eq(o2.colors[0], 0xffff9c);
    eq(o2.colors[1], 0xffffff);
    eq(o2.alphas[0], 0);
    eq(o2.alphas[1], 1);
    eq(o2.ratios[0], 0);
    eq(o2.ratios[1], 255);

  });

})();
