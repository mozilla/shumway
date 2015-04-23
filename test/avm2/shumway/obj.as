package {

  (function () {
    var a = {x: 0, y: 0};
    for (var i = 0; i < 50; i++) {
      a.x += i;
      a.y += i;
    }
    trace(a.x + a.y);
  })();
}
