(function filterConvolution() {
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
})();
