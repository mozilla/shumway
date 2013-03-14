const count = 16;

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

