package {
  (function () {
    var count = 16;

    function foo() {
      var a = [];
      for (var i = 0; i < count; i++) {
        a.push(i);
      }
      for (var j = 0; j < 1024; j++) {
        for (var i = 2; i < count; i++) {
          a[i] = a[i - 1] + a[i - 2];
        }
      }
      trace(a.length);
    }
    foo();
  })();

  (function () {
    var a = [];
    a.push(9);
    a.push(1);
    a.AS3::push(2);
    trace(a);
    a.pop();
    a.AS3::pop();
    trace(a);
    a.unshift(0);
    a.AS3::unshift(-1);
    trace(a);
  })();

  (function () {
    var a = [];
    a.push(9);
    a.push(1);
    a.push(5);
    trace(a);
    a.reverse();
    trace(a);
    a.AS3::reverse();
    trace(a);
  })();

  (function () {
    var a = [];
    a.push(9);
    a.push(1);
    a.push(5);
    trace(a);
    a = a.concat([7, 8, 9]);
    trace(a);
    a = a.AS3::concat(["A", "B", "C"]);
    trace(a);
  })();

  (function () {
    var a = [];
    a.push(9);
    a.push(1);
    a.push(5);
    a = a.concat([7, 8, 9]);
    a = a.AS3::concat(["A", "B", "B", "C"]);
    trace(a.indexOf("B"));
    trace(a.AS3::indexOf("B"));
    trace(a.lastIndexOf("B"));
    trace(a.AS3::lastIndexOf("B"));
  })();

  (function () {
    var a = [0, 1, 2, 3, 4];
    a.every(function (v, i) {
      trace(i + ": " + v);
      return;
    });
    a.every(function (v, i) {
      trace(i + ": " + v);
      return true;
    });
    a.AS3::every(function (v, i) {
      trace(i + ": " + v);
      return true;
    });
  })();

  (function () {
    var a = [0, 1, 2, 3, 4];
    var b = a.AS3::filter(function (v, i) {
      trace(i + ": " + v);
      return 1; // Weird, truty doesn't count but true does.
    });
    trace(b.length);
    var b = a.AS3::filter(function (v, i) {
      trace(i + ": " + v);
      return true;
    });
    trace(b.length);
  })();

  (function () {
    var a = [0, 1, 2, 3, 4];
    Array.prototype.reverse.call(a);
    trace(a);
  })();

//  (function () {
//    var a = {length: 10};
//    Array.prototype.push.call(a, "Hello");
//    trace(a[9]);
//    trace(a[10]);
//    trace(a[11]);
//  })();

  trace("-- DONE --");
}