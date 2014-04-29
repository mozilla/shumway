(function filterColorMatrix() {
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

  });
})();
